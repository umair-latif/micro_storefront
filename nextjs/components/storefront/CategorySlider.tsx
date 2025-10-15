"use client";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import * as React from "react";

type Category = { id: string | number; name: string; cover_img?: string | null };
type CategoryNavStyle = "auto" | "chips" | "pills" | "square";

function hexToRgba(hex?: string, a = 1, fallback = "#111111") {
  const h = (hex || fallback).replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function resolveStyle(
  themeVariant?: "clean" | "bold" | "minimal",
  style?: CategoryNavStyle
): Exclude<CategoryNavStyle, "auto"> {
  if (style && style !== "auto") return style;
  switch (themeVariant) {
    case "bold":
      return "chips";
    case "minimal":
      return "square";
    case "clean":
    default:
      return "pills";
  }
}

export default function CategorySlider({
  categories,
  activeId,
  basePath,
  categoryBasePath,
  theme,
  style = "auto", // explicit override wins
}: {
  categories: Category[];
  activeId: string | number;
  basePath: string; // `/${slug}`
  categoryBasePath?: string; // `/${slug}/c`
  theme: any; // resolved theme from getThemeFromConfig
  style?: CategoryNavStyle; // "auto" | "chips" | "pills" | "square"
}) {
  const search = useSearchParams();
  const paramsBase = new URLSearchParams(search.toString());

  // 1) Figure out the theme variant and tokens robustly
  const variant: "clean" | "bold" | "minimal" =
    (theme?.variant as any) || "clean";

  const primary =
    theme?.palette?.primary ??
    theme?.palette?.accent ??
    theme?.primary ??
    theme?.accent ??
    "#111111";

  const accent =
    theme?.palette?.accent ??
    theme?.palette?.primary ??
    theme?.accent ??
    theme?.primary ??
    "#4b5563";

  const text =
    theme?.palette?.text ??
    theme?.text ??
    "#111111";

  const surface =
    theme?.palette?.surface ??
    theme?.surface ??
    "#ffffff";

  const border = "rgba(0,0,0,.08)";

  // 2) Resolve the style (prop wins, else variant)
  const resolvedStyle = React.useMemo(
    () => resolveStyle(variant, style),
    [variant, style]
  );

  // 3) CSS variables for consistent hover/active styles
  const cssVars: React.CSSProperties = {
    // @ts-ignore custom CSS vars
    "--sf-text": text,
    "--sf-surface": surface,
    "--sf-border": border,
    "--sf-primary": primary,
    "--sf-accent": accent,
  };

  return (
    <div
      className="sticky top-0 z-10 -mx-4 mb-4 border-b border-black/5 bg-black/0 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-black/0"
      style={cssVars}
    >
      <div className="no-scrollbar flex gap-2 overflow-x-auto py-0.5">
        {categories.map((c) => {
          const isActive = String(c.id) === String(activeId);

          // Build href:
          const idStr = String(c.id);
          let href: string;
          if (idStr.toLowerCase() === "all") {
            href = basePath; // landing
          } else if (categoryBasePath) {
            href = `${categoryBasePath}/${encodeURIComponent(idStr)}`; // /slug/c/id
          } else {
            const params = new URLSearchParams(paramsBase.toString());
            params.set("cat", idStr);
            href = `${basePath}?${params.toString()}`; // legacy fallback
          }

          // ---------- SQUARE (minimal) ----------
          if (resolvedStyle === "square") {
            return (
              <Link
                key={c.id}
                href={href}
                prefetch={false}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm transition",
                  "border",
                  isActive
                    ? "border-[var(--sf-primary)]/40 bg-[var(--sf-primary)]/6"
                    : "border-[var(--sf-border)] hover:bg-black/5",
                ].join(" ")}
                style={{ color: "var(--sf-text)", background: "var(--sf-surface)" }}
              >
                {c.name}
              </Link>
            );
          }

          // ---------- CHIPS (bold) ----------
          if (resolvedStyle === "chips") {
            return (
              <Link
                key={c.id}
                href={href}
                prefetch={false}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "inline-flex items-center rounded-xl px-3 py-2 text-sm transition border",
                  isActive
                    ? "border-[var(--sf-primary)]/50 bg-[var(--sf-primary)]/10 shadow-sm"
                    : "border-[var(--sf-border)] bg-[var(--sf-surface)] hover:bg-black/5 hover:shadow",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sf-primary)]/40",
                ].join(" ")}
                style={{ color: "var(--sf-text)" }}
              >
                {c.name}
              </Link>
            );
          }

          // ---------- PILLS (clean / default) ----------
          return (
            <Link
              key={c.id}
              href={href}
              prefetch={false}
              aria-current={isActive ? "page" : undefined}
              className={[
                "inline-flex items-center rounded-full px-3 py-1.5 text-sm transition-shadow border",
                isActive
                  ? "border-[var(--sf-primary)]/50 bg-[var(--sf-primary)]/8 shadow-sm"
                  : "border-[var(--sf-border)] bg-[var(--sf-surface)] hover:bg-black/5 hover:shadow",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sf-primary)]/40",
              ].join(" ")}
              style={{ color: "var(--sf-text)" }}
            >
              {c.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
