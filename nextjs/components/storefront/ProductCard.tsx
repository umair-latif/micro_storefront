"use client";
import Image from "next/image";
import Link from "next/link";
import { type Product } from "@/lib/types";

export default function ProductCard({ product, theme, variant = "grid" }: { product: Product, theme: any, variant?: "grid" | "list" }) {
  const ctaLabel = product.cta_label ?? (product.price ? `Buy • ${formatPrice(product.price)}` : "View");
  const ctaHref = product.cta_url ?? "#";
  return (
    <article className={`${theme.card} ${variant === "list" ? "flex items-center gap-4 p-3" : "p-3"}`}> 
      <div className={`${variant === "list" ? "h-16 w-16" : "h-48 w-full"} overflow-hidden rounded-xl bg-black/5`}>
        {product.thumb_url ? (<Image src={product.thumb_url} alt={product.title} width={400} height={300} className="h-full w-full object-cover" />) : null}
      </div>
      <div className={`${variant === "list" ? "flex-1" : "mt-3"}`}>
        <h3 className="text-base font-medium" style={{ color: theme.text }}>{product.title}</h3>
        {product.caption ? (<p className="mt-1 line-clamp-2 text-sm" style={{ color: theme.muted }}>{product.caption}</p>) : null}
        <div className="mt-3">
          <Link href={ctaHref} className={`${theme.button} inline-flex items-center gap-2`} style={{ background: theme.accent, color: "white" }}>
            <span>{ctaLabel}</span><span aria-hidden>↗</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

function formatPrice(v?: string | null) {
  if (!v) return "";
  const num = Number(v);
  if (!Number.isFinite(num)) return v;
  try { return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(num); }
  catch { return `$${num}`; }
}
