// components/storefront/CategorySlider.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

type Category = { id: string; name: string; cover_img?: string | null };

function hexToRgba(hex?: string, a = 1, fallback = "#111111") {
  const h = (hex || fallback).replace("#", "");
  const full = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export default function CategorySlider({
  categories,
  activeId,
  basePath,
  theme,
}: {
  categories: Category[];
  activeId: string;
  basePath: string;
  theme: any; // resolved theme from getThemeFromConfig
}) {
  const search = useSearchParams();
  const params = new URLSearchParams(search.toString());

  // Try to detect variant + colors from your resolved theme
  const variant: "clean" | "bold" | "minimal" =
    (theme?.variant as any) || "clean";
  const primary = theme?.primary || theme?.accent; // prefer primary if provided
  const accent = theme?.accent || theme?.text;

  return (
    <div className="sticky top-0 z-10 -mx-4 mb-4 border-b border-black/5 bg-white/70 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {categories.map((c) => {
          const isActive = String(c.id) === String(activeId);
          params.set("cat", String(c.id));
          const href = `${basePath}?${params.toString()}`;

          if (variant === "bold") {
            // Instagram-like discs
            const gradient = `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`;
            return (
              <Link
                key={c.id}
                href={href}
                className="group inline-flex flex-col items-center gap-1.5 px-1.5"
                title={c.name}
              >
                <span
                  className={[
                    "relative inline-flex h-14 w-14 items-center justify-center rounded-full p-[1px]",
                    isActive ? "ring-2 ring-black/50" : "ring-0",
                  ].join(" ")}
                  style={{ background: gradient }}
                >
                  <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-white p-[2px]">
                    <span className="relative h-full w-full overflow-hidden rounded-full bg-neutral-100">
                      {c.cover_img ? (
                        <Image
                          src={c.cover_img}
                          alt={c.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(135deg, ${hexToRgba(primary, 0.25)}, ${hexToRgba(accent, 0.25)})`,
                          }}
                        />
                      )}
                    </span>
                  </span>
                </span>
                <span
                  className="line-clamp-1 w-16 text-center text-xs"
                  style={{ color: theme.text }}
                >
                  {c.name}
                </span>
              </Link>
            );
          }

          if (variant === "minimal") {
            // Rounded squares
            return (
              <Link
                key={c.id}
                href={href}
                className={[
                  "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm transition",
                  isActive
                    ? "outline outline-2 outline-black/10"
                    : "hover:bg-black/5",
                ].join(" ")}
                style={{
                  color: theme.text,
                  background: theme.surface,
                  border: "1px solid rgba(0,0,0,.08)",
                }}
              >
                {c.name}
              </Link>
            );
          }

          // CLEAN (default): pills
          return (
            <Link
              key={c.id}
              href={href}
              className={[
                "inline-flex items-center rounded-full px-3 py-1.5 text-sm transition-shadow",
                isActive ? "ring-2 ring-black/10" : "",
              ].join(" ")}
              style={{
                color: theme.text,
                background: theme.surface,
                border: "1px solid rgba(0,0,0,.08)",
              }}
            >
              {c.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
