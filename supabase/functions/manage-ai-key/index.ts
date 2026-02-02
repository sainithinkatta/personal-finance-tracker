import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * ENCRYPTION UTILITIES
 * Uses AES-256-GCM with a master secret for symmetric encryption.
 * The master secret is derived to a 256-bit key using SHA-256.
 * Each encryption generates a random 12-byte IV.
 * Format stored: base64(IV + ciphertext + authTag)
 * 
 * SECURITY: Never log plain keys or decrypted values!
 */

async function deriveKey(masterSecret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(masterSecret)
  );
  return crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptKey(plainKey: string, masterSecret: string): Promise<string> {
  const key = await deriveKey(masterSecret);
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plainKey)
  );
  
  // Combine IV + ciphertext into single array
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  // Return as base64
  return btoa(String.fromCharCode(...combined));
}

async function decryptKey(encryptedBase64: string, masterSecret: string): Promise<string> {
  const key = await deriveKey(masterSecret);
  
  // Decode base64 to bytes
  const combined = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));
  
  // Extract IV (first 12 bytes) and ciphertext (rest)
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );
  
  return new TextDecoder().decode(decrypted);
}

/**
 * Validates a Gemini API key by making a test request.
 * Returns true if valid, false otherwise.
 */
async function validateGeminiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    // Use a lightweight models.list endpoint to validate
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    if (response.ok) {
      return { valid: true };
    }
    
    const data = await response.json();
    if (response.status === 400 || response.status === 401 || response.status === 403) {
      return { valid: false, error: data.error?.message || "Invalid API key" };
    }
    
    // Other errors (rate limit, server error) - treat as potentially valid
    console.log("Gemini validation got non-auth error, treating as valid:", response.status);
    return { valid: true };
  } catch (error) {
    console.error("Error validating Gemini key:", error);
    // Network error - don't block the user, assume valid
    return { valid: true };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get encryption secret
    const encryptionSecret = Deno.env.get("AI_KEY_ENCRYPTION_SECRET");
    if (!encryptionSecret) {
      console.error("AI_KEY_ENCRYPTION_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Get auth token from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's auth token to get user ID
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;

    // Create admin client for database operations (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { action, key } = await req.json();

    switch (action) {
      case "check": {
        // Check if user has a key configured (return boolean only, never the key)
        const { data, error } = await supabaseAdmin
          .from("user_ai_settings")
          .select("user_id")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) {
          console.error("Error checking AI settings:", error);
          return new Response(
            JSON.stringify({ error: "Database error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ hasKey: !!data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "save": {
        // Validate input
        if (!key || typeof key !== "string") {
          return new Response(
            JSON.stringify({ error: "API key is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (key.length < 10 || key.length > 200) {
          return new Response(
            JSON.stringify({ error: "API key must be between 10 and 200 characters" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Validate the key with Gemini API
        const validation = await validateGeminiKey(key);
        if (!validation.valid) {
          return new Response(
            JSON.stringify({ 
              error: "INVALID_KEY", 
              message: validation.error || "The API key is invalid. Please check and try again." 
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // SECURITY: Encrypt the key before storing
        // Never log 'key' variable!
        const encryptedKey = await encryptKey(key, encryptionSecret);

        // Upsert (insert or update) the encrypted key
        const { error: upsertError } = await supabaseAdmin
          .from("user_ai_settings")
          .upsert(
            {
              user_id: userId,
              gemini_key_encrypted: encryptedKey,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );

        if (upsertError) {
          console.error("Error saving AI settings:", upsertError);
          return new Response(
            JSON.stringify({ error: "Failed to save API key" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`AI key saved for user ${userId}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "remove": {
        // Delete the user's AI settings row
        const { error: deleteError } = await supabaseAdmin
          .from("user_ai_settings")
          .delete()
          .eq("user_id", userId);

        if (deleteError) {
          console.error("Error removing AI settings:", deleteError);
          return new Response(
            JSON.stringify({ error: "Failed to remove API key" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`AI key removed for user ${userId}`);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action. Use 'check', 'save', or 'remove'" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Error in manage-ai-key function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
