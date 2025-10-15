import { createSupabaseServerClient } from "@/lib/supabase-server"; // your SSR client
import ThemeEditor from "./ui/ThemeEditor";
import type { StorefrontTheme } from "@/lib/types";
import { notFound } from "next/navigation";
import LandingEditor from "./ui/LandingEditor";


export const dynamic = "force-dynamic";

export default async function StorefrontPage({ searchParams }: { searchParams: { store?: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Middleware should redirect, but be safe
    notFound();
  }

  const store = (searchParams.store ?? "").trim();
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
    .select("id, owner_uid, storefront_config")
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

  const initialTheme: StorefrontTheme | undefined = profile.storefront_config?.theme;
  const initialBlocks = profile.storefront_config?.landing_blocks ?? [
  { type: "hero", show_avatar: true, show_socials: true, show_ctas: true },
  { type: "categories", show: !!profile.storefront_config?.show_categories, style: "chips" },
  { type: "products", source: "all", view: "grid_3" as const, show_price: true },
];
  return (
    <div className="space-y-6">
       <LandingEditor
      profileId={profile.id}
      initialBlocks={initialBlocks}
    />
      <ThemeEditor profileId={profile.id} initialTheme={initialTheme} />
    </div>
  );
}
