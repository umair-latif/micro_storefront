"use client";

import Image from "next/image";
import Link from "next/link";
import { type Product } from "@/lib/types";
import { Instagram, MessageCircle } from "lucide-react";

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
  whatsapp, // optional from profile; used for icon button
  activeCatId,
}: {
  product: Product;
  slug: string;
  theme: any;
  variant?: "grid" | "list";
  whatsapp?: string | null;
  activeCatId?: string;
}) {
  const q = activeCatId && activeCatId !== "all" ? `?cat=${activeCatId}` : "";
  const href = `/${slug}/p/${product.id}${q}`;
  const showPrice = Boolean(product.price && product.price.trim() !== "");
  const hasCustomCta = Boolean(product.cta_label && product.cta_url);
  const hasInstagram = Boolean(product.instagram_permalink);
  const hasWhatsapp = Boolean(waHref(whatsapp));

  const CardWrap = ({ children }: { children: React.ReactNode }) =>
    variant === "list" ? (
      <div className={`${theme.card} flex gap-3 p-3`}>{children}</div>
    ) : (
      <div className={`${theme.card} overflow-hidden`}>{children}</div>
    );

  return (
    <CardWrap>
      {/* media */}
      <Link href={href} className={variant === "list" ? "h-24 w-24 shrink-0" : "block"}>
        <div className={variant === "list" ? "relative h-24 w-24 overflow-hidden rounded-lg" : "relative aspect-square w-full overflow-hidden"}>
          {product.thumb_url ? (
            <Image src={product.thumb_url} alt={product.title} fill className="object-cover" />
          ) : (
            <div className="h-full w-full bg-neutral-100" />
          )}
        </div>
      </Link>

      {/* body */}
      <div className={variant === "list" ? "flex-1" : "p-3"}>
        <Link href={href} className="block">
          <div className="line-clamp-1 text-sm font-medium" style={{ color: theme.text }}>
            {product.title}
          </div>
          {product.caption ? (
            <div className="mt-0.5 line-clamp-2 text-xs" style={{ color: theme.muted }}>
              {product.caption}
            </div>
          ) : null}
        </Link>

        {/* price + custom CTA */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {showPrice ? (
            <span className="rounded-full px-2 py-1 text-xs" style={{ background: theme.surface, color: theme.text, border: "1px solid rgba(0,0,0,.08)" }}>
              {product.price}
            </span>
          ) : null}

          {hasCustomCta ? (
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

        {/* socials (icons) */}
        
      </div>
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
