// app/(public)/[slug]/p/[id]/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getThemeFromConfig } from "@/lib/theme";
import type { StorefrontConfig } from "@/lib/types";
import CTAButtons from "@/components/storefront/CTAButtons";
import ProductGallery from "@/components/storefront/ProductGallery";
import StoreIdentityBar from "@/components/storefront/StoreIdentityBar";
import ReactMarkdown from "react-markdown";

type Params = { slug: string; id: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> },
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug, id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: prof } = await supabase
    .from("profiles")
    .select("id, slug, display_name, bio, header_img, storefront_config, is_public")
    .eq("slug", slug)
    .is("is_public", true)
    .maybeSingle();

  if (!prof) return { title: "Product - Storefront" };

  const { data: product } = await supabase
    .from("products")
    .select("id, title, caption, thumb_url, visible")
    .eq("id", id)
    .eq("profile_id", prof.id)
    .eq("visible", true)
    .maybeSingle();

  const title = product?.title ? `${product.title} - ${prof.display_name}` : prof.display_name;
  const description = product?.caption ?? (prof as any)?.bio ?? "View product";
  const image = product?.thumb_url ?? (prof as any)?.header_img ?? "/og-default.jpg";

  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: image }], type: "website" },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ cat?: string }>;
}) {
  const { slug, id } = await params;
  const resolvedSearchParams = await searchParams;
  const supabase = await createSupabaseServerClient();
  const catParam = resolvedSearchParams?.cat;

  const { data: p } = await supabase
    .from("profiles")
    .select("id, slug, display_name, bio, profile_img, header_img, wa_e164, socials_config, storefront_config, is_public")
    .eq("slug", slug)
    .is("is_public", true)
    .maybeSingle();

  if (!p) return notFound();

  const { data: prod } = await supabase
    .from("products")
    .select("id, title, caption, price, thumb_url, visible, instagram_permalink, cta_label, cta_url")
    .eq("id", id)
    .eq("profile_id", p.id)
    .eq("visible", true)
    .maybeSingle();

  if (!prod) return notFound();

  const cfg = (p.storefront_config ?? {}) as StorefrontConfig;
  const theme = getThemeFromConfig(cfg);
  const backHref = catParam ? `/${p.slug}/c/${encodeURIComponent(catParam)}` : `/${p.slug}`;
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
          backHref={backHref}
          homeHref={`/${p.slug}`}
          contextLabel={prod.title}
          theme={theme}
        />

        <article className="grid gap-6 md:grid-cols-2">
          {prod?.thumb_url ? <ProductGallery images={[prod.thumb_url]} theme={theme} /> : null}

          <section className={`${theme.card} bg-white/90 p-4`}>
            <h1 className="text-xl font-semibold" style={{ color: theme.text }}>
              {prod.title}
            </h1>

            {prod.price ? (
              <div className="mt-2 text-lg font-medium" style={{ color: theme.primary }}>
                {prod.price}
              </div>
            ) : null}

            {prod.caption ? <ReactMarkdown>{prod.caption}</ReactMarkdown> : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <CTAButtons
                accent={theme.accent}
                cfg={cfg}
                themeVariant={theme.variant}
                whatsapp={(p.wa_e164 ?? undefined) as string | undefined}
                instagramUrl={prod.instagram_permalink ?? undefined}
                customLabel={prod.cta_label ?? undefined}
                customUrl={prod.cta_url ?? undefined}
                btnTone="solid"
              />
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
