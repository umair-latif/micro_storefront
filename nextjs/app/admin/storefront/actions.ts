// actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";


const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;


function createSupabase() {
  // Ensure 'url' and 'anon' are defined/imported from where your Supabase details live
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const cookieStore = cookies();

  // The cookie adapter remains correct after the previous fix
  const cookieAdapter: any = {
    get: (name: string) => cookieStore.get(name)?.value,
    set: (name: string, value: string, options: CookieOptions) =>
      cookieStore.set({ name, value, ...options }),
    remove: (name: string, options: CookieOptions) =>
      cookieStore.set({ name, value: "", ...options, expires: new Date(0) }),
    getAll: () => cookieStore.getAll().map(({ name, value }) => ({ name, value })),
    setAll: (list: any[]) => list.forEach((x) => cookieStore.set(x)),
  };

  return createServerClient(url, anon, {
    cookies: cookieAdapter,
  });
}

// ⚠️ UPDATED: The type now reflects ALL fields passed from the form.
type Payload = {
  profileId: string;
  variant: "clean" | "bold" | "minimal"; // from form
  preset: string; // from form
  primary: string; // from form
  accent: string; // from form
  landing: "products" | "categories" | "hero-only"; // from form
  view: "grid" | "list" | "links"; // from form
};

// 1️⃣ RENAME: saveLandingAndLayout -> saveStorefrontConfig
export async function saveStorefrontConfig(input: Payload) {
  const supabase = createSupabase();

  // ⚠️ NOTE: You'll need the profile's 'slug' to call revalidatePath correctly.
  // For now, I'll assume you have a way to retrieve it, or you'll pass it in the payload.
  // Since it's not in the form, we'll fetch it along with the config.

  // get existing config to merge
  const { data: row, error: readErr } = await supabase
    .from("profiles")
    .select("storefront_config, slug") // <-- Also fetch 'slug'
    .eq("id", input.profileId)
    .maybeSingle();
  if (readErr) throw readErr;
  if (!row) throw new Error("Profile not found.");

  const existing = (row.storefront_config ?? {}) as any;

  // 2️⃣ UPDATE MERGE LOGIC: Merge all new fields, including theme variants/presets
  const nextCfg = {
    ...existing,
    theme: {
      // Merge existing theme config with new theme data
      ...(existing.theme ?? {}), 
      variant: input.variant,
      palette: {
        preset: input.preset,
        primary: input.primary,
        accent: input.accent,
      }
    },
    display_mode: input.view, 
    landing_page: input.landing, 
  };

  const { error: writeErr } = await supabase
    .from("profiles")
    .update({ storefront_config: nextCfg })
    .eq("id", input.profileId)
    .select()
    .single();

  if (writeErr) throw writeErr;

  // Revalidate the public page using the fetched slug
  revalidatePath(`/${row.slug}`);
  return { ok: true };
}