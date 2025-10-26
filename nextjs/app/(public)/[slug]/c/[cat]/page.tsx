// app/(public)/[slug]/c/[cat]/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { 
  getThemeFromConfig, 
  getDefaultProductView,          // ← NEW
  getDefaultCategoryNavStyle,     // ← NEW
  getCategoryPageView             // ← NEW
} from "@/lib/theme";
import {
  type StorefrontConfig,
  type Category,
  type Product,
  type SocialsConfig,
  type GridMode,
} from "@/lib/types";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";
import CategorySlider from "@/components/storefront/CategorySlider";
import ProductViews from "@/components/storefront/ProductViews";

type Params = { slug: string; cat: string };

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

  // Profile
  const { data: p } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (!p) notFound();

  // Config + theme
  const rawCfg = (p as any).storefront_config ?? {};
  const cfg: StorefrontConfig =
    typeof rawCfg === "string" ? (() => { try { return JSON.parse(rawCfg); } catch { return {}; } })() : rawCfg;
  const theme = getThemeFromConfig(cfg);

  // Categories (for slider + title)
  const { data: categories = [] } = await supabase
    .from("categories")
    .select("id, name, position, cover_img")
    .eq("profile_id", p.id)
    .order("position", { ascending: true });

  // String-safe match (ids can be string/number)
  const activeCat = (categories as Category[]).find(
    (c) => String(c.id) === String(cat)
  );
  if (!activeCat) notFound();

  // Products in category
  const { data: products = [] } = await supabase
    .from("products")
    .select(
      "id, title, caption, price, thumb_url, visible, category_id, cta_label, cta_url, instagram_permalink, position"
    )
    .eq("profile_id", p.id)
    .eq("visible", true)
    .eq("category_id", activeCat.id)
    .order("position", { ascending: true });

  // 🔽 NEW: theme-driven defaults
  const view = getCategoryPageView(cfg);          
  const navStyle = getDefaultCategoryNavStyle(cfg);                 // e.g., theme.defaults.category_nav_style → "chips"
  // Build the style for the page background
  const pageBgStyle =
    theme.backgroundType === "image" || theme.backgroundType === "gradient"
      ? {
          backgroundColor: theme.background, // fallback color while image loads
          ...(theme.backgroundCSS ?? { backgroundImage: theme.backgroundImage }),
        }
      : {
          backgroundColor: theme.background,
        };

  return (
    <main className={theme.wrapper} style={pageBgStyle}>
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Category slider (All → landing; others → /slug/c/[id]) }
        <StorefrontHeader
          displayName={p.display_name}
          bio={p.bio}
          avatarUrl={p.profile_img}
          coverUrl={p.header_img}
          socials={p.socials_config as SocialsConfig | null}
          whatsapp={p.wa_e164}
          theme={theme}
        />

        {/* Category slider (All → landing; others → /slug/c/[id]) }
        {categories.length > 0 && (
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
        )}

        { Back + current category */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            href={`/${slug}`}
            className="text-sm underline-offset-4 hover:underline"
            style={{ color: theme.muted }}
          >
            ← Back
          </Link>
          <span className="text-sm font-medium" style={{ color: theme.muted }}>
            {activeCat.name}
          </span>
        </div>

        <ProductViews
          products={products as Product[]}
          view={view}
          theme={theme}
          slug={slug}
          whatsapp={p.wa_e164}
          activeCatId={String(activeCat.id) as any}
        />
      </div>
    </main>
  );
}
