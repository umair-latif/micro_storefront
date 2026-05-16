import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";
import CategoryListView from "@/components/storefront/CategoryListView";
import CategorySlider from "@/components/storefront/CategorySlider";
import ProductViews from "@/components/storefront/ProductViews";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  getDefaultProductView,
  getThemeFromConfig,
  resolveCategoryNavStyle,
} from "@/lib/theme";
import {
  getStorefrontLandingBlocks,
  normalizeStorefrontConfig,
} from "@/lib/storefront-config";
import type {
  Category,
  GridMode,
  Product,
  SocialsConfig,
  StorefrontConfig,
} from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

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
  storefront_config_draft?: StorefrontConfig | null;
};

export default async function StorefrontDraftPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ store?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const store = (resolvedSearchParams.store ?? "").trim();
  if (!store) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  let { data: profile, error } = await supabase
    .from("profiles")
    .select("id, slug, display_name, bio, profile_img, header_img, wa_e164, socials_config, owner_uid, storefront_config, storefront_config_draft")
    .or(`id.eq.${store},slug.eq.${store}`)
    .eq("owner_uid", user.id)
    .maybeSingle();

  if (error && error.message.includes("storefront_config_draft")) {
    const fallback = await supabase
      .from("profiles")
      .select("id, slug, display_name, bio, profile_img, header_img, wa_e164, socials_config, owner_uid, storefront_config")
      .or(`id.eq.${store},slug.eq.${store}`)
      .eq("owner_uid", user.id)
      .maybeSingle();
    profile = fallback.data ? { ...fallback.data, storefront_config_draft: null } : null;
    error = fallback.error;
  }

  if (error || !profile) notFound();

  const p = profile as unknown as Profile;
  const cfg = normalizeStorefrontConfig(p.storefront_config_draft ?? p.storefront_config);
  const theme = getThemeFromConfig(cfg);
  const cfgTheme = cfg.theme;
  const blocks = getStorefrontLandingBlocks(cfg);

  const { data: categories = [] } = await supabase
    .from("categories")
    .select("id, name, position, cover_img")
    .eq("profile_id", p.id)
    .order("position", { ascending: true });

  const { data: productsAll = [] } = await supabase
    .from("products")
    .select("id, title, caption, price, thumb_url, visible, category_id, cta_label, cta_url, instagram_permalink, position")
    .eq("profile_id", p.id)
    .eq("visible", true)
    .order("position", { ascending: true });

  const catIdsNeeded = Array.from(
    new Set(
      blocks
        .filter((block) => block.type === "products" && typeof (block as any).source !== "string")
        .map((block: any) => block.source?.category_id)
        .filter(Boolean)
    )
  );

  const productsByCat: Record<string, Product[]> = {};
  for (const categoryId of catIdsNeeded) {
    productsByCat[categoryId] = (productsAll as Product[]).filter((product) => product.category_id === categoryId);
  }

  const topMode = cfg.top_section?.mode ?? "header";
  const headerStyle = cfg.top_section?.header_style ?? "small";
  const pageBgStyle =
    theme.backgroundType === "image" || theme.backgroundType === "gradient"
      ? {
          backgroundColor: theme.background,
          ...(theme.backgroundCSS ?? { backgroundImage: theme.backgroundImage }),
        }
      : { backgroundColor: theme.background };

  return (
    <div className="-m-4 overflow-hidden rounded-2xl bg-neutral-950">
      <div className="border-b border-white/10 bg-neutral-950 px-4 py-3 text-sm text-white">
        Draft preview. Only you can see this version.
      </div>
      <main className={theme.wrapper + " min-h-dvh"} style={pageBgStyle}>
        <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
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

          {blocks.map((block, index) => {
            if ((block as any)._hidden) return null;

            switch (block.type) {
              case "hero":
                return null;

              case "categories_wall": {
                const items = (block as any).limit
                  ? (categories as Category[]).slice(0, (block as any).limit)
                  : (categories as Category[]);
                return (
                  <section key={`preview-${index}`} className="mb-6">
                    <CategoryListView
                      categories={items}
                      view={((block as any).view ?? "grid") as any}
                      basePath={`/${p.slug}`}
                      theme={theme}
                      columns={((block as any).columns ?? 3) as any}
                    />
                  </section>
                );
              }

              case "products": {
                const source = (block as any).source;
                const list = source === "all" ? productsAll : productsByCat[source?.category_id] ?? [];
                const limited =
                  typeof (block as any).limit === "number"
                    ? (list as Product[]).slice(0, (block as any).limit)
                    : list;
                const showNav = !!(block as any).show_category_nav;
                const navStyle = resolveCategoryNavStyle(
                  cfgTheme?.variant as any,
                  (block as any).category_nav_style ?? cfgTheme?.defaults?.category_nav_style ?? "auto"
                );

                return (
                  <section key={`preview-${index}`} className="mb-6">
                    {showNav && categories.length > 0 ? (
                      <div className="mb-4">
                        <CategorySlider
                          categories={[{ id: "all" as any, name: "All" }, ...categories] as any}
                          activeId="all"
                          basePath={`/${p.slug}`}
                          categoryBasePath={`/${p.slug}/c`}
                          theme={theme}
                          navStyle={navStyle as any}
                        />
                      </div>
                    ) : null}
                    <ProductViews
                      products={limited as any}
                      view={((block as any).view ?? getDefaultProductView(cfg)) as GridMode}
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
                    key={`preview-${index}`}
                    className={`my-4 ${(block as any).align === "center" ? "text-center" : ""}`}
                  >
                    <div className="prose prose-neutral mx-auto">
                      <ReactMarkdown>{(block as any).content_md}</ReactMarkdown>
                    </div>
                  </section>
                );

              default:
                return null;
            }
          })}
        </div>
      </main>
    </div>
  );
}
