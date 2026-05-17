// app/(public)/[slug]/c/[cat]/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  getCategoryPageView,
  getDefaultCategoryNavStyle,
  getThemeFromConfig,
} from "@/lib/theme";
import { type Category, type Product, type StorefrontConfig } from "@/lib/types";
import { normalizeStorefrontConfig } from "@/lib/storefront-config";
import CategorySlider from "@/components/storefront/CategorySlider";
import ProductViews from "@/components/storefront/ProductViews";
import StoreIdentityBar from "@/components/storefront/StoreIdentityBar";

type Params = { slug: string; cat: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: p } = await supabase
    .from("profiles")
    .select("id, display_name, header_img, storefront_config, is_public")
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  const title = p?.display_name ? `${p.display_name} - Collection` : "Collection";
  const cover = (p as any)?.header_img ?? "/og-default.jpg";

  return {
    title,
    openGraph: { title, images: [{ url: cover }] },
    twitter: { card: "summary_large_image", title, images: [cover] },
  };
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { slug, cat } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: p } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (!p) notFound();

  const cfg: StorefrontConfig = normalizeStorefrontConfig((p as any).storefront_config);
  const theme = getThemeFromConfig(cfg);

  // Collections use the categories table internally.
  const { data: categories = [] } = await supabase
    .from("categories")
    .select("id, name, position, cover_img")
    .eq("profile_id", p.id)
    .order("position", { ascending: true });

  const activeCat = (categories as Category[]).find((c) => String(c.id) === String(cat));
  if (!activeCat) notFound();

  const { data: products = [] } = await supabase
    .from("products")
    .select("id, title, caption, price, thumb_url, visible, category_id, cta_label, cta_url, instagram_permalink, position")
    .eq("profile_id", p.id)
    .eq("visible", true)
    .eq("category_id", activeCat.id)
    .order("position", { ascending: true });

  const view = getCategoryPageView(cfg);
  const navStyle = getDefaultCategoryNavStyle(cfg);
  const pageBgStyle =
    theme.backgroundType === "image" || theme.backgroundType === "gradient"
      ? {
          backgroundColor: theme.background,
          ...(theme.backgroundCSS ?? { backgroundImage: theme.backgroundImage }),
        }
      : {
          backgroundColor: theme.background,
        };

  return (
    <main className={theme.wrapper} style={pageBgStyle}>
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <StoreIdentityBar
          storeName={p.display_name}
          avatarUrl={p.profile_img}
          backHref={`/${slug}`}
          homeHref={`/${slug}`}
          contextLabel={activeCat.name}
          theme={theme}
        />

        {categories.length > 0 ? (
          <div className="mb-4">
            <CategorySlider
              categories={[{ id: "all" as any, name: "All" }, ...(categories as Category[])] as any}
              activeId={String(activeCat.id)}
              basePath={`/${slug}`}
              categoryBasePath={`/${slug}/c`}
              theme={theme}
              navStyle={navStyle}
            />
          </div>
        ) : null}

        {products.length > 0 ? (
          <ProductViews
            products={products as Product[]}
            view={view}
            theme={theme}
            slug={slug}
            whatsapp={p.wa_e164}
            activeCatId={String(activeCat.id) as any}
          />
        ) : (
          <div className={`${theme.card} px-4 py-8 text-center text-sm`} style={{ color: theme.muted }}>
            No products in this collection yet.
          </div>
        )}
      </div>
    </main>
  );
}
