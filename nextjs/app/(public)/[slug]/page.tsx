import type { Metadata, ResolvingMetadata } from "next";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";
import CategorySlider from "@/components/storefront/CategorySlider";
import ProductViews from "@/components/storefront/ProductViews";
import { getThemeFromConfig } from "@/lib/theme";
import { type StorefrontConfig, type Product, type Category, type SocialsConfig } from "@/lib/types";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type Profile = {
  id: string;
  slug: string;
  display_name: string;
  bio: string | null;
  profile_img: string | null;
  header_img: string | null;
  wa_e164: string | null;
  socials_config: unknown | null;
  storefront_config: unknown | null;
};

function getTitle(p: Profile) { return p.display_name || "Profile"; }

export async function generateMetadata({ params }: { params: { slug: string } }, _parent: ResolvingMetadata): Promise<Metadata> {
  const supabase = createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, slug, display_name, bio, profile_img, header_img, storefront_config, is_public")
    .eq("slug", params.slug)
    .is("is_public", true)
    .maybeSingle();

  const title = profile ? getTitle(profile as Profile) : "Storefront";
  const description = (profile as any)?.bio ?? "Discover products and links";
  const cover = (profile as any)?.header_img ?? "/og-default.jpg";

  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: cover }], type: "website" },
    twitter: { card: "summary_large_image", title, description, images: [cover] },
  };
}

export default async function StorefrontPage({ params, searchParams }: { params: { slug: string }, searchParams: { view?: "grid" | "list" | "links", cat?: string } }) {
  const supabase = createSupabaseServerClient();

  const { data: p } = await supabase
    .from("profiles")
    .select("id, slug, display_name, bio, profile_img, header_img, wa_e164, socials_config, storefront_config, is_public")
    .eq("slug", params.slug)
    .is("is_public", true)
    .maybeSingle();

  if (!p) {
    return (<main className="mx-auto max-w-2xl p-6 text-center">
      <h1 className="text-2xl font-semibold">Storefront not found</h1>
      <p className="mt-2 text-muted-foreground">Check the URL or contact the owner.</p>
    </main>);
  }

  const title = getTitle(p as Profile);
  const theme = getThemeFromConfig(p.storefront_config as StorefrontConfig | null);
  const { data: categories = [] } = await supabase
    .from("categories")
    .select("id, name, position")
    .eq("profile_id", p.id)
    .order("position", { ascending: true });

  const activeCatId = searchParams.cat || "all";

  let query = supabase
  .from("products")
  .select("id, title, caption, price, thumb_url, visible, category_id, cta_label, cta_url, position")
  .eq("profile_id", p.id)
  .eq("visible", true);

  if (activeCatId !== "all") {
    query = query.eq("category_id", activeCatId);
  }

  const { data: products = [] } = await query.order("position", { ascending: true });
  const view = searchParams.view ?? ((p.storefront_config as StorefrontConfig | null)?.default_view || "grid");

  return (
    <main className={theme.wrapper} style={{ background: theme.background }}>
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
        <StorefrontHeader
          coverUrl={p.header_img}
          avatarUrl={p.profile_img}
          title={title}
          bio={p.bio}
          socials={p.socials_config as SocialsConfig | null}
          whatsappNumber={p.wa_e164 ?? undefined}
          theme={theme}
        />

      {categories?.length ? (
        <CategorySlider
          categories={[{ id: "all", name: "All", position: 0 } as any, ...categories]}
          activeId={activeCatId}
          basePath={`/${p.slug}`}
          theme={theme}
        />
      ) : null}
        <ProductViews products={products as unknown as Product[]} view={view} theme={theme} />
      </div>
    </main>
  );
}
