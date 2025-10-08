// at very top of the file
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import type { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getThemeFromConfig } from "@/lib/theme";
import {
  type StorefrontConfig,
  type Product,
  type Category,
  type SocialsConfig,
} from "@/lib/types";
import ProductViews from "@/components/storefront/ProductViews";
import HeroOnly from "@/components/storefront/HeroOnly";
import CategoryListView from "@/components/storefront/CategoryListView";
import CategorySlider from "@/components/storefront/CategorySlider";
import Probe from "@/components/dev/Probe";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";


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

export async function generateMetadata(
  { params }: { params: { slug: string } },
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const supabase = createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, slug, display_name, bio, profile_img, header_img, storefront_config, is_public"
    )
    .eq("slug", params.slug)
    .is("is_public", true)
    .maybeSingle();

  const title = profile ?.display_name ?? "Storefront";
  const description = (profile as any)?.bio ?? "Discover products and links";
  const cover = (profile as any)?.header_img ?? "/og-default.jpg";

  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: cover }], type: "website" },
    twitter: { card: "summary_large_image", title, description, images: [cover] },
  };
}

export default async function StorefrontPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { view?: "grid" | "list" | "links"; cat?: string };
}) {
  const supabase = createSupabaseServerClient();

  const { data: p } = await supabase
    .from("profiles")
    .select(
      "id, slug, display_name, bio, profile_img, header_img, wa_e164, socials_config, storefront_config, is_public"
    )
    .eq("slug", params.slug)
    .is("is_public", true)
    .maybeSingle();

  // 🔍 Debug logs
  console.log("[Storefront] slug:", params.slug);
  console.log("[Storefront] storefront_config (selected fields):", p?.storefront_config);

  // extra full-row fetch just to compare
  const { data: pFull } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", params.slug)
    .is("is_public", true)
    .maybeSingle();
  console.log("[Storefront] storefront_config (FULL row):", pFull?.storefront_config);
  console.log("[Storefront] row keys:", Object.keys(pFull || {}));
  console.log("[Storefront] id/slug:", pFull?.id, pFull?.slug);

  if (!p) {
    return (
      <main className="mx-auto max-w-2xl p-6 text-center">
        <h1 className="text-2xl font-semibold">Storefront not found</h1>
        <p className="mt-2 text-muted-foreground">
          Check the URL or contact the owner.
        </p>
      </main>
    );
  }

  // --- BEGIN robust config parsing + debug ---
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
  console.log("[Storefront] storefront_config (parsed):", cfgObj);

  const cfg: StorefrontConfig = {
    ...cfgObj,
    theme: cfgObj.theme ?? undefined,
    display_mode: cfgObj.display_mode ?? cfgObj.display_mode ?? cfgObj.view ?? undefined,
    show_categories: cfgObj.show_categories ?? cfgObj.showCategories ?? undefined,
    landing_page: (cfgObj.landing_page ?? cfgObj.landingPage ?? cfgObj.landing) ?? undefined,
  };

  const theme = getThemeFromConfig(cfg);

  const activeCatId = searchParams.cat || "all";
  const landingRaw = cfg.landing_page ?? "products";
  const landing = activeCatId !== "all" ? "products" : landingRaw;
    
  const urlView = (searchParams.view as string | undefined) ?? undefined;
  const view = (urlView ?? cfg.display_mode ?? "grid") as "grid" | "list" | "links";

  // used by slider
  const showCategoriesSlider = !!cfg.show_categories;

  // For Probe (optional)
  const cfgView = cfg.display_mode ?? null;
  const effectiveView = view;

  console.log("[Storefront] effective view:", view, "landing:", landing);
  // --- END robust config parsing + debug ---

  // fetch categories (for slider or categories landing)
  const { data: categories = [] } = await supabase
    .from("categories")
    .select("id, name, position, cover_img")
    .eq("profile_id", p.id)
    .order("position", { ascending: true });

  // fetch products (filtered by ?cat only when landing === "products")
  //onst activeCatId = searchParams.cat || "all";
  let q = supabase
    .from("products")
    .select(
      "id, title, caption, price, thumb_url, visible, category_id, cta_label, cta_url, instagram_permalink, position"
    )
    .eq("profile_id", p.id)
    .eq("visible", true);

  if (activeCatId !== "all") {
    q = q.eq("category_id", activeCatId);
  }
  const { data: products = [] } = await q.order("position", { ascending: true });

  // header reused across products & categories landing
const Header = (
  <StorefrontHeader
    displayName={p.display_name}
    bio={p.bio}
    avatarUrl={p.profile_img}
    coverUrl={p.header_img}
    socials={p.socials_config as SocialsConfig | null}
    whatsapp={p.wa_e164}
    theme={theme}  // from getThemeFromConfig(cfg)
  />
);

  // Landing: Business card (hero only)
  if (landing === "hero-only") {
    return (
      <main className={theme.wrapper} style={{ background: theme.background }}>
        <HeroOnly
          coverUrl={p.header_img}
          avatarUrl={p.profile_img}
          title={p.display_name}
          bio={p.bio}
          socials={p.socials_config as SocialsConfig | null}
          whatsapp={p.wa_e164}
          theme={theme}
        />
      </main>
    );
  }

  // Landing: Categories directory (cards/list/links; cover_img supported)
  if (landing === "categories") {
    return (
      <main className={theme.wrapper} style={{ background: theme.background }}>
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
          {Header}
          <CategoryListView
            categories={categories as Category[]}
            view={view}
            basePath={`/${p.slug}`}
            theme={theme}
          />
        </div>
      </main>
    );
  }

  // Landing: Products (default) — optionally show the slider if checkbox is on
 return (
  <main className={theme.wrapper} style={{ background: theme.background }}>
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
      {Header}

      {/* 👇 BACK LINK: only when viewing a filtered category */}
      {activeCatId !== "all" && (
        <div className="mb-4">
          <Link
            href={`/${p.slug}`}
            className="text-sm underline-offset-4 hover:underline"
            style={{ color: theme.muted }}
          >
            ← Back to home
          </Link>
        </div>
      )}

      {showCategoriesSlider && categories.length > 0 ? (
        <CategorySlider
          categories={[{ id: "all" as any, name: "All" }, ...categories] as any}
          activeId={activeCatId}
          basePath={`/${p.slug}`}
          theme={theme}
        />
      ) : null}

      {/* (optional) Probe */}
      <Probe cfgView={cfgView} urlView={urlView ?? null} />

      <ProductViews
        products={products as any}
        view={view}
        theme={theme}
        slug={p.slug}
        whatsapp={p.wa_e164}
        activeCatId={activeCatId}  // keeps the cat in product links
      />
    </div>
  </main>
);
}
