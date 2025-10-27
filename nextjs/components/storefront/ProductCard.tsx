// components/storefront/ProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { type Product } from "@/lib/types";
import SfButton from "@/components/storefront/SfButton";
import ReactMarkdown from "react-markdown";
import { SpanStatus } from "next/dist/trace";


// Extended type for internal card variant
type ProductCardVariant = "grid" | "list" | "grid-large" | "grid-clean" | "grid-ig";

function onlyDigits(s?: string | null) {
  return (s ?? "").replace(/[^\d]/g, "");
}
function waHref(e164?: string | null) {
  const n = onlyDigits(e164);
  return n ? `https://wa.me/${n}` : null;
}

export default function ProductCard({
  product,
  slug,
  theme,
  variant = "grid",
  whatsapp,
  activeCatId,
}: {
  product: Product;
  slug: string;
  theme: any;
  variant?: ProductCardVariant;
  whatsapp?: string | null;
  activeCatId?: string;
}) {
  const q = activeCatId && activeCatId !== "all" ? `?cat=${activeCatId}` : "";
  const productPageHref = `/${slug}/p/${product.id}${q}`;
  const showPrice = Boolean(product.price && product.price.trim() !== "");

  // CTA flags
  const hasProductCustomCta = Boolean(product.cta_label && product.cta_url);
  const hasInstagram = Boolean(product.instagram_permalink);
  const wa = waHref(whatsapp);
  const hasWhatsapp = Boolean(wa);
  const borderColor = theme?.muted ?? "#fff";
  // --- Dynamic Click Logic ---
  const hasCaption = Boolean(product.caption);
  // If product has a caption, link to the product page.
  // If no caption, link directly to Instagram permalink (if available), otherwise product page.
  const mainLinkHref = hasCaption ? productPageHref : product.instagram_permalink || productPageHref;
  const WrapperTag = hasCaption || !product.instagram_permalink ? Link : "a";
  const wrapperProps =
    hasCaption || !product.instagram_permalink
      ? { href: mainLinkHref }
      : { href: mainLinkHref, target: "_blank", rel: "noopener noreferrer" };

  // Determine card base styling
  const isList = variant === "list";
  const isIgGrid = variant === "grid-ig";       // Grid 3: Image-only
  const isLargeGrid = variant === "grid-large"; // Grid 1: Larger image, centered title

  const CardWrap = ({ children }: { children: React.ReactNode }) =>
    isList ? (
      <div className={`${theme.card} flex gap-3 p-3 border`} style={{ borderColor }}>{children}</div>
    ) : isIgGrid ? (
      // Instagram style is image-only, no default card border/shadow
      <div className="overflow-hidden border-white">{children}</div>
    ) : (
      // Default, Grid 1, Grid 2 styles use the standard card styling
      <div className={`${theme.card} overflow-hidden`}>{children}</div>
    );

  // Determine image aspect ratio
  const imageAspect = isLargeGrid ? "aspect-[4/3]" : "aspect-square";

  // For Instagram grid, we wrap the image in the main clickable tag (WrapperTag)
  const MediaWrapper = isIgGrid ? WrapperTag : Link;

  return (
    <CardWrap>
      {/* Media */}
      <MediaWrapper
        {...wrapperProps}
        className={isList ? "h-24 w-24 shrink-0" : "block"}
      >
        <div
          className={
            isList
              ? "relative h-24 w-24 overflow-hidden rounded-lg"
              : `relative ${imageAspect} w-full overflow-hidden`
          }
        >
          {product.thumb_url ? (
            <Image
              src={product.thumb_url}
              alt={product.title}
              fill
              className="object-cover"
              sizes={isIgGrid ? "(max-width: 640px) 33vw, 15vw" : "(max-width: 640px) 100vw, 50vw"}
            />
          ) : (
            <div className="h-full w-full bg-neutral-100" />
          )}
        </div>
      </MediaWrapper>

      {/* body - Hidden for Instagram style grid (grid_3) */}
      {!isIgGrid && (
        <div className={isList ? "flex-1" : "p-3"}>
          {/* Title and Caption */}
          <WrapperTag {...wrapperProps} className="block">
            <div
              className={`line-clamp-1 text-sm font-medium ${isLargeGrid ? "text-center" : ""}`}
              style={{ color: theme.text }}
            >
              {product.title}
            </div>
            {/* Show caption only if not large grid (grid_1) */}
            {product.caption && !isLargeGrid ? (
              <span className="mt-0.5 line-clamp-2 text-xs" style={{ color: theme.muted }}>
                <ReactMarkdown>{product.caption}</ReactMarkdown>
              </span>
            ) : null}
          </WrapperTag>

          {/* price + custom CTA (internal to product) */}
          <div className={`mt-2 flex flex-wrap items-center ${isLargeGrid ? "justify-center" : "gap-2"}`}>
            {showPrice ? (
              <span
                className="rounded-full px-2 py-1 text-xs"
                style={{ background: theme.surface, color: theme.text, border: "1px solid rgba(0,0,0,.08)" }}
              >
                {product.price}
              </span>
            ) : null}

            {/* Legacy/product-level custom CTA: only show if not large grid }
            {hasProductCustomCta && !isLargeGrid ? (
              <SfButton
                href={product.cta_url!}
                theme={theme}
                size="sm"
                className="h-8 px-3 text-xs"
                colorSource="accent"   // match previous: accent-colored chip
                btnTone="solid"
              >
                {product.cta_label}
              </SfButton>
            ) : null}
            {Legacy/product-level custom CTA: only show if not large grid */}
          </div>

          {/* --- Full-Width CTA Buttons Section --- */}
          {(hasWhatsapp || hasInstagram || hasProductCustomCta) && (
            <div className="mt-3 grid grid-cols-1 gap-2">
              {hasWhatsapp ? (
                <SfButton
                  href={wa!}
                  theme={theme}
                  size="md"
                  fullWidth
                  colorSource="accent" // WA stands out on accent
                  btnTone="solid"
                >
                  WhatsApp
                </SfButton>
              ) : null}

              {hasInstagram ? (
                <SfButton
                  href={product.instagram_permalink!}
                  theme={theme}
                  size="md"
                  fullWidth
                  btnTone="outline"    // outline looks good for external links
                  // NOTE: If your SfButton supports target/rel, you can add them here:
                  // target="_blank" rel="noopener noreferrer"
                >
                  Instagram
                </SfButton>
              ) : null}

              {/* Keep parity with previous behavior: show custom CTA here as well */}
              {hasProductCustomCta ? (
                <SfButton
                  href={product.cta_url!}
                  theme={theme}
                  size="md"
                  fullWidth
                  colorSource="accent"
                  btnTone="solid"
                >
                  {product.cta_label}
                </SfButton>
              ) : null}
            </div>
          )}
        </div>
      )}
    </CardWrap>
  );
}

/** tiny util: hex -> rgba(alpha) */
function hexA(hex: string, a = 0.5, fallback = "#111111") {
  const h = (hex || fallback).replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
