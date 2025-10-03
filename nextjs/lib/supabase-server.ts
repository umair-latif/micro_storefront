import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createSupabaseServerClient() {
  const cookieStore = cookies();

  const cookieAdapter = {
    get(name: string) { return cookieStore.get(name)?.value; },
    set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }); },
    remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: "", ...options, expires: new Date(0) }); },
    getAll() { return cookieStore.getAll().map(({ name, value }) => ({ name, value })); },
    setAll(list: { name: string; value: string; options?: CookieOptions }[]) {
      list.forEach(({ name, value, options }) => cookieStore.set({ name, value, ...(options ?? {}) }));
    },
  } as any;

  return createServerClient(url, anon, { cookies: cookieAdapter });
}
