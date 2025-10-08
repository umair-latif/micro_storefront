"use client";

import Image from "next/image";
import SocialLinks from "@/components/storefront/SocialLinks";
import CTAButtons from "@/components/storefront/CTAButtons";
import { type SocialsConfig } from "@/lib/types";

/** convert hex like #ef4444 to rgba(..., alpha) */
function withAlpha(hex: string | undefined, alpha: number, fallback = "#111111") {
  const h = (hex || fallback).replace("#", "");
  const bigint = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  const r = (bigint >> 16) & 255, g = (bigint >> 8) & 255, b = bigint & 255;
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
}: {
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  socials: SocialsConfig | null;
  whatsapp: string | null;
  theme: any; // your resolved theme tokens from getThemeFromConfig
}) {
  const accentHover = withAlpha(theme?.accent, 0.5);

  if (!coverUrl) {
    // ===== No header_img: centered “business card” header with theme background & fade =====
    return (
      <header
        className="mb-6 rounded-2xl"
        style={{
          background: `linear-gradient(to bottom, ${theme.surface} 0%, ${theme.background} 85%)`,
        }}
      >
        <div className="flex flex-col items-center px-4 pt-6 pb-6 sm:pt-8 sm:pb-8">
          <div className="relative -mt-2 mb-4 h-24 w-24 overflow-hidden rounded-2xl ring-2 ring-white sm:h-28 sm:w-28">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={displayName} fill className="object-cover" />
            ) : (
              <div className="h-full w-full bg-black/10" />
            )}
          </div>

          <h1 className="text-xl font-semibold text-center" style={{ color: theme.text }}>
            {displayName}
          </h1>

          {bio ? (
            <p
              className="mt-2 max-w-2xl text-center text-sm leading-relaxed break-words"
              style={{ color: theme.muted }}
            >
              {bio}
            </p>
          ) : null}

          <div className="mt-4 flex flex-col items-center gap-3">
            {/* socials center; half-transparent accent on hover */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <SocialLinks
                socials={socials}
                mutedColor={theme.muted}
              />
            </div>

            {/* unified CTA buttons (centered) */}
            <CTAButtons
              whatsapp={whatsapp ?? undefined}
              accent={theme.accent}
              buttonClass={`${theme.button} justify-center`}
              hoverStyle={{ backgroundColor: accentHover, transition: "background-color .15s ease" }}
            />
          </div>
        </div>
      </header>
    );
  }

  // ===== With header_img: image background, avatar left-middle, content inside header, fade to body =====
  return (
    <header className="mb-6 overflow-hidden rounded-2xl">
      <div className="relative w-full">
        {/* background image */}
        <div className="relative h-[220px] w-full sm:h-[260px]">
          <Image src={coverUrl} alt="cover" fill className="object-cover" priority />
          {/* fade into body color */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, rgba(0,0,0,0) 30%, ${withAlpha(theme.background, 0.95)} 100%)`,
            }}
          />
        </div>

        {/* content overlay, auto-height based on bio & icons */}
        <div className="relative -mt-16 px-4 pb-5 sm:px-6">
          <div className="grid grid-cols-[auto,1fr] items-center gap-4">
            {/* avatar on the left middle */}
            <div className="h-20 w-20 overflow-hidden rounded-2xl ring-2 ring-white sm:h-24 sm:w-24">
              {avatarUrl ? (
                <Image src={avatarUrl} alt={displayName} width={96} height={96} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-black/10" />
              )}
            </div>

            {/* text + socials/ctas within header */}
            <div className="flex flex-col">
              <h1 className="text-3xl font-semibold" style={{ color: theme.text }}>
                {displayName}
              </h1>
              {bio ? (
                <p className="mt-1 text-sm leading-relaxed" style={{ color: theme.muted }}>
                  {bio}
                </p>
              ) : null}

              <div className="mt-3 flex flex-wrap items-center gap-2">
               <SocialLinks
                socials={socials as SocialsConfig | null}
                mutedColor={theme.muted}
                accentColor={theme.accent}
              />

                <CTAButtons
                  whatsapp={whatsapp ?? undefined}
                  accent={theme.accent}
                  buttonClass={theme.button}
                  hoverStyle={{ backgroundColor: accentHover, transition: "background-color .15s ease" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
