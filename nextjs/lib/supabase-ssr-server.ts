// lib/supabase-ssr-server.ts (or your helper file)
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createServerSupabase() {
  const cookieStore = cookies();

  // Hybrid shim: supports both runtime expectations & mismatched types
  const cookieAdapter = {
    // ✅ Newer API
    get(name: string) {
      return cookieStore.get(name)?.value;
    },
    set(name: string, value: string, options: CookieOptions) {
      cookieStore.set({ name, value, ...options });
    },
    remove(name: string, options: CookieOptions) {
      cookieStore.set({ name, value: "", ...options, expires: new Date(0) });
    },

    // ✅ Older API (what your runtime error requested)
    getAll() {
      return cookieStore.getAll().map(({ name, value }) => ({ name, value }));
    },
    setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
      cookiesToSet.forEach(({ name, value, options }) =>
        cookieStore.set({ name, value, ...(options ?? {}) })
      );
    },
  } as any; // ← keep this cast to avoid TS complaining about the shape

  return createServerClient(url, anon, { cookies: cookieAdapter });
}
