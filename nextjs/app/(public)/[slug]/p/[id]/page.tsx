// app/(public)/[slug]/p/[id]/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getThemeFromConfig } from "@/lib/theme";
import type { StorefrontConfig, Product, SocialsConfig } from "@/lib/types";
import CTAButtons from "@/components/storefront/CTAButtons";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";
import ProductGallery from "@/components/storefront/ProductGallery";

type ProfileRow = {
  id: string;
  slug: string;
  display_name: string;
  bio: string | null;
  profile_img: string | null;
  header_img: string | null;
  wa_e164: string | null;
  socials_config: unknown | null;
  storefront_config: StorefrontConfig | null;
  is_public: boolean | null;
};

type Params = { slug: string; id: string };

export async function generateMetadata(
  { params }: { params: Params },
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const supabase = createSupabaseServerClient();

  const { data: prof } = await supabase
    .from("profiles")
    .select("id, slug, display_name, bio, header_img, storefront_config, is_public")
    .eq("slug", params.slug)
    .is("is_public", true)
    .maybeSingle();

  if (!prof) return { title: "Product • Storefront" };

  const { data: product } = await supabase
    .from("products")
    .select("id, title, caption, thumb_url, visible")
    .eq("id", params.id)
    .eq("profile_id", prof.id)
    .eq("visible", true)
    .maybeSingle();

  const title = product?.title ? `${product.title} • ${prof.display_name}` : prof.display_name;
  const description = product?.caption ?? (prof as any)?.bio ?? "View product";
  const image = product?.thumb_url ?? (prof as any)?.header_img ?? "/og-default.jpg";

  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: image }], type: "website" },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function ProductPage({ params, searchParams }: { params: Params; searchParams: { cat?: string } }) {

  const supabase = createSupabaseServerClient();
  const catParam = searchParams?.cat;
  let catLabel: string | null = null;
  // 1) profile (must be public)
  const { data: p } = await supabase
    .from("profiles")
    .select("id, slug, display_name, bio, profile_img, header_img, wa_e164, socials_config, storefront_config, is_public")
    .eq("slug", params.slug)
    .is("is_public", true)
    .maybeSingle();

  if (!p) return notFound();

  // 2) product (must belong to profile + visible)
  const { data: prod } = await supabase
    .from("products")
    .select("id, title, caption, price, thumb_url, visible, instagram_permalink, cta_label, cta_url")
    .eq("id", params.id)
    .eq("profile_id", p.id)
    .eq("visible", true)
    .maybeSingle();

  if (!prod) return notFound();

  const cfg = ((p.storefront_config ?? {}) as StorefrontConfig);
  const theme = getThemeFromConfig(cfg);

  return (
    <main className={theme.wrapper} style={{ background: theme.background }}>
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
        {/* header follows your new rules}
        <StorefrontHeader
          displayName={p.display_name}
          bio={p.bio}
          avatarUrl={p.profile_img}
          coverUrl={p.header_img}
          socials={p.socials_config as SocialsConfig | null}
          whatsapp={p.wa_e164}
          theme={theme}
        />
        {*/}

        <div className="mb-4">
        <Link
          href={catParam ? `/${p.slug}?cat=${catParam}` : `/${p.slug}`}
          className="text-sm underline-offset-4 hover:underline"
          style={{ color: theme.muted }}
        >
          ← Back to {catParam ? (catLabel || "category") : p.display_name}
        </Link>
      </div>

        <article className="grid gap-6 md:grid-cols-2">
          {/* gallery */}
          {prod?.thumb_url && (
            <ProductGallery
              images={[prod.thumb_url]}
              theme={theme}
            />
          )}

          {/* details */}
          <section className={`${theme.card} p-4`}>
            <h1 className="text-xl font-semibold" style={{ color: theme.text }}>
              {prod.title}
            </h1>

            {prod.price ? (
              <div className="mt-2 text-lg font-medium" style={{ color: theme.text }}>
                {prod.price}
              </div>
            ) : null}

            {prod.caption ? (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed" style={{ color: theme.muted }}>
                {prod.caption}
              </p>
            ) : null}

            {/* CTAs (unified look) */}
            <div className="mt-4 flex flex-wrap gap-2">
              <CTAButtons
                accent={theme.accent}
                cfg={cfg}
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
