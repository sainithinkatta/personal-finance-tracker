import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * ENCRYPTION UTILITIES
 * Matches the encryption logic in manage-ai-key function.
 * Uses AES-256-GCM with SHA-256 derived key from master secret.
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
    ["decrypt"]
  );
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
 * Fetches and decrypts the user's Gemini API key from user_ai_settings.
 * Returns null if no key is configured.
 * 
 * SECURITY: Uses service role to bypass RLS since we've already authenticated the user.
 */
async function getUserGeminiKey(userId: string): Promise<{ key: string | null; error?: string }> {
  const encryptionSecret = Deno.env.get('AI_KEY_ENCRYPTION_SECRET');
  if (!encryptionSecret) {
    console.error('AI_KEY_ENCRYPTION_SECRET not configured');
    return { key: null, error: 'SERVER_CONFIG_ERROR' };
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data, error } = await adminClient
    .from('user_ai_settings')
    .select('gemini_key_encrypted')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user AI settings:', error);
    return { key: null, error: 'DB_ERROR' };
  }

  if (!data || !data.gemini_key_encrypted) {
    return { key: null, error: 'AI_KEY_MISSING' };
  }

  try {
    // SECURITY: Decrypt the key - never log this value!
    const decryptedKey = await decryptKey(data.gemini_key_encrypted, encryptionSecret);
    return { key: decryptedKey };
  } catch (decryptError) {
    console.error('Error decrypting user Gemini key:', decryptError);
    return { key: null, error: 'DECRYPT_ERROR' };
  }
}

/**
 * Records import history using service role to bypass RLS
 */
async function recordImportHistory(
  userId: string,
  bankAccountId: string,
  fileName: string,
  fileSize: number,
  importedCount: number,
  skippedCount: number,
  duplicateCount: number
): Promise<void> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    
    const { error: historyError } = await adminClient
      .from('import_history')
      .insert({
        user_id: userId,
        bank_account_id: bankAccountId,
        file_name: fileName,
        file_size: fileSize,
        imported_count: importedCount,
        skipped_count: skippedCount,
        duplicate_count: duplicateCount
      });
    
    if (historyError) {
      console.error('Failed to record import history:', historyError);
    } else {
      console.log('Import history recorded successfully');
    }
  } catch (historyErr) {
    console.error('Error recording import history:', historyErr);
  }
}

interface ParsedTransaction {
  transaction_date: string;
  description_raw: string;
  description_clean: string;
  amount: number;
  direction: 'debit' | 'credit';
  status: 'posted' | 'pending';
  category: 'Groceries' | 'Food' | 'Travel' | 'Bills' | 'Others';
}

interface ExpenseRow {
  user_id: string;
  bank_account_id: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  description: string;
}

const GEMINI_PROMPT = `You are a bank statement parser. Extract ALL transactions from this bank statement.

RULES:
1. Include both "Recent Transactions" and "Pending Transactions"
2. For each transaction, determine:
   - transaction_date (YYYY-MM-DD format, prefer Transaction Date over Posting Date if both exist)
   - description_raw (original text from statement)
   - description_clean (cleaned, human-readable label)
   - amount (numeric, always positive number)
   - direction ("debit" for money going OUT/spent, "credit" for money coming IN/refunds/deposits)
   - status ("posted" or "pending")
   - category (one of: Groceries, Food, Travel, Bills, Others)

3. Category mapping:
   - Food: restaurants, cafes, fast food, food delivery, coffee shops, tiffins (Uber Eats, Starbucks, DoorDash, etc.)
   - Travel: rides, taxis, public transport, fuel (Uber Trip, Lyft, gas stations)
   - Groceries: supermarkets, grocery stores (Walmart Grocery, Costco, Trader Joe's, etc.)
   - Bills: subscriptions, utilities, recurring services (Amazon Prime, Netflix, OPENAI, phone/internet bills)
   - Others: general shopping, e-commerce, department stores, or anything unclear

4. Description cleaning rules - produce short human-readable labels:
   - Remove long numeric IDs, extra trailing numbers
   - Remove city/state codes (e.g., KANSAS CITY MO)
   - Remove noise tokens: POS, ONLINE PMT, AUTH ONLY, APPLE PAY, DEBIT CARD, etc.
   - Examples:
     * "UBER *EATS 866-576-1039 CA" → "Uber Eats"
     * "UBER *TRIP 866-576-1039 CA" → "Uber Travel"
     * "STARBUCKS 1234 KANSAS CITY MO" → "Starbucks"
     * "AMAZON MKTPL*BT1F27GK1 AMZN.COM/BILLWA" → "Amazon Purchase"
     * "SQ *AMARAVATI TIFFINS KANSAS CITY MO" → "Amaravati Tiffins"

5. Determining direction (IMPORTANT):
   - Debit = money OUT (purchases, payments, withdrawals) - usually shown as negative or with minus sign
   - Credit = money IN (deposits, refunds, cashback) - usually shown as positive or with plus sign
   - Look for indicators like +/- signs, CR/DR labels, or column headers

Return ONLY a valid JSON array of transactions with this exact structure:
[
  {
    "transaction_date": "2024-01-15",
    "description_raw": "UBER *EATS 866-576-1039 CA",
    "description_clean": "Uber Eats",
    "amount": 25.99,
    "direction": "debit",
    "status": "posted",
    "category": "Food"
  }
]

Do not include any text before or after the JSON array. Only output valid JSON.`;

/**
 * Generates a unique key for a transaction based on its identity fields.
 * Used for deduplication within a batch and against existing DB records.
 * 
 * Trade-off: If two truly identical transactions occur on the same day at the same 
 * merchant (same amount, same description), they will be treated as duplicates.
 * This is acceptable for preventing statement re-import duplicates.
 */
function generateTransactionKey(tx: ExpenseRow): string {
  return [
    tx.user_id,
    tx.bank_account_id,
    tx.date,
    tx.amount.toFixed(2),
    tx.currency,
    tx.category,
    (tx.description || '').trim().toLowerCase()
  ].join('|');
}

/**
 * Fetches existing transaction keys from the database for a given user, bank account,
 * and date range. This is used to pre-filter duplicates before attempting to insert.
 */
async function fetchExistingTransactionKeys(
  supabase: any,
  userId: string,
  bankAccountId: string,
  dates: string[]
): Promise<Set<string>> {
  if (dates.length === 0) return new Set();
  
  const minDate = dates.reduce((a, b) => a < b ? a : b);
  const maxDate = dates.reduce((a, b) => a > b ? a : b);
  
  console.log(`Fetching existing expenses from ${minDate} to ${maxDate}`);
  
  const { data: existingExpenses, error } = await supabase
    .from('expenses')
    .select('date, amount, currency, category, description')
    .eq('user_id', userId)
    .eq('bank_account_id', bankAccountId)
    .gte('date', minDate)
    .lte('date', maxDate);
  
  if (error) {
    console.error('Error fetching existing expenses:', error);
    return new Set();
  }
  
  const keys = new Set<string>();
  for (const exp of existingExpenses || []) {
    const key = generateTransactionKey({
      user_id: userId,
      bank_account_id: bankAccountId,
      date: exp.date as string,
      amount: Number(exp.amount),
      currency: exp.currency as string,
      category: exp.category as string,
      description: exp.description as string
    });
    keys.add(key);
  }
  
  console.log(`Found ${keys.size} existing transactions in date range`);
  return keys;
}

async function callGeminiAPI(fileContent: string, mimeType: string, apiKey: string): Promise<ParsedTransaction[]> {
  const isImage = mimeType.startsWith('image/') || mimeType === 'application/pdf';
  
  let requestBody;
  
  if (isImage || mimeType === 'application/pdf') {
    // For PDF/images, use inline_data with base64
    requestBody = {
      contents: [{
        parts: [
          { text: GEMINI_PROMPT },
          {
            inline_data: {
              mime_type: mimeType,
              data: fileContent
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 32768,  // Increased from 8192 to handle larger statements
      }
    };
  } else {
    // For text/CSV, just send as text
    requestBody = {
      contents: [{
        parts: [
          { text: GEMINI_PROMPT },
          { text: `\n\nBANK STATEMENT CONTENT:\n${fileContent}` }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 32768,  // Increased from 8192 to handle larger statements
      }
    };
  }

  console.log('Calling Gemini API with mime type:', mimeType);
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', response.status, errorText);
    
    // Check for authentication/key errors
    if (response.status === 400 || response.status === 401 || response.status === 403) {
      throw new Error('AI_KEY_INVALID');
    }
    
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  console.log('Gemini response received');
  
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textContent) {
    console.error('No text content in Gemini response:', JSON.stringify(data));
    throw new Error('No text content in Gemini response');
  }

  // Extract JSON from response (handle potential markdown code blocks)
  let jsonStr = textContent.trim();
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.slice(7);
  }
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.slice(3);
  }
  if (jsonStr.endsWith('```')) {
    jsonStr = jsonStr.slice(0, -3);
  }
  jsonStr = jsonStr.trim();

  console.log('Parsing JSON response, length:', jsonStr.length);
  
  try {
    const transactions = JSON.parse(jsonStr) as ParsedTransaction[];
    console.log('Parsed transactions count:', transactions.length);
    return transactions;
  } catch (parseError) {
    console.warn('Initial JSON parse failed, attempting recovery...');
    
    // Attempt to recover truncated JSON
    const recovered = attemptJsonRecovery(jsonStr);
    if (recovered) {
      try {
        const transactions = JSON.parse(recovered) as ParsedTransaction[];
        console.log('Recovered transactions count:', transactions.length, '(partial results from truncated response)');
        return transactions;
      } catch (recoveryError) {
        console.error('JSON recovery also failed');
      }
    }
    
    // Log first 500 chars for debugging (safe - no sensitive data in transaction JSON)
    console.error('Failed to parse Gemini JSON response. First 500 chars:', jsonStr.substring(0, 500));
    console.error('Last 200 chars:', jsonStr.substring(jsonStr.length - 200));
    throw new Error('Failed to parse Gemini response as JSON. The statement may be too large - try uploading a shorter date range.');
  }
}

/**
 * Attempts to recover a truncated JSON array by finding the last complete object
 * and closing the array properly. This handles cases where Gemini's response
 * is cut off mid-JSON due to token limits.
 */
function attemptJsonRecovery(jsonStr: string): string | null {
  // Only attempt recovery if JSON doesn't end with a proper array close
  if (jsonStr.trim().endsWith(']')) {
    return null; // Already properly closed, recovery won't help
  }
  
  // Find the last complete object (ends with })
  const lastCompleteObject = jsonStr.lastIndexOf('}');
  if (lastCompleteObject > 0) {
    // Check if there's an opening bracket (valid array start)
    const arrayStart = jsonStr.indexOf('[');
    if (arrayStart >= 0 && arrayStart < lastCompleteObject) {
      // Truncate to last complete object and close the array
      const recovered = jsonStr.substring(0, lastCompleteObject + 1) + ']';
      console.log('Attempting JSON recovery: truncated at position', lastCompleteObject);
      return recovered;
    }
  }
  
  return null;
}

function filterPendingNetZeroPairs(transactions: ParsedTransaction[]): ParsedTransaction[] {
  // Group pending transactions by date and normalized description
  const pendingByKey = new Map<string, ParsedTransaction[]>();
  const nonPending: ParsedTransaction[] = [];

  for (const tx of transactions) {
    if (tx.status === 'pending') {
      const key = `${tx.transaction_date}|${tx.description_clean.toLowerCase()}|${tx.amount}`;
      if (!pendingByKey.has(key)) {
        pendingByKey.set(key, []);
      }
      pendingByKey.get(key)!.push(tx);
    } else {
      nonPending.push(tx);
    }
  }

  // Filter out pending pairs that cancel out
  const filteredPending: ParsedTransaction[] = [];
  for (const [key, txs] of pendingByKey) {
    const debits = txs.filter(t => t.direction === 'debit');
    const credits = txs.filter(t => t.direction === 'credit');
    
    // If we have both debit and credit with same amount, they cancel out
    const minPairs = Math.min(debits.length, credits.length);
    
    // Keep the non-cancelled transactions
    const remainingDebits = debits.slice(minPairs);
    const remainingCredits = credits.slice(minPairs);
    
    filteredPending.push(...remainingDebits, ...remainingCredits);
    
    if (minPairs > 0) {
      console.log(`Filtered ${minPairs} net-zero pending pairs for key: ${key}`);
    }
  }

  return [...nonPending, ...filteredPending];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token from header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Processing import for user:', user.id);

    // Parse multipart form data
    const formData = await req.formData();
    const bankAccountId = formData.get('bank_account_id') as string;
    const file = formData.get('file') as File;

    if (!bankAccountId || !file) {
      return new Response(JSON.stringify({ error: 'Missing bank_account_id or file' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('File received:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'File size exceeds 10MB limit' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate bank account belongs to user
    const { data: bankAccount, error: bankError } = await supabase
      .from('bank_accounts')
      .select('id, name, currency')
      .eq('id', bankAccountId)
      .eq('user_id', user.id)
      .single();

    if (bankError || !bankAccount) {
      console.error('Bank account error:', bankError);
      return new Response(JSON.stringify({ error: 'Bank account not found or access denied' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Bank account validated:', bankAccount.name);

    // ============================================================
    // PER-USER GEMINI KEY: Fetch and decrypt the user's API key
    // SECURITY: The decrypted key is only held in memory during this request
    // ============================================================
    const { key: geminiApiKey, error: keyError } = await getUserGeminiKey(user.id);
    
    if (keyError === 'AI_KEY_MISSING') {
      console.log('User has not configured a Gemini API key');
      return new Response(JSON.stringify({ 
        error: 'AI_KEY_MISSING',
        message: 'To use AI-powered statement import, please connect your Gemini API key in Settings.'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (keyError || !geminiApiKey) {
      console.error('Error getting user Gemini key:', keyError);
      return new Response(JSON.stringify({ 
        error: 'AI_KEY_ERROR',
        message: 'Failed to retrieve your AI configuration. Please try again.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Process file content
    let fileContent: string;
    let mimeType = file.type || 'application/octet-stream';

    // Determine mime type from extension if not set
    if (mimeType === 'application/octet-stream') {
      const ext = file.name.toLowerCase().split('.').pop();
      if (ext === 'pdf') mimeType = 'application/pdf';
      else if (ext === 'csv') mimeType = 'text/csv';
      else if (ext === 'txt') mimeType = 'text/plain';
    }

    if (mimeType === 'text/csv' || mimeType === 'text/plain') {
      // Read as text for CSV/TXT
      fileContent = await file.text();
    } else {
      // Read as base64 for PDF and other binary formats
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      fileContent = btoa(String.fromCharCode(...uint8Array));
    }

    console.log('Calling Gemini to parse statement...');

    // Call Gemini API with user's key
    let transactions: ParsedTransaction[];
    try {
      transactions = await callGeminiAPI(fileContent, mimeType, geminiApiKey);
    } catch (geminiError) {
      const errorMessage = geminiError instanceof Error ? geminiError.message : 'Unknown error';
      
      if (errorMessage === 'AI_KEY_INVALID') {
        console.error('User Gemini key is invalid');
        return new Response(JSON.stringify({ 
          error: 'AI_KEY_INVALID',
          message: 'Your Gemini API key is invalid or expired. Please update it in Settings.'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      throw geminiError;
    }

    // Filter out pending net-zero pairs
    const filteredTransactions = filterPendingNetZeroPairs(transactions);
    const netZeroSkipped = transactions.length - filteredTransactions.length;
    
    console.log(`Transactions after net-zero filtering: ${filteredTransactions.length} (skipped ${netZeroSkipped} net-zero pairs)`);

    if (filteredTransactions.length === 0) {
      // Record history even when no transactions found
      await recordImportHistory(
        user.id, bankAccountId, file.name, file.size,
        0, netZeroSkipped, 0
      );
      
      return new Response(JSON.stringify({ 
        imported_count: 0, 
        skipped_count: netZeroSkipped,
        duplicate_count: 0,
        message: 'No transactions found in statement' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Prepare expense rows with all identity fields
    const expenseRowsWithKeys: ExpenseRow[] = filteredTransactions.map(tx => ({
      user_id: user.id,
      bank_account_id: bankAccountId,
      amount: tx.direction === 'credit' ? -tx.amount : tx.amount, // Negative for credits
      currency: bankAccount.currency || 'USD',
      category: tx.category,
      date: tx.transaction_date,
      description: tx.description_clean
    }));

    // ============================================================
    // DEDUPLICATION LAYER 1: Within the same batch
    // If the statement has duplicate rows, keep only one per key
    // ============================================================
    const batchKeysSeen = new Set<string>();
    const uniqueInBatch: ExpenseRow[] = [];

    for (const row of expenseRowsWithKeys) {
      const key = generateTransactionKey(row);
      if (!batchKeysSeen.has(key)) {
        batchKeysSeen.add(key);
        uniqueInBatch.push(row);
      }
    }

    const batchDuplicatesSkipped = expenseRowsWithKeys.length - uniqueInBatch.length;
    if (batchDuplicatesSkipped > 0) {
      console.log(`Deduplicated ${batchDuplicatesSkipped} within-batch duplicates`);
    }

    // ============================================================
    // DEDUPLICATION LAYER 2: Against existing DB records
    // Query expenses in the date range and filter out already-imported ones
    // ============================================================
    const dates = uniqueInBatch.map(r => r.date);
    const existingKeys = await fetchExistingTransactionKeys(
      supabase, 
      user.id, 
      bankAccountId, 
      dates
    );

    // Filter out transactions that already exist in DB
    const newTransactions = uniqueInBatch.filter(row => {
      const key = generateTransactionKey(row);
      return !existingKeys.has(key);
    });

    const dbDuplicatesSkipped = uniqueInBatch.length - newTransactions.length;
    const totalDuplicatesSkipped = batchDuplicatesSkipped + dbDuplicatesSkipped;

    console.log(`Deduplication summary: ${batchDuplicatesSkipped} batch duplicates, ${dbDuplicatesSkipped} DB duplicates`);

    // If all transactions are duplicates, return early
    if (newTransactions.length === 0) {
      const message = totalDuplicatesSkipped > 0 
        ? `All ${totalDuplicatesSkipped} transactions already exist from previous imports`
        : 'No new transactions found in statement';
      
      console.log(message);
      
      // Record history even when all duplicates
      await recordImportHistory(
        user.id, bankAccountId, file.name, file.size,
        0, netZeroSkipped, totalDuplicatesSkipped
      );
      
      return new Response(JSON.stringify({ 
        imported_count: 0, 
        skipped_count: netZeroSkipped,
        duplicate_count: totalDuplicatesSkipped,
        message
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Inserting new expenses:', newTransactions.length);

    // ============================================================
    // INSERT with safety net: DB unique index will catch any edge cases
    // ============================================================
    const { data: insertedData, error: insertError } = await supabase
      .from('expenses')
      .insert(newTransactions)
      .select('id');

    if (insertError) {
      // Check if it's a unique constraint violation (shouldn't happen due to pre-filtering, but safety net)
      if (insertError.code === '23505') {
        console.log('Unique constraint violation caught by DB - some duplicates slipped through');
        // This shouldn't happen with our pre-filtering, but handle gracefully
        return new Response(JSON.stringify({ 
          imported_count: 0, 
          skipped_count: netZeroSkipped,
          duplicate_count: totalDuplicatesSkipped + newTransactions.length,
          message: 'All transactions already exist (caught by database constraint)'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      console.error('Insert error:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to insert expenses: ' + insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const importedCount = insertedData?.length || 0;
    
    // Build user-friendly message
    let message = `Imported ${importedCount} transactions`;
    if (totalDuplicatesSkipped > 0) {
      message += `, ${totalDuplicatesSkipped} duplicates skipped`;
    }
    
    console.log(`Successfully imported ${importedCount} transactions`);

    // Record import history
    await recordImportHistory(
      user.id, bankAccountId, file.name, file.size,
      importedCount, netZeroSkipped, totalDuplicatesSkipped
    );

    return new Response(JSON.stringify({ 
      imported_count: importedCount,
      skipped_count: netZeroSkipped,
      duplicate_count: totalDuplicatesSkipped,
      message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Import statement error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
