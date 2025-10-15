"use server";

import { createServerSupabase } from "@/lib/supabase-ssr-server";
import type { StorefrontTheme,LandingBlock } from "@/lib/types";

type Result = { ok: true } | { ok: false; error: string };

export async function updateThemeAction(profileId: string, nextTheme: StorefrontTheme): Promise<Result> {
  try {
    const supabase = createServerSupabase();

    // who’s logged in?
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Not authenticated." };

    // merge theme into storefront_config JSONB
    // Using a safe read-modify-write to preserve other keys in storefront_config
    const { data: current, error: readErr } = await supabase
      .from("profiles")
      .select("id, owner_uid, storefront_config")
      .eq("id", profileId)
      .maybeSingle();

    if (readErr) return { ok: false, error: readErr.message };
    if (!current) return { ok: false, error: "Profile not found." };
    if (current.owner_uid && current.owner_uid !== user.id) {
      return { ok: false, error: "You do not have permission to update this store." };
    }

    const cfg = current.storefront_config ?? {};
    const merged = { ...cfg, theme: nextTheme };

    const { error: writeErr } = await supabase
      .from("profiles")
      .update({ storefront_config: merged })
      .eq("id", profileId)
      .eq("owner_uid", user.id); // extra guard

    if (writeErr) return { ok: false, error: writeErr.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Unknown error" };
  }
}

export async function updateLandingBlocks(profileId: string, blocks: LandingBlock[]) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const { data: current, error: readErr } = await supabase
    .from("profiles")
    .select("id, owner_uid, storefront_config")
    .eq("id", profileId)
    .maybeSingle();

  if (readErr) return { ok: false, error: readErr.message };
  if (!current) return { ok: false, error: "Profile not found." };
  if (current.owner_uid !== user.id) return { ok: false, error: "Forbidden." };

  const cfg = current.storefront_config ?? {};
  const merged = { ...cfg, landing_blocks: blocks };

  const { error: writeErr } = await supabase
    .from("profiles")
    .update({ storefront_config: merged })
    .eq("id", profileId)
    .eq("owner_uid", user.id);

  if (writeErr) return { ok: false, error: writeErr.message };
  return { ok: true };
}
