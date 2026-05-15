import { createSupabaseServerClient } from "@/lib/supabase-server"; // your SSR client
import { notFound } from "next/navigation";
import LandingEditor from "./ui/LandingEditor";
import StorefrontPresetEditor from "./ui/StorefrontPresetEditor";
import {
  getLayoutPresetLabel,
  getStoreTypeLabel,
  normalizeStorefrontConfig,
} from "@/lib/storefront-config";
import { ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

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

  const config = normalizeStorefrontConfig(profile.storefront_config);
  const initialBlocks = config.landing_blocks ?? [
    { type: "hero", show_avatar: true, show_socials: true, show_ctas: true },
    { type: "products", source: "all", view: "grid_3" as const, show_price: true },
  ];
  return (
    <div className="space-y-6">
      <StorefrontPresetEditor
        profileId={profile.id}
        initialConfig={config}
      />

      <details className="rounded-2xl border border-black/10 bg-white shadow-sm">
        <summary className="cursor-pointer list-none px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
                3
              </div>
              <div>
                <h2 className="text-base font-semibold text-neutral-900">Customize sections</h2>
                <p className="mt-1 text-xs text-neutral-500">Fine-tune individual page sections.</p>
              </div>
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

      <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
              4
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900">Preview & publish</h2>
              <p className="mt-1 text-sm text-neutral-500">
                {getStoreTypeLabel(config.store_type)} · {getLayoutPresetLabel(config.layout_preset)} · {config.theme?.variant ?? "clean"}
              </p>
            </div>
          </div>
          <a
            href={`/${profile.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-neutral-50"
          >
            <ExternalLink className="h-4 w-4" />
            View store
          </a>
        </div>
      </section>
    </div>
  );
}
