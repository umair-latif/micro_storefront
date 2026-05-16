import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { normalizeStorefrontConfig } from "@/lib/storefront-config";
import StorefrontDraftBuilder from "./ui/StorefrontDraftBuilder";

export const dynamic = "force-dynamic";

export default async function StorefrontPage({ searchParams }: { searchParams: Promise<{ store?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const store = (resolvedSearchParams.store ?? "").trim();
  if (!store) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Storefront</h1>
        <p className="text-sm text-neutral-600">Select a store from the top bar to configure its storefront.</p>
      </div>
    );
  }

  let { data: profile, error } = await supabase
    .from("profiles")
    .select("id, slug, owner_uid, storefront_config, storefront_config_draft, storefront_published_at, storefront_draft_updated_at")
    .or(`id.eq.${store},slug.eq.${store}`)
    .eq("owner_uid", user.id)
    .maybeSingle();

  if (error && error.message.includes("storefront_config_draft")) {
    const fallback = await supabase
      .from("profiles")
      .select("id, slug, owner_uid, storefront_config")
      .or(`id.eq.${store},slug.eq.${store}`)
      .eq("owner_uid", user.id)
      .maybeSingle();
    profile = fallback.data
      ? {
          ...fallback.data,
          storefront_config_draft: null,
          storefront_published_at: null,
          storefront_draft_updated_at: null,
        }
      : null;
    error = fallback.error;
  }

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
        <p className="text-sm text-red-600">Store not found, or you do not have permission.</p>
      </div>
    );
  }

  const publishedConfig = normalizeStorefrontConfig(profile.storefront_config);
  const draftConfig = normalizeStorefrontConfig(profile.storefront_config_draft ?? profile.storefront_config);

  return (
    <StorefrontDraftBuilder
      profileId={profile.id}
      slug={profile.slug}
      initialDraftConfig={draftConfig}
      publishedConfig={publishedConfig}
      hasStoredDraft={!!profile.storefront_config_draft}
      publishedAt={profile.storefront_published_at}
      draftUpdatedAt={profile.storefront_draft_updated_at}
    />
  );
}
