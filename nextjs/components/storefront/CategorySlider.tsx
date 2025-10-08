"use client";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import * as React from "react";

type Category = { id: string | number; name: string; cover_img?: string | null };

function hexToRgba(hex?: string, a = 1, fallback = "#111111") {
  const h = (hex || fallback).replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export default function CategorySlider({
  categories,
  activeId,
  basePath,
  theme,
}: {
  categories: Category[];
  activeId: string | number;
  basePath: string;
  theme: any; // resolved theme from getThemeFromConfig
}) {
  const search = useSearchParams();
  const paramsBase = new URLSearchParams(search.toString());

  // normalize theme bits + CSS vars for reliable hover/active styles
  const variant: "clean" | "bold" | "minimal" =
    (theme?.variant as any) || "clean";

  const primary = theme?.primary || theme?.accent || "#111111";
  const accent = theme?.accent || theme?.primary || "#4b5563";
  const text = theme?.text || "#111111";
  const surface = theme?.surface || "#ffffff";
  const border = "rgba(0,0,0,.08)";

  const cssVars: React.CSSProperties = {
    // use CSS vars so we don't fight Tailwind's hover classes
    // @ts-ignore
    "--sf-text": text,
    "--sf-surface": surface,
    "--sf-border": border,
    "--sf-primary": primary,
    "--sf-accent": accent,
  };

  return (
    <div
      className="sticky top-0 z-10 -mx-4 mb-4 border-b border-black/5 bg-white/70 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/50"
      style={cssVars}
    >
      <div className="no-scrollbar flex gap-2 overflow-x-auto py-0.5">
        {categories.map((c) => {
          const isActive = String(c.id) === String(activeId);
          const params = new URLSearchParams(paramsBase.toString());
          params.set("cat", String(c.id));
          const href = `${basePath}?${params.toString()}`;

          /** ---------- BOLD: “stories”-like discs ---------- */
          if (variant === "bold") {
            const ringColor = isActive ? "ring-[var(--sf-primary)]/70" : "ring-black/10";
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
                  className="line-clamp-1 w-20 text-center text-xs"
                  style={{ color: "var(--sf-text)" }}
                >
                  {c.name}
                </span>
              </Link>
            );
          }

          /** ---------- MINIMAL: rounded squares ---------- */
          if (variant === "minimal") {
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
                    ? "border-[var(--sf-primary)]/40 bg-[var(--sf-primary)]/5"
                    : "border-[var(--sf-border)] hover:bg-black/5",
                ].join(" ")}
                style={{ color: "var(--sf-text)", background: "var(--sf-surface)" }}
              >
                {c.name}
              </Link>
            );
          }

          /** ---------- CLEAN (default): pills with clear active/hover ---------- */
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
