/**
 * Supabase Client — singleton with MMKV-backed auth storage.
 *
 * SecureStore stores the MMKV encryption key, MMKV stores the session data.
 * This approach gives us fast synchronous reads with encrypted persistence.
 */
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { supabaseAuthStorage } from '../lib/storage';

const SUPABASE_URL = env.SUPABASE_URL ?? 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY ?? 'placeholder-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: supabaseAuthStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Not needed in RN
  },
});
