"use client";
import Link from "next/link";
import Image from "next/image";
import CategoryCard from "@/components/storefront/CategoryCard";
import { type Category, type StorefrontTheme } from "@/lib/types";

type Props = {
  categories: Category[];
  view: "grid" | "list" | "links";
  basePath: string;
  theme: StorefrontTheme | any; // keep flexible if your theme resolver augments it
  /** Optional: number of columns for grid/cover-wall (defaults to 3) */
  columns?: 2 | 3 | 4;
};

export default function CategoryListView({
  categories,
  view,
  basePath,
  theme,
  columns = 3,
}: Props) {
  // LINKS: pill-like links list
  if (view === "links") {
    return (
      <section className="mx-auto flex max-w-md flex-col gap-3">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`${basePath}/c/${c.id}`}
            className="rounded-full border border-black/10 px-5 py-3 text-center shadow-sm hover:shadow"
            style={{ background: "white", color: (theme as any)?.text }}
          >
            <div className="text-base font-medium">{c.name}</div>
          </Link>
        ))}
      </section>
    );
  }

  // LIST: media list with cover on the left
  if (view === "list") {
    return (
      <section className="flex flex-col gap-3">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`${basePath}/c/${c.id}`}
            className={`${(theme as any)?.card ?? "rounded-xl border border-black/10 bg-white"} flex items-center gap-3 p-3 hover:shadow-md`}
          >
            <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-black/5">
              {c.cover_img ? (
                <Image src={c.cover_img} alt={c.name} fill className="object-cover" />
              ) : null}
            </div>
            <div className="text-xl font-medium" style={{ color: (theme as any)?.text }}>
              {c.name}
            </div>
          </Link>
        ))}
      </section>
    );
  }

  // GRID (default) — supports dynamic columns (2/3/4)
  const gridCols =
    columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : columns === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"; // default 3

  return (
    <section className={`grid gap-4 ${gridCols}`}>
      {categories.map((c) => (
        <CategoryCard key={c.id} cat={c} basePath={basePath} theme={theme} />
      ))}
    </section>
  );
}
