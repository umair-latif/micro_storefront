"use client";
import ProductCard from "@/components/storefront/ProductCard";
import Link from "next/link";
import { type Product } from "@/lib/types";

export default function ProductViews({ products, view, theme }: { products: Product[], view: "grid" | "list" | "links", theme: any }) {
  if (view === "links") return <Linktree products={products} theme={theme} />;
  if (view === "list") return <List products={products} theme={theme} />;
  return <Grid products={products} theme={theme} />;
}

function Grid({ products, theme }: { products: Product[], theme: any }) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {products.map((p) => (<ProductCard key={p.id} product={p} theme={theme} variant="grid" />))}
    </section>
  );
}

function List({ products, theme }: { products: Product[], theme: any }) {
  return (
    <section className="flex flex-col gap-3">
      {products.map((p) => (<ProductCard key={p.id} product={p} theme={theme} variant="list" />))}
    </section>
  );
}

function Linktree({ products, theme }: { products: Product[], theme: any }) {
  return (
    <section className="mx-auto flex max-w-md flex-col gap-3">
      {products.map((p) => {
        const label = p.cta_label || p.title;
        const href = p.cta_url || "#";
        return (<Link key={p.id} href={href} className="rounded-full border border-black/10 px-5 py-3 text-center shadow-sm hover:shadow" style={{ background: "white", color: theme.text }}>
            <div className="text-base font-medium">{label}</div></Link>);
      })}
    </section>
  );
}
