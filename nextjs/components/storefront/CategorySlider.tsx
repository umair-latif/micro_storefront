"use client";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import * as React from "react";

type Category = { id: string | number; name: string; cover_img?: string | null };
type CategoryNavStyle = "auto" | "chips" | "pills" | "square" | "cards";

function hexToRgba(hex?: string, a = 1, fallback = "#111111") {
  const h = (hex || fallback).replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function resolveStyle(
  themeVariant?: "clean" | "bold" | "minimal",
  style?: CategoryNavStyle
): Exclude<CategoryNavStyle, "auto"> {
  if (style && style !== "auto") return style;
  switch (themeVariant) {
    case "bold": return "chips";
    case "minimal": return "square";
    case "clean":
    default: return "chips";
  }
}

export default function CategorySlider({
  categories,
  activeId,
  basePath,
  categoryBasePath,
  theme,
  navStyle = "auto",          // ✅ renamed override
  // @deprecated — keep for back-compat; if provided, it wins over navStyle
  style: legacyStyle,
}: {
  categories: Category[];
  activeId: string | number;
  basePath: string;           // `/${slug}`
  categoryBasePath?: string;  // `/${slug}/c`
  theme: any;                 // resolved from getThemeFromConfig
  navStyle?: CategoryNavStyle;
  /** @deprecated use navStyle */
  style?: CategoryNavStyle;
}) {
  const search = useSearchParams();
  const paramsBase = new URLSearchParams(search.toString());

  // --- normalize theme variant & tokens robustly ---
  const rawVariant = (theme?.variant ?? theme?.palette?.variant ?? "clean");
  const variant = String(rawVariant).toLowerCase() as "clean" | "bold" | "minimal";

  const primary = theme?.palette?.primary ?? theme?.palette?.accent ?? theme?.primary ?? theme?.accent ?? "#111111";
  const accent  = theme?.palette?.accent  ?? theme?.palette?.primary ?? theme?.accent  ?? theme?.primary ?? "#4b5563";
  const text    = theme?.palette?.text    ?? theme?.text ?? "#111111";
  const surface = theme?.palette?.surface ?? theme?.surface ?? "#ffffff";
  const border  = "rgba(0,0,0,.08)";

  // choose final style (legacy prop wins for b/c)
  const override = (legacyStyle ?? navStyle) as CategoryNavStyle;
  const resolvedStyle = React.useMemo(() => resolveStyle(variant, override), [variant, override]);
console.log("blablabalbalablabla");

  // optional: one-time debug so you can see what it resolved to
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.debug("[CategorySlider] variant:", variant, "override:", override, "→ resolved:", resolvedStyle);
    }
  }, [variant, override, resolvedStyle]);

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
      className="sticky top-0 z-10 -mx-4 mb-4 border-b border-black/5 bg-white/70 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/0"
      style={cssVars}
    >
      <div className="no-scrollbar flex gap-2 overflow-x-auto py-0.5">
        {categories.map((c) => {
          const isActive = String(c.id) === String(activeId);

          const idStr = String(c.id);
          let href: string;
          if (idStr.toLowerCase() === "all") {
            href = basePath;
          } else if (categoryBasePath) {
            href = `${categoryBasePath}/${encodeURIComponent(idStr)}`;
          } else {
            const params = new URLSearchParams(paramsBase.toString());
            params.set("cat", idStr);
            href = `${basePath}?${params.toString()}`;
          }

          // ---------- SQUARE ----------
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
          // ---------- CHIPS (bold / highlight-style) ----------
          if (resolvedStyle === "chips") {
            const ringColor = isActive
              ? "ring-[var(--sf-primary)]/70"
              : "ring-[var(--sf-border)]";
            const outerGrad = `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`;

            return (
              <Link
                key={c.id}
                href={href}
                prefetch={false}
                aria-current={isActive ? "page" : undefined}
                className="group inline-flex flex-col items-center gap-1.5 px-1.5"
                title={c.name}
              >
                <span
                  className={`relative inline-flex h-16 w-16 items-center justify-center rounded-full p-[2px] ring-2 transition-shadow ${ringColor} group-hover:ring-[var(--sf-primary)]/80`}
                  style={{ background: outerGrad }}
                >
                  <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-white p-[3px]">
                    <span className="relative h-full w-full overflow-hidden rounded-full bg-neutral-100 transition-transform group-hover:scale-[1.02]">
                      {c.cover_img ? (
                        <Image
                          src={c.cover_img}
                          alt={c.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <span
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(135deg, ${hexToRgba(
                              primary,
                              0.3
                            )}, ${hexToRgba(accent, 0.3)})`,
                          }}
                        />
                      )}
                    </span>
                  </span>
                </span>
                <span
                  className="line-clamp-1 w-20 text-center text-xs font-medium"
                  style={{ color: "var(--sf-text)" }}
                >
                  {c.name}
                </span>
              </Link>
            );
          }

          // ---------- CARDS (large square thumbnails) ----------
if (resolvedStyle === "cards") {
  const ringColor = isActive
    ? "ring-[var(--sf-primary)]/70"
    : "ring-[var(--sf-border)]";
  const outerGrad = `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`;

  return (
    <Link
      key={c.id}
      href={href}
      prefetch={false}
      aria-current={isActive ? "page" : undefined}
      className="group inline-flex flex-col items-center gap-2 px-1.5"
      title={c.name}
    >
      <span
        className={`relative inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl ring-2 transition-shadow ${ringColor} group-hover:ring-[var(--sf-primary)]/80`}
        style={{ background: outerGrad }}
      >
        <span className="inline-flex h-full w-full items-center justify-center rounded-lg bg-white p-[2px]">
          <span className="relative h-full w-full overflow-hidden rounded-lg bg-neutral-100 transition-transform group-hover:scale-[1.03]">
            {c.cover_img ? (
              <Image
                src={c.cover_img}
                alt={c.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <span
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${hexToRgba(
                    primary,
                    0.3
                  )}, ${hexToRgba(accent, 0.3)})`,
                }}
              />
            )}
          </span>
        </span>
      </span>
      <span
        className="line-clamp-1 w-24 text-center text-xs font-medium"
        style={{ color: "var(--sf-text)" }}
      >
        {c.name}
      </span>
    </Link>
  );
}

          // ---------- PILLS (default) ----------
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
