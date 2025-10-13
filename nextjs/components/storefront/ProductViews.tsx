
// components/storefront/ProductViews.tsx
"use client";
import ProductCard from "@/components/storefront/ProductCard";
import Link from "next/link";
import { type Product } from "@/lib/types";

// Extended type for the view prop
type ProductViewVariant = "grid" | "list" | "links" | "grid_1" | "grid_2" | "grid_3";

export default function ProductViews({
  products, view, theme, slug, whatsapp, activeCatId = "all",
}: {
  products: Product[];
  view: ProductViewVariant; // Use the extended type
  theme: any;
  slug: string;
  whatsapp?: string | null;
  activeCatId?: string;
}) {
  if (view === "links") return <Linktree products={products} theme={theme} slug={slug} activeCatId={activeCatId} />;
  if (view === "list")   return <List products={products} theme={theme} slug={slug} whatsapp={whatsapp} activeCatId={activeCatId} />;
  
  // All grid variants are handled by the Grid component
  return <Grid products={products} theme={theme} slug={slug} whatsapp={whatsapp} activeCatId={activeCatId} gridVariant={view} />;
}

function Grid({ products, theme, slug, whatsapp, activeCatId, gridVariant }: any) {
  // Determine grid columns based on the new view variants
  let columns;
  let gapClass = "gap-4";
  let cardVariant: "grid" | "grid-large" | "grid-clean" | "grid-ig"; // Map view to internal card variant

  switch (gridVariant) {
    case "grid_1": // 1 column: larger slightly rectangular product image with title underneath in middle.
      columns = "grid-cols-1";
      cardVariant = "grid-large";
      break;
    case "grid_2": // 2 columns: only square images with clean lines and clean distance in between
      columns = "grid-cols-2";
      cardVariant = "grid-clean";
      break;
    case "grid_3": // 3 columns: very instagram style grid, only images.
      columns = "grid-cols-3";
      gapClass = "gap-2";
      cardVariant = "grid-ig";
      break;
    case "grid": // Default (compatibility)
    default:
      columns = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      cardVariant = "grid";
      break;
  }

  return (
    <section className={`grid ${columns} ${gapClass}`}>
      {products.map((p: Product) => (
        <ProductCard 
          key={p.id} 
          product={p} 
          theme={theme} 
          variant={cardVariant} 
          slug={slug} 
          whatsapp={whatsapp} 
          activeCatId={activeCatId} 
        />
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
