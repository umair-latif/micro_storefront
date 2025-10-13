import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createSupabaseServerClient() {
  const cookieStore = cookies();

  // The cookie adapter MUST have set/remove functions, but for read-only 
  // Server Components, they must be stubbed out to prevent the Next.js error.
  const NOOP = () => {};

  const cookieAdapter = {
    // Read: Necessary for the Supabase client to read the session cookie if it exists.
    get(name: string) { return cookieStore.get(name)?.value; },
    
    // Write: These must be NOOPs (No Operation) to avoid the Next.js error
    // in components that are NOT Server Actions or Route Handlers.
    set: NOOP, 
    remove: NOOP, 

    // Legacy APIs: Also stub out the writing methods
    getAll() { return cookieStore.getAll().map(({ name, value }) => ({ name, value })); },
    setAll(list: { name: string; value: string; options?: CookieOptions }[]) {
      // Stub this out as well.
      // list.forEach(({ name, value, options }) => cookieStore.set({ name, value, ...(options ?? {}) }));
    },
  } as any; // Cast as any to satisfy type checks due to the legacy setAll stub

  return createServerClient(url, anon, { cookies: cookieAdapter });
}
