// at very top of the file
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import ReactMarkdown from "react-markdown";


import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  getThemeFromConfig,
  resolveCategoryNavStyle,
  getDefaultProductView,
} from "@/lib/theme";
import {
  type StorefrontConfig,
  type Product,
  type Category,
  type SocialsConfig,
  type LandingBlock,
  type GridMode,
} from "@/lib/types";
import ProductViews from "@/components/storefront/ProductViews";
import CategoryListView from "@/components/storefront/CategoryListView";
import CategorySlider from "@/components/storefront/CategorySlider";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";

/* ---------------------------------- Types --------------------------------- */

type Profile = {
  id: string;
  slug: string;
  display_name: string;
  bio: string | null;
  profile_img: string | null;
  header_img: string | null;
  wa_e164: string | null;
  socials_config: unknown | null;
  storefront_config: StorefrontConfig | null;
};

function getTitle(p: Profile) {
  return p.display_name || "Profile";
}

/* ----------------------- Legacy → Blocks Fallback ------------------------- */

function toBlocks(cfg: StorefrontConfig | null | undefined): LandingBlock[] {
  const c = cfg ?? {};
  if (Array.isArray((c as any).landing_blocks) && (c as any).landing_blocks.length > 0) {
    return (c as any).landing_blocks as LandingBlock[];
  }

  // Legacy fields → sensible default blocks
  const hero: LandingBlock = { type: "hero", show_avatar: true, show_socials: true, show_ctas: true };
  const legacyLanding = (c.landing_page as any) ?? "products";

  if (legacyLanding === "hero-only") return [hero];

  // default products
  return [
    hero,
    { type: "products", source: "all", view: ((c.display_mode as GridMode) ?? "grid_3"), show_price: true },
  ];
}

/* --------------------------- Metadata (public) ---------------------------- */

export async function generateMetadata(
  { params }: { params: { slug: string } },
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const supabase = createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, slug, display_name, bio, profile_img, header_img, storefront_config, is_public")
    .eq("slug", params.slug)
    .eq("is_public", true)
    .maybeSingle();

  const title = profile?.display_name ?? "Storefront";
  const description = (profile as any)?.bio ?? "Discover products and links";
  const cover = (profile as any)?.header_img ?? "/og-default.jpg";

  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: cover }], type: "website" },
    twitter: { card: "summary_large_image", title, description, images: [cover] },
  };
}

/* ------------------------------- Page ------------------------------------- */

export default async function StorefrontPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { view?: "grid" | "list" | "links"; cat?: string };
}) {
  const supabase = createSupabaseServerClient();

  // Robust profile fetch
  const { data: pFull } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_public", true)
    .maybeSingle();

  if (!pFull) {
    return (
      <main className="mx-auto max-w-2xl p-6 text-center">
        <h1 className="text-2xl font-semibold">Storefront not found</h1>
        <p className="mt-2 text-muted-foreground">Check the URL or contact the owner.</p>
      </main>
    );
  }

  const p = pFull as unknown as Profile;

  // Parse storefront_config (string or object)
  const rawCfg = (p as any).storefront_config ?? {};
  let cfgObj: any = rawCfg;
  if (typeof rawCfg === "string") {
    try {
      cfgObj = JSON.parse(rawCfg);
    } catch {
      console.warn("[Storefront] storefront_config is a string but not valid JSON:", rawCfg);
      cfgObj = {};
    }
  }

  // Normalize legacy keys → StorefrontConfig
  const cfg: StorefrontConfig = {
    ...cfgObj,
    theme: cfgObj.theme ?? undefined,
    display_mode: cfgObj.display_mode ?? cfgObj.view ?? undefined,
    show_categories: cfgObj.show_categories ?? cfgObj.showCategories ?? undefined,
    landing_page: (cfgObj.landing_page ?? cfgObj.landingPage ?? cfgObj.landing) ?? undefined,
  };

  // Resolve theme
  const theme = getThemeFromConfig(cfg);

  // Build blocks (landing_blocks or legacy fallback)
  const blocks = toBlocks(cfg);

  // Fetch categories for blocks that need them
  const { data: categories = [] } = await supabase
    .from("categories")
    .select("id, name, position, cover_img")
    .eq("profile_id", p.id)
    .order("position", { ascending: true });

  // Fetch all visible products once
  const { data: productsAll = [] } = await supabase
    .from("products")
    .select(
      "id, title, caption, price, thumb_url, visible, category_id, cta_label, cta_url, instagram_permalink, position"
    )
    .eq("profile_id", p.id)
    .eq("visible", true)
    .order("position", { ascending: true });

  // Build category → products map for any product blocks that target a specific category
  const catIdsNeeded = Array.from(
    new Set(
      blocks
        .filter((b) => b.type === "products" && typeof (b as any).source !== "string")
        .map((b: any) => b.source?.category_id)
        .filter(Boolean)
    )
  );

  const productsByCat: Record<string, Product[]> = {};
  for (const cid of catIdsNeeded) {
    productsByCat[cid] = (productsAll as Product[]).filter((pr) => pr.category_id === cid);
  }

  // NEW: unified TopSection (Header or Hero) from cfg.top_section
  const topMode = (cfg.top_section?.mode as "header" | "hero") ?? "header";
  const headerStyle = (cfg.top_section?.header_style as "small" | "large-square" | "large-circle") ?? "small";
  const TopSection = (
    <StorefrontHeader
      displayName={p.display_name}
      bio={p.bio}
      avatarUrl={p.profile_img}
      coverUrl={p.header_img}
      socials={p.socials_config as SocialsConfig | null}
      whatsapp={p.wa_e164}
      theme={theme}
      mode={topMode}
      headerStyle={headerStyle}
    />
  );
console.log("THEME BG →", {
  type: theme.backgroundType,
  bg: theme.background,
  img: theme.backgroundImage,
  css: theme.backgroundCSS,
});
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
  <main
    className={theme.wrapper + " min-h-dvh"}
    style={pageBgStyle}
  >
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
      {/* Always render configured top section */}
      {TopSection}

      {blocks.map((b, i) => {
        if ((b as any)._hidden) return null;

        switch (b.type) {
          case "hero":
            return null;

          case "categories_wall": {
            const wallView = (b as any).view ?? "grid";
            const cols = (b as any).columns ?? 3;
            const items = (b as any).limit
              ? (categories as Category[]).slice(0, (b as any).limit)
              : (categories as Category[]);

            return (
              <section key={`b-${i}`} className="mb-6">
                <CategoryListView
                  categories={items}
                  view={wallView as any}
                  basePath={`/${p.slug}`}
                  theme={theme}
                  columns={cols as any}
                />
              </section>
            );
          }

          case "products": {
            const src = (b as any).source;
            const list =
              src === "all"
                ? productsAll
                : productsByCat[src?.category_id] ?? [];

            const limited =
              typeof (b as any).limit === "number"
                ? (list as Product[]).slice(0, (b as any).limit)
                : list;

            const productView = ((b as any).view ?? getDefaultProductView(cfg)) as GridMode;
            const showNav = !!(b as any).show_category_nav;

            const navStyle = resolveCategoryNavStyle(
              cfg.theme?.variant as any,
              (b as any).category_nav_style ??
                (cfg as any)?.theme?.defaults?.category_nav_style ??
                "auto"
            );

            return (
              <section key={`b-${i}`} className="mb-6">
                {showNav && categories.length > 0 && (
                  <div className="mb-4">
                    <CategorySlider
                      categories={
                        [
                          { id: "all" as any, name: "All" },
                          ...categories,
                        ] as any
                      }
                      activeId={"all"}
                      basePath={`/${p.slug}`}
                      categoryBasePath={`/${p.slug}/c`}
                      theme={theme}
                      navStyle={navStyle as any}
                    />
                  </div>
                )}

                <ProductViews
                  products={limited as any}
                  view={productView}
                  theme={theme}
                  slug={p.slug}
                  whatsapp={p.wa_e164}
                />
              </section>
            );
          }

          case "text":
            return (
              <section
                key={`b-${i}`}
                className={`my-4 ${
                  (b as any).align === "center" ? "text-center" : ""
                }`}
              >
                <div className="prose prose-neutral mx-auto">
                  <ReactMarkdown>{(b as any).content_md}</ReactMarkdown>
                </div>
              </section>
            );

          default:
            return null;
        }
      })}
    </div>
  </main>
);
}