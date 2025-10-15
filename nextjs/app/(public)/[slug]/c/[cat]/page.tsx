// app/(public)/[slug]/c/[cat]/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getThemeFromConfig } from "@/lib/theme";
import {
  type StorefrontConfig,
  type Category,
  type Product,
  type SocialsConfig,
} from "@/lib/types";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";
import CategorySlider from "@/components/storefront/CategorySlider";
import ProductViews from "@/components/storefront/ProductViews";

type Params = { slug: string; cat: string };

// (optional) SEO; you can expand this with category name later
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const supabase = createSupabaseServerClient();
  const { data: p } = await supabase
    .from("profiles")
    .select("id, display_name, header_img, storefront_config, is_public")
    .eq("slug", params.slug)
    .eq("is_public", true)
    .maybeSingle();

  const title = p?.display_name ? `${p.display_name} • Category` : "Category";
  const cover = (p as any)?.header_img ?? "/og-default.jpg";

  return {
    title,
    openGraph: { title, images: [{ url: cover }] },
    twitter: { card: "summary_large_image", title, images: [cover] },
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug, cat } = params;
  const supabase = createSupabaseServerClient();

  // profile
  const { data: p } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (!p) notFound();

  // config + theme
  const rawCfg = (p as any).storefront_config ?? {};
  const cfg: StorefrontConfig = typeof rawCfg === "string" ? (() => { try { return JSON.parse(rawCfg) } catch { return {} } })() : rawCfg;
  const theme = getThemeFromConfig(cfg);

  // categories (for slider + title)
  const { data: categories = [] } = await supabase
    .from("categories")
    .select("id, name, position, cover_img")
    .eq("profile_id", p.id)
    .order("position", { ascending: true });

  const activeCat = categories.find((c: Category) => c.id === cat);
  if (!activeCat) notFound();

  // products in category
  const { data: products = [] } = await supabase
    .from("products")
    .select(
      "id, title, caption, price, thumb_url, visible, category_id, cta_label, cta_url, instagram_permalink, position"
    )
    .eq("profile_id", p.id)
    .eq("visible", true)
    .eq("category_id", cat)
    .order("position", { ascending: true });

  // choose a view: use cfg.display_mode if set, else grid_3
  const view = (cfg.display_mode ?? "grid_3") as any;

  return (
    <main className={theme.wrapper} style={{ background: theme.background }}>
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
        <StorefrontHeader
          displayName={p.display_name}
          bio={p.bio}
          avatarUrl={p.profile_img}
          coverUrl={p.header_img}
          socials={p.socials_config as SocialsConfig | null}
          whatsapp={p.wa_e164}
          theme={theme}
        />

        {/* Back + category chips */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            href={`/${slug}`}
            className="text-sm underline-offset-4 hover:underline"
            style={{ color: theme.muted }}
          >
            ← Back to home
          </Link>
          <span className="text-sm font-medium" style={{ color: theme.text }}>
            {activeCat.name}
          </span>
        </div>

        {/* category chips row */}
        {categories.length > 0 && (
          <div className="mb-4">
            <CategorySlider
              categories={[{ id: "all" as any, name: "All" }, ...categories] as any}
              activeId={cat}
              basePath={`/${slug}`}
              theme={theme}
              // If your CategorySlider supports a `categoryBasePath`, pass it and build c-links there
              categoryBasePath={`/${slug}/c`}
            />
          </div>
        )}

        <ProductViews
          products={products as Product[]}
          view={view}
          theme={theme}
          slug={slug}
          whatsapp={p.wa_e164}
          // If your Product card links should preserve the category, pass cat here if supported
          activeCatId={cat as any}
        />
      </div>
    </main>
  );
}
