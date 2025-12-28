import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    // Enable session persistence across page reloads
    persistSession: true,
    // Store session in localStorage (works better on mobile)
    storageKey: 'finmate-auth',
    // Automatically refresh the token before it expires
    autoRefreshToken: true,
    // Detect session from URL (for magic links and OAuth)
    detectSessionInUrl: true,
    // Use localStorage as the storage mechanism
    storage: window.localStorage,
    // Configure for better mobile browser compatibility
    flowType: 'pkce'
  }
});