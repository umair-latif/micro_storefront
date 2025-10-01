// /lib/supabase-client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,       // ✅ write session to localStorage
    autoRefreshToken: true,     // ✅ refresh automatically
    detectSessionInUrl: true,   // ✅ handle magic link / PKCE if you use it
    storageKey: `sb-${new URL(supabaseUrl).host.split('.')[0]}-auth-token`, // stable key
  },
});
