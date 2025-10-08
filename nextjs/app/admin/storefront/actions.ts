"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function createSupabase() {
  const cookieStore = cookies();
  // hybrid adapter to satisfy old/new @supabase/ssr
  const cookieAdapter: any = {
    get: (name: string) => cookieStore.get(name)?.value,
    set: (name: string, value: string, options: any) => cookieStore.set({ name, value, ...options }),
    remove: (name: string, options: any) => cookieStore.set({ name, value: "", ...options, expires: new Date(0) }),
    getAll: () => cookieStore.getAll().map(({ name, value }) => ({ name, value })),
    setAll: (list: any[]) => list.forEach((x) => cookieStore.set(x)),
  };
  return createServerClient(url, anon, { cookies: cookieAdapter, headers: () => headers() as any });
}

type Payload = {
  profileId: string;
  slug: string;
  landing: "products" | "categories" | "hero-only"; // “hero-only” is Business Card
  showCategories: boolean;
  displayMode: "grid" | "list" | "links"; // keep your existing key in sync
};

export async function saveLandingAndLayout(input: Payload) {
  const supabase = createSupabase();

  // get existing config to merge
  const { data: row, error: readErr } = await supabase
    .from("profiles")
    .select("storefront_config")
    .eq("id", input.profileId)
    .maybeSingle();
  if (readErr) throw readErr;

  const existing = (row?.storefront_config ?? {}) as any;

  // merge without nuking other keys
  const nextCfg = {
    ...existing,
    // keep your current “display_mode” key so storefront continues to work
    display_mode: input.displayMode,                 // your existing key
    show_categories: input.showCategories ?? false,  // checkbox in admin
    landing_page: input.landing,                     // NEW selector
  };

  const { error: writeErr } = await supabase
    .from("profiles")
    .update({ storefront_config: nextCfg })
    .eq("id", input.profileId)
    .select()
    .single();

  if (writeErr) throw writeErr;

  // Revalidate the public page so the change is visible immediately
  revalidatePath(`/${input.slug}`);
  return { ok: true };
}
