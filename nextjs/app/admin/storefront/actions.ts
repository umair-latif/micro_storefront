"use server";

import { createServerSupabase } from "@/lib/supabase-ssr-server";
import type { StorefrontTheme, LandingBlock, StorefrontConfig, GridMode } from "@/lib/types";

type Result = { ok: true } | { ok: false; error: string };

// --- tiny helper: safely parse storefront_config if it was stored as a string
function parseCfg(raw: unknown): StorefrontConfig {
  if (!raw) return {};
  if (typeof raw === "string") {
    try { return JSON.parse(raw) as StorefrontConfig; } catch { return {}; }
  }
  return raw as StorefrontConfig;
}

/* -------------------------------------------------------------------------- */
/*                            updateThemeAction (hardened)                    */
/* -------------------------------------------------------------------------- */
export async function updateThemeAction(profileId: string, nextTheme: StorefrontTheme): Promise<Result> {
  try {
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
    if (current.owner_uid && current.owner_uid !== user.id) {
      return { ok: false, error: "You do not have permission to update this store." };
    }

    const cfg = parseCfg(current.storefront_config);
    const merged: StorefrontConfig = { ...cfg, theme: nextTheme };

    const { error: writeErr } = await supabase
      .from("profiles")
      .update({ storefront_config: merged })
      .eq("id", profileId)
      .eq("owner_uid", user.id);

    if (writeErr) return { ok: false, error: writeErr.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Unknown error" };
  }
}

/* -------------------------------------------------------------------------- */
/*                         updateLandingBlocks (hardened)                     */
/* -------------------------------------------------------------------------- */
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

  const cfg = parseCfg(current.storefront_config);
  const merged: StorefrontConfig = { ...cfg, landing_blocks: blocks };

  const { error: writeErr } = await supabase
    .from("profiles")
    .update({ storefront_config: merged })
    .eq("id", profileId)
    .eq("owner_uid", user.id);

  if (writeErr) return { ok: false, error: writeErr.message };
  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/*            NEW: updateLandingOverridesAction (category page view)          */
/* -------------------------------------------------------------------------- */
export async function updateLandingOverridesAction(
  profileId: string,
  payload: { category_page_view?: GridMode }
): Promise<Result> {
  try {
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

    const cfg = parseCfg(current.storefront_config);

    const merged: StorefrontConfig = {
      ...cfg,
      landing_overrides: {
        ...(cfg.landing_overrides ?? {}),
        // undefined clears the override; defined sets it
        category_page_view: payload.category_page_view,
      },
    };

    const { error: writeErr } = await supabase
      .from("profiles")
      .update({ storefront_config: merged })
      .eq("id", profileId)
      .eq("owner_uid", user.id);

    if (writeErr) return { ok: false, error: writeErr.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Unknown error" };
  }
}

export async function updateTopSection(
  profileId: string,
  top: { mode?: "header" | "hero"; header_style?: "small" | "large-square" | "large-circle" }
): Promise<Result> {
  try {
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

    const raw = current.storefront_config ?? {};
    const cfg = typeof raw === "string" ? (JSON.parse(raw) || {}) : raw;

    const merged = {
      ...cfg,
      top_section: {
        ...(cfg.top_section ?? {}),
        ...top,
      },
    };

    const { error: writeErr } = await supabase
      .from("profiles")
      .update({ storefront_config: merged })
      .eq("id", profileId)
      .eq("owner_uid", user.id);

    if (writeErr) return { ok: false, error: writeErr.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Unknown error" };
  }
}