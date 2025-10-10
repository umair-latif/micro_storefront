"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";

function getServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        },
      },
    }
  );
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^\w]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export async function createStoreAction(formData: FormData) {
  const supabase = getServer();

  const rawName = String(formData.get("display_name") || "").trim();
  const rawSlug = String(formData.get("slug") || "").trim();

  if (!rawName) {
    return { ok: false as const, error: "Display name is required." };
  }

  const slug = slugify(rawSlug || rawName);
  if (!slug) {
    return { ok: false as const, error: "Slug is required." };
  }

  // Ensure user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, error: "Not authenticated." };
  }

  // Try insert; RLS requires owner_uid = auth.uid()
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      display_name: rawName,
      slug,
      bio: "",
      socials_config: {},
      storefront_config: {},
      owner_uid: user.id, // ok even if trigger also sets it
    })
    .select("id, slug")
    .single();

  if (error) {
    // Handle slug conflicts (unique)
    if (error.message?.toLowerCase().includes("duplicate key") || error.code === "23505") {
      return { ok: false as const, error: "Slug already taken. Please choose another." };
    }
    return { ok: false as const, error: error.message || "Failed to create store." };
  }

  // Redirect to admin pages with the new store selected
  redirect(`/admin?store=${data.slug}`);
}
