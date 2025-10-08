"use client";
import Link from "next/link";
import Image from "next/image";
import CategoryCard from "@/components/storefront/CategoryCard";
import { type Category } from "@/lib/types";

export default function CategoryListView({
  categories,
  view,
  basePath,
  theme,
}: {
  categories: Category[];
  view: "grid" | "list" | "links";
  basePath: string;
  theme: any;
}) {
  if (view === "links") {
    return (
      <section className="mx-auto flex max-w-md flex-col gap-3">
        {categories.map((c) => (
          <Link key={c.id} href={`${basePath}?cat=${c.id}`} className="rounded-full border border-black/10 px-5 py-3 text-center shadow-sm hover:shadow" style={{ background: "white", color: theme.text }}>
            <div className="text-base font-medium">{c.name}</div>
          </Link>
        ))}
      </section>
    );
  }
  if (view === "list") {
  return (
    <section className="flex flex-col gap-3">
      {categories.map((c) => (
        <Link key={c.id} href={`${basePath}?cat=${c.id}`} className={`${theme.card} flex items-center gap-3 p-3 hover:shadow-md`}>
          <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-black/5">
             {c.cover_img ? <Image src={c.cover_img} alt={c.name} fill className="object-cover" /> : null}
          </div>
          <div className="text-xl font-medium" style={{ color: theme.text }}>{c.name}</div>
        </Link>
      ))}
    </section>
  );
}
  // grid (default)
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {categories.map((c) => (
        <CategoryCard key={c.id} cat={c} basePath={basePath} theme={theme} />
      ))}
    </section>
  );
}
