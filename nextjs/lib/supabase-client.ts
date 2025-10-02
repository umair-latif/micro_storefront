// /lib/supabase-client.ts
import { createClient as _createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseClient = _createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: `sb-${new URL(supabaseUrl).host.split(".")[0]}-auth-token`,
  },
});

/** Back-compat named export so other files can `import { createClient }` */
export function createClient() {
  return supabaseClient;
}
