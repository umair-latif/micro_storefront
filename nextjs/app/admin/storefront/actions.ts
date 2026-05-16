"use server";

import { createServerSupabase } from "@/lib/supabase-ssr-server";
import type { StorefrontTheme, LandingBlock, StorefrontConfig, GridMode } from "@/lib/types";
import { mergeStorefrontConfig, normalizeStorefrontConfig } from "@/lib/storefront-config";

type Result = { ok: true } | { ok: false; error: string };

async function readOwnedProfile(profileId: string) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, current: null, error: "Not authenticated." };

  const { data: current, error } = await supabase
    .from("profiles")
    .select("id, owner_uid, storefront_config, storefront_config_draft")
    .eq("id", profileId)
    .maybeSingle();

  if (error) return { supabase, user, current: null, error: error.message };
  if (!current) return { supabase, user, current: null, error: "Profile not found." };
  if (current.owner_uid && current.owner_uid !== user.id) {
    return { supabase, user, current: null, error: "You do not have permission to update this store." };
  }

  return { supabase, user, current, error: null };
}

export async function saveStorefrontDraftAction(
  profileId: string,
  nextConfig: StorefrontConfig
): Promise<Result> {
  try {
    const { supabase, user, current, error } = await readOwnedProfile(profileId);
    if (error || !user || !current) return { ok: false, error: error ?? "Unable to save draft." };

    const draft = normalizeStorefrontConfig(nextConfig);
    const { error: writeErr } = await supabase
      .from("profiles")
      .update({
        storefront_config_draft: draft,
        storefront_draft_updated_at: new Date().toISOString(),
      })
      .eq("id", profileId)
      .eq("owner_uid", user.id);

    if (writeErr) return { ok: false, error: writeErr.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Unknown error" };
  }
}

export async function publishStorefrontDraftAction(profileId: string): Promise<Result> {
  try {
    const { supabase, user, current, error } = await readOwnedProfile(profileId);
    if (error || !user || !current) return { ok: false, error: error ?? "Unable to publish storefront." };

    const draft = normalizeStorefrontConfig(current.storefront_config_draft ?? current.storefront_config);
    const now = new Date().toISOString();
    const { error: writeErr } = await supabase
      .from("profiles")
      .update({
        storefront_config: draft,
        storefront_config_draft: draft,
        storefront_published_at: now,
        storefront_draft_updated_at: now,
      })
      .eq("id", profileId)
      .eq("owner_uid", user.id);

    if (writeErr) return { ok: false, error: writeErr.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Unknown error" };
  }
}

export async function restorePublishedStorefrontAction(profileId: string): Promise<Result> {
  try {
    const { supabase, user, current, error } = await readOwnedProfile(profileId);
    if (error || !user || !current) return { ok: false, error: error ?? "Unable to restore published storefront." };

    const published = normalizeStorefrontConfig(current.storefront_config);
    const { error: writeErr } = await supabase
      .from("profiles")
      .update({
        storefront_config_draft: published,
        storefront_draft_updated_at: new Date().toISOString(),
      })
      .eq("id", profileId)
      .eq("owner_uid", user.id);

    if (writeErr) return { ok: false, error: writeErr.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Unknown error" };
  }
}

export async function updateStorefrontConfigAction(
  profileId: string,
  patch: StorefrontConfig
): Promise<Result> {
  try {
    const { supabase, user, current, error } = await readOwnedProfile(profileId);
    if (error || !user || !current) return { ok: false, error: error ?? "Unable to update storefront." };

    const merged = mergeStorefrontConfig(current.storefront_config_draft ?? current.storefront_config, patch);

    const { error: writeErr } = await supabase
      .from("profiles")
      .update({
        storefront_config_draft: merged,
        storefront_draft_updated_at: new Date().toISOString(),
      })
      .eq("id", profileId)
      .eq("owner_uid", user.id);

    if (writeErr) return { ok: false, error: writeErr.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Unknown error" };
  }
}

/* -------------------------------------------------------------------------- */
/*                            updateThemeAction (hardened)                    */
/* -------------------------------------------------------------------------- */
export async function updateThemeAction(profileId: string, nextTheme: StorefrontTheme): Promise<Result> {
  try {
    const supabase = await createServerSupabase();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Not authenticated." };

    const { data: current, error: readErr } = await supabase
      .from("profiles")
      .select("id, owner_uid, storefront_config, storefront_config_draft")
      .eq("id", profileId)
      .maybeSingle();

    if (readErr) return { ok: false, error: readErr.message };
    if (!current) return { ok: false, error: "Profile not found." };
    if (current.owner_uid && current.owner_uid !== user.id) {
      return { ok: false, error: "You do not have permission to update this store." };
    }

    const merged = mergeStorefrontConfig(current.storefront_config_draft ?? current.storefront_config, { theme: nextTheme });

    const { error: writeErr } = await supabase
      .from("profiles")
      .update({
        storefront_config_draft: merged,
        storefront_draft_updated_at: new Date().toISOString(),
      })
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
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const { data: current, error: readErr } = await supabase
    .from("profiles")
    .select("id, owner_uid, storefront_config, storefront_config_draft")
    .eq("id", profileId)
    .maybeSingle();

  if (readErr) return { ok: false, error: readErr.message };
  if (!current) return { ok: false, error: "Profile not found." };
  if (current.owner_uid !== user.id) return { ok: false, error: "Forbidden." };

  const merged = mergeStorefrontConfig(current.storefront_config_draft ?? current.storefront_config, { landing_blocks: blocks });

  const { error: writeErr } = await supabase
    .from("profiles")
    .update({
      storefront_config_draft: merged,
      storefront_draft_updated_at: new Date().toISOString(),
    })
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
    const supabase = await createServerSupabase();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Not authenticated." };

    const { data: current, error: readErr } = await supabase
      .from("profiles")
      .select("id, owner_uid, storefront_config, storefront_config_draft")
      .eq("id", profileId)
      .maybeSingle();

    if (readErr) return { ok: false, error: readErr.message };
    if (!current) return { ok: false, error: "Profile not found." };
    if (current.owner_uid !== user.id) return { ok: false, error: "Forbidden." };

    const cfg = normalizeStorefrontConfig(current.storefront_config_draft ?? current.storefront_config);
    const merged = mergeStorefrontConfig(cfg, {
      landing_overrides: {
        ...(cfg.landing_overrides ?? {}),
        // undefined clears the override; defined sets it
        category_page_view: payload.category_page_view,
      },
    });

    const { error: writeErr } = await supabase
      .from("profiles")
      .update({
        storefront_config_draft: merged,
        storefront_draft_updated_at: new Date().toISOString(),
      })
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
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Not authenticated." };

    const { data: current, error: readErr } = await supabase
      .from("profiles")
      .select("id, owner_uid, storefront_config, storefront_config_draft")
      .eq("id", profileId)
      .maybeSingle();

    if (readErr) return { ok: false, error: readErr.message };
    if (!current) return { ok: false, error: "Profile not found." };
    if (current.owner_uid !== user.id) return { ok: false, error: "Forbidden." };

    const cfg = normalizeStorefrontConfig(current.storefront_config_draft ?? current.storefront_config);
    const merged = mergeStorefrontConfig(cfg, {
      top_section: {
        ...(cfg.top_section ?? {}),
        ...top,
      },
    });

    const { error: writeErr } = await supabase
      .from("profiles")
      .update({
        storefront_config_draft: merged,
        storefront_draft_updated_at: new Date().toISOString(),
      })
      .eq("id", profileId)
      .eq("owner_uid", user.id);

    if (writeErr) return { ok: false, error: writeErr.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Unknown error" };
  }
}
