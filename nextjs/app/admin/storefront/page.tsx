// app/admin/storefront/page.tsx
import { DEFAULT_STOREFRONT_CONFIG } from "@/lib/defaults";
import type { StorefrontConfig } from "@/lib/types";
import { createServerSupabase } from "@/lib/supabase-ssr-server";
import { Suspense } from "react";
import StorefrontSettings from "./ui/StorefrontSettings";
// import { notFound } from "next/navigation"; // optional

export const dynamic = "force-dynamic"; // ensure fresh data (or: export const revalidate = 0)

async function fetchProfileWithConfig(store: string | null) {
  if (!store) return null;

 const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, slug, display_name, storefront_config")
    .or(`id.eq.${store},slug.eq.${store}`)
    .maybeSingle();

  if (error) {
    // You could log this server-side
    return null; // or throw new Error(error.message)
  }

  // Merge defaults with stored config (prefer stored keys)
  const merged: StorefrontConfig = {
    ...DEFAULT_STOREFRONT_CONFIG,
    ...(data?.storefront_config ?? {}),
  };

  return { profile: data, config: merged } as const;
}

export default async function StorefrontPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const store = (searchParams?.store as string) ?? null;
  const result = await fetchProfileWithConfig(store);

  if (!result?.profile) {
    // optionally: if (store) notFound();
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Storefront</h1>
        <p className="text-sm text-neutral-600">
          Select a store from the top bar to configure its storefront.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Storefront</h1>
          <p className="text-sm text-neutral-600">
            Configure how your products are displayed on /{result.profile.slug}
          </p>
        </div>
      </div>

      <Suspense fallback={<div className="text-sm text-neutral-500">Loading settings…</div>}>
        {/* Client component that handles saving to Supabase */}
        <StorefrontSettings
          profileId={result.profile.id}
          slug={result.profile.slug}
          initialConfig={result.config}
        />
      </Suspense>
    </div>
  );
}
