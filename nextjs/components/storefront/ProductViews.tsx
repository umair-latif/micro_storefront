// components/storefront/ProductViews.tsx
"use client";
import ProductCard from "@/components/storefront/ProductCard";
import Link from "next/link";
import { type Product } from "@/lib/types";

export default function ProductViews({
  products, view, theme, slug, whatsapp, activeCatId = "all",
}: {
  products: Product[];
  view: "grid" | "list" | "links";
  theme: any;
  slug: string;
  whatsapp?: string | null;
  activeCatId?: string;
}) {
  if (view === "links") return <Linktree products={products} theme={theme} slug={slug} activeCatId={activeCatId} />;
  if (view === "list")   return <List products={products} theme={theme} slug={slug} whatsapp={whatsapp} activeCatId={activeCatId} />;
  return <Grid products={products} theme={theme} slug={slug} whatsapp={whatsapp} activeCatId={activeCatId} />;
}

function Grid({ products, theme, slug, whatsapp, activeCatId }: any) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {products.map((p: Product) => (
        <ProductCard key={p.id} product={p} theme={theme} variant="grid" slug={slug} whatsapp={whatsapp} activeCatId={activeCatId} />
      ))}
    </section>
  );
}
function List({ products, theme, slug, whatsapp, activeCatId }: any) {
  return (
    <section className="flex flex-col gap-3">
      {products.map((p: Product) => (
        <ProductCard key={p.id} product={p} theme={theme} variant="list" slug={slug} whatsapp={whatsapp} activeCatId={activeCatId} />
      ))}
    </section>
  );
}
function Linktree({ products, theme, slug, activeCatId }: any) {
  return (
    <section className="mx-auto flex max-w-md flex-col gap-3">
      {products.map((p: Product) => {
        const q = activeCatId && activeCatId !== "all" ? `?cat=${activeCatId}` : "";
        const href = `/${slug}/p/${p.id}${q}`;
        return (
          <Link key={p.id} href={href} className="rounded-full border border-black/10 px-5 py-3 text-center shadow-sm hover:shadow" style={{ background: "white", color: theme.text }}>
            <div className="text-base font-medium">{p.title}</div>
          </Link>
        );
      })}
    </section>
  );
}
