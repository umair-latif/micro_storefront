import { createSupabaseServerClient } from "@/lib/supabase-server"; // your SSR client
import type { StorefrontConfig } from "@/lib/types";
import { notFound } from "next/navigation";
import LandingEditor from "./ui/LandingEditor";
import StorefrontPresetEditor from "./ui/StorefrontPresetEditor";
import { DEFAULT_STOREFRONT_CONFIG } from "@/lib/defaults";


export const dynamic = "force-dynamic";

function parseConfig(raw: unknown): StorefrontConfig {
  if (!raw) return DEFAULT_STOREFRONT_CONFIG;
  const parsed = typeof raw === "string" ? (() => {
    try {
      return JSON.parse(raw) as StorefrontConfig;
    } catch {
      return {};
    }
  })() : raw as StorefrontConfig;

  const rawTheme = parsed.theme;
  const theme: NonNullable<StorefrontConfig["theme"]> =
    typeof rawTheme === "string" ? { variant: rawTheme as any } : rawTheme ?? {};

  return {
    ...DEFAULT_STOREFRONT_CONFIG,
    ...parsed,
    theme: {
      ...(DEFAULT_STOREFRONT_CONFIG.theme ?? {}),
      ...(theme ?? {}),
      palette: {
        ...(DEFAULT_STOREFRONT_CONFIG.theme?.palette ?? {}),
        ...(theme?.palette ?? {}),
      },
    },
  };
}

export default async function StorefrontPage({ searchParams }: { searchParams: Promise<{ store?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Middleware should redirect, but be safe
    notFound();
  }

  const store = (resolvedSearchParams.store ?? "").trim();
  if (!store) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Storefront</h1>
        <p className="text-sm text-neutral-600">Select a store from the top bar to configure its storefront.</p>
      </div>
    );
  }

  // fetch the profile by id or slug BUT owned by current user
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, slug, owner_uid, storefront_config")
    .or(`id.eq.${store},slug.eq.${store}`)
    .eq("owner_uid", user.id)
    .maybeSingle();

  if (error) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Storefront</h1>
        <p className="text-sm text-red-600">Failed to load store: {error.message}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Storefront</h1>
        <p className="text-sm text-red-600">Store “{store}” not found, or you don’t have permission.</p>
      </div>
    );
  }

  const config = parseConfig(profile.storefront_config);
  const initialBlocks = config.landing_blocks ?? [
  { type: "hero", show_avatar: true, show_socials: true, show_ctas: true },
  { type: "products", source: "all", view: "grid_3" as const, show_price: true },
];
  return (
    <div className="space-y-6">
      <StorefrontPresetEditor
        profileId={profile.id}
        initialConfig={config}
        publicUrl={`/${profile.slug}`}
      />

      <details className="rounded-2xl border border-black/10 bg-white shadow-sm">
        <summary className="cursor-pointer list-none px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Advanced Layout</h2>
              <p className="mt-1 text-xs text-neutral-500">Fine-tune individual page sections.</p>
            </div>
            <span className="rounded-full border border-black/10 px-3 py-1 text-xs text-neutral-600">
              Optional
            </span>
          </div>
        </summary>
        <div className="border-t border-black/10 p-4">
          <LandingEditor
            profileId={profile.id}
            initialBlocks={initialBlocks}
            initialTopSection={config.top_section}
          />
        </div>
      </details>
    </div>
  );
}
