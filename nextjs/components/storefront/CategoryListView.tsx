"use client";

import Link from "next/link";
import Image from "next/image";
import CategoryCard from "@/components/storefront/CategoryCard";
import SfButton from "@/components/storefront/SfButton";
import {
  getDefaultButtonStyle,
  getDefaultButtonShadow,
  getDefaultButtonTone,
} from "@/lib/theme";
import type {
  Category,
  StorefrontTheme,
  ButtonStyle,
  ButtonShadow,
  ButtonTone,
} from "@/lib/types";

type Props = {
  categories: Category[];
  view: "grid" | "list" | "links";
  basePath: string;
  theme: StorefrontTheme | any;
  columns?: 2 | 3 | 4;
};

export default function CategoryListView({
  categories,
  view,
  basePath,
  theme,
  columns = 3,
}: Props) {
  // Shim config so we can feed theme into helpers that expect cfg
  const cfgShim = { theme } as any;

  const btnStyle = getDefaultButtonStyle(cfgShim) as ButtonStyle;
  const btnShadow = getDefaultButtonShadow(cfgShim) as ButtonShadow;
  const btnTone = getDefaultButtonTone(cfgShim) as ButtonTone;

  // 1. LINKS VIEW: pill-style button links
  if (view === "links") {
    return (
      <section className="mx-auto flex max-w-md flex-col gap-3">
        {categories.map((c) => (
          <SfButton
            key={c.id ?? c.name} // ✅ unique key here
            href={`${basePath}/c/${c.id}`}
            theme={theme}
            size="md"
            fullWidth
            btnStyle={btnStyle}
            btnShadow={btnShadow}
            btnTone={btnTone}
          >
            <span className="text-base font-medium">{c.name}</span>
          </SfButton>
        ))}
      </section>
    );
  }

  // 2. LIST VIEW: media row list
  if (view === "list") {
    return (
      <section className="flex flex-col gap-3">
        {categories.map((c) => (
          <SfButton
            key={c.id ?? c.name} // ✅ unique key here
            href={`${basePath}/c/${c.id}`}
            theme={theme}
            size="md"
            fullWidth
            btnStyle={btnStyle}
            btnShadow={btnShadow}
            btnTone={btnTone}
            className="flex items-center gap-3 !text-left p-3"
          >
            <span className="relative h-24 w-24 overflow-hidden rounded-lg bg-black/5 shrink-0">
              {c.cover_img ? (
                <Image
                  src={c.cover_img}
                  alt={c.name}
                  fill
                  className="object-cover"
                />
              ) : null}
            </span>

            <span
              className="text-xl font-medium"
              style={{ color: theme.text }}
            >
              {c.name}
            </span>
          </SfButton>
        ))}
      </section>
    );
  }

  // 3. GRID (default): uses CategoryCard
  const gridCols =
    columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : columns === 4
      ? "grid-cols-3 sm:grid-cols-3 lg:grid-cols-4"
      : "grid-cols-3 sm:grid-cols-3 lg:grid-cols-3"; // default 3

  return (
    <section className={`grid gap-4 ${gridCols}`}>
      {categories.map((c) => (
        <CategoryCard
          key={c.id ?? c.name} // ✅ key here too
          cat={c}
          basePath={basePath}
          theme={theme}
        />
      ))}
    </section>
  );
}
