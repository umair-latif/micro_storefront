"use client";

import Image from "next/image";
import SocialLinks from "@/components/storefront/SocialLinks";
import CTAButtons from "@/components/storefront/CTAButtons";
import { type SocialsConfig } from "@/lib/types";
import ReactMarkdown from "react-markdown";

type TopMode = "header" | "hero";
type HeaderStyle = "small" | "large-square" | "large-circle";

function withAlpha(hex: string | undefined, alpha: number, fallback = "#111111") {
  const h = (hex || fallback).replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function StorefrontHeader({
  displayName,
  bio,
  avatarUrl,
  coverUrl,
  socials,
  whatsapp,
  theme,
  mode = "header",                 // NEW: "header" (compact) or "hero" (full-bleed)
  headerStyle = "small",           // NEW: avatar/layout variant
}: {
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  socials: SocialsConfig | null;
  whatsapp: string | null;
  theme: any;
  mode?: TopMode;
  headerStyle?: HeaderStyle;
}) {
  const accentHover = withAlpha(theme?.accent, 0.5);

  // avatar sizing/shape per style
  const avatarDims = (() => {
    switch (headerStyle) {
      case "large-square": return { size: 112, cls: "rounded-2xl" };   // 28
      case "large-circle": return { size: 112, cls: "rounded-full" };
      case "small":
      default: return { size: 96, cls: "rounded-2xl" };                // 24
    }
  })();

  // HERO MODE (full-bleed cover + fade to content)
  if (mode === "hero") {
    return (
      <header className="mb-6 overflow-hidden rounded-2xl">
        <div className="relative w-full">
          <div
            className="relative h-[240px] w-full sm:h-[300px]"
            style={{
              WebkitMaskImage: `linear-gradient(to bottom, white 70%, transparent 100%)`,
              maskImage: `linear-gradient(to bottom, white 70%, transparent 100%)`,
              //background: coverUrl ? undefined : `linear-gradient(to bottom, ${theme.surface} 0%, ${theme.background} 85%)`,
            }}
          >
            {coverUrl ? (
              <Image src={coverUrl} alt="cover" fill className="object-cover" priority />
            ) : null}
          </div>

          <div className="relative px-4 pb-5 sm:px-6 -mt-16">
            {avatarUrl ? (
              <div className="mb-3 flex justify-center">
                <div
                  className={`overflow-hidden`}
                  style={{ width: avatarDims.size, height: avatarDims.size, borderRadius: headerStyle === "large-circle" ? "9999px" : undefined }}
                >
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    width={avatarDims.size}
                    height={avatarDims.size}
                    className={`h-full w-full object-cover ${avatarDims.cls}`}
                  />
                </div>
              </div>
            ) : null}

            <div className="flex flex-col items-center text-center">
              <h1 className="text-3xl font-semibold" style={{ color: theme.text }}>
                {displayName}
              </h1>

              {bio ? (
                <div className="mt-1 text-sm leading-relaxed" style={{ color: theme.text, whiteSpace: "pre-wrap" }}>
                  <ReactMarkdown>{bio}</ReactMarkdown>
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <SocialLinks socials={socials} mutedColor={theme.primary} accentColor={theme.accent} />
                {/*<CTAButtons
                  whatsapp={whatsapp ?? undefined}
                  accent={theme.accent}
                  className={theme.button}
                  hoverStyle={{ backgroundColor: accentHover, transition: "background-color .15s ease" }}
                />
                */}
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // HEADER MODE (compact)
  return (
    <header
      className="mb-6 rounded-2xl"
      style={{  backgroundColor: theme.surface
      ? `${theme.surface}44` // adds ~90% opacity if theme.surface is hex (#RRGGBB)
      : "rgba(255,255,255,0.6)",}}
    >
      <div className="flex flex-col items-center px-4 pt-6 pb-6 sm:pt-8 sm:pb-8">
        {avatarUrl ? (
          <div
            className="relative -mt-2 mb-4 overflow-hidden"
            style={{ width: avatarDims.size, height: avatarDims.size, borderRadius: headerStyle === "large-circle" ? "9999px" : undefined }}
          >
            <Image src={avatarUrl} alt={displayName} fill className={`object-cover ${avatarDims.cls}`} />
          </div>
        ) : null}

        <h1 className="text-xl font-semibold text-center" style={{ color: theme.text }}>
          {displayName}
        </h1>

        {bio ? (
          <div className="mt-2 max-w-2xl text-center text-sm leading-relaxed break-words" style={{ color: theme.text, whiteSpace: "pre-wrap" }}>
            <ReactMarkdown>{bio}</ReactMarkdown>
          </div>
        ) : null}

        <div className="mt-4 flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <SocialLinks socials={socials} mutedColor={theme.muted} />
          </div>

          <CTAButtons
            whatsapp={whatsapp ?? undefined}
            accent={theme.accent}
            className={`${theme.button} justify-center`}
            hoverStyle={{ backgroundColor: accentHover, transition: "background-color .15s ease" }}
          />
        </div>
      </div>
    </header>
  );
}
