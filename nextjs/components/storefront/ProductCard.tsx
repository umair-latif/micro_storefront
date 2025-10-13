// components/storefront/ProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { type Product } from "@/lib/types";
// Import the existing CTA component
import CTAButtons from "@/components/storefront/CTAButtons"; 

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
  variant?: ProductCardVariant; // Use the extended type
  whatsapp?: string | null;
  activeCatId?: string;
}) {
  const q = activeCatId && activeCatId !== "all" ? `?cat=${activeCatId}` : "";
  const productPageHref = `/${slug}/p/${product.id}${q}`;
  const showPrice = Boolean(product.price && product.price.trim() !== "");
  
  // Check for CTAs provided by the product itself
  const hasProductCustomCta = Boolean(product.cta_label && product.cta_url); 
  const hasInstagram = Boolean(product.instagram_permalink);
  const hasWhatsapp = Boolean(waHref(whatsapp)); // WA visibility determined by profile WA number

  // --- Dynamic Click Logic ---
  const hasCaption = Boolean(product.caption);
  
  // If product has a caption, link to the product's dedicated page.
  // If no caption, link directly to Instagram permalink (if available), otherwise default to product page.
  const mainLinkHref = hasCaption ? productPageHref : product.instagram_permalink || productPageHref;
  const WrapperTag = hasCaption || !product.instagram_permalink ? Link : "a";
  const wrapperProps = hasCaption || !product.instagram_permalink 
    ? { href: mainLinkHref } 
    : { href: mainLinkHref, target: "_blank", rel: "noopener noreferrer" };

  // Determine card base styling
  const isList = variant === "list";
  const isIgGrid = variant === "grid-ig"; // Grid 3: Image-only
  const isLargeGrid = variant === "grid-large"; // Grid 1: Larger image, centered title
  
  const CardWrap = ({ children }: { children: React.ReactNode }) =>
    isList ? (
      <div className={`${theme.card} flex gap-3 p-3`}>{children}</div>
    ) : isIgGrid ? (
      // Instagram style is image-only, no default card border/shadow
      <div className="overflow-hidden">{children}</div>
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
        // Link to product page or IG, only if not in IgGrid, otherwise it's just a standard Link
        className={isList ? "h-24 w-24 shrink-0" : isIgGrid ? "block" : "block"}
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
              className={`line-clamp-1 text-sm font-medium ${isLargeGrid ? 'text-center' : ''}`} 
              style={{ color: theme.text }}
            >
              {product.title}
            </div>
            {/* Show caption only if not large grid (grid_1) */}
            {product.caption && !isLargeGrid ? (
              <div className="mt-0.5 line-clamp-2 text-xs" style={{ color: theme.muted }}>
                {product.caption}
              </div>
            ) : null}
          </WrapperTag>

          {/* price + custom CTA (internal to product) */}
          <div className={`mt-2 flex flex-wrap items-center ${isLargeGrid ? 'justify-center' : 'gap-2'}`}>
            {showPrice ? (
              <span className="rounded-full px-2 py-1 text-xs" style={{ background: theme.surface, color: theme.text, border: "1px solid rgba(0,0,0,.08)" }}>
                {product.price}
              </span>
            ) : null}

            {/* Legacy/product-level custom CTA: only show if not large grid */}
            {hasProductCustomCta && !isLargeGrid ? ( 
              <a
                href={product.cta_url!}
                target="_blank"
                rel="noopener noreferrer"
                className={`${theme.button} h-8 px-3 text-xs`}
                style={{ background: theme.accent, color: "#fff" }}
                onClick={(e) => e.stopPropagation()}
              >
                {product.cta_label}
              </a>
            ) : null}
          </div>

          {/* --- Full-Width CTA Buttons Section --- */}
          {(hasWhatsapp || hasInstagram || hasProductCustomCta) && (
            <div className={`mt-3 ${isList ? 'block' : 'block'}`}>
              <CTAButtons
                whatsapp={hasWhatsapp ? whatsapp! : undefined}
                instagramUrl={hasInstagram ? product.instagram_permalink! : undefined}
                customLabel={hasProductCustomCta ? product.cta_label! : undefined}
                customUrl={hasProductCustomCta ? product.cta_url! : undefined}
                accent={theme.accent}
                // Styling for full-width/side-by-side
                buttonClass="flex-1 text-center rounded-lg px-4 py-2 border-none shadow-md hover:shadow-lg transition-shadow"
              />
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
