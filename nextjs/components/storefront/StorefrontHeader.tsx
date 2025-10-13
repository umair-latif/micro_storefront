"use client";

import Image from "next/image";
import SocialLinks from "@/components/storefront/SocialLinks";
import CTAButtons from "@/components/storefront/CTAButtons";
import { type SocialsConfig } from "@/lib/types";
import ReactMarkdown from "react-markdown";

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

  // Define the mask style once. White (rgba(255,255,255,1)) means fully opaque (visible).
  // Black/Transparent (rgba(255,255,255,0)) means fully transparent (invisible/masked).
  const maskStyle = {
    WebkitMaskImage: `linear-gradient(to bottom, white 70%, transparent 100%)`,
    maskImage: `linear-gradient(to bottom, white 70%, transparent 100%)`,
  };

  if (!coverUrl) {
    // === CONSOLE LOG FOR NO COVER IMAGE ===
    console.log(`[StorefrontHeader] No Cover Image: Using Surface (${theme.surface}) to Background (${theme.background}) fade.`);
    
    // ===== No header_img: centered “business card” header with theme background & fade =====
    return (
      <header
        className="mb-6 rounded-2xl"
        style={{
          background: `linear-gradient(to bottom, ${theme.surface} 0%, ${theme.background} 85%)`,
        }}
      >
        <div className="flex flex-col items-center px-4 pt-6 pb-6 sm:pt-8 sm:pb-8">
          
          {/* LOGIC FOR NO AVATAR (NO COVER): Only show avatar frame if avatarUrl exists */}
          {avatarUrl ? (
            <div className="relative -mt-2 mb-4 h-24 w-24 overflow-hidden rounded-2xl ring-2 ring-white sm:h-28 sm:w-28">
              <Image src={avatarUrl} alt={displayName} fill className="object-cover" />
            </div>
          ) : null}

          <h1 className="text-xl font-semibold text-center" style={{ color: theme.text }}>
            {displayName}
          </h1>

          {bio ? (
             <div
              className="mt-2 max-w-2xl text-center text-sm leading-relaxed break-words"
              // Add white-space: pre-wrap to respect line breaks and multiple spaces
              style={{ color: theme.muted, whiteSpace: "pre-wrap" }}
            >
              <ReactMarkdown>{bio}</ReactMarkdown>
            </div>
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

  // === CONSOLE LOG FOR COVER IMAGE ===
  console.log(`[StorefrontHeader] Cover Image Present: Bottom fade using CSS mask for true transparency.`);

  // ===== With header_img: image background, content centered, fade to body =====
  return (
    <header className="mb-6 overflow-hidden rounded-2xl">
      <div className="relative w-full">
        {/* background image container */}
        <div 
          className="relative h-[220px] w-full sm:h-[260px]"
          // Apply the mask style directly to the image container
          style={maskStyle}
        >
          <Image src={coverUrl} alt="cover" fill className="object-cover" priority />
          
          {/* REMOVED: The old overlay div for gradient fade is no longer needed. */}
        </div>

        {/* content overlay: Avatar (if present) + Text/Socials. The margin adjusts based on avatar. */}
        <div className={`relative px-4 pb-5 sm:px-6 ${avatarUrl ? '-mt-16' : 'mt-0'}`}>
          
          {/* AVATAR: Centered above content if present */}
          {avatarUrl ? (
            <div className="mb-3 flex justify-center">
              <div className="h-20 w-20 overflow-hidden rounded-2xl ring-2 ring-white sm:h-24 sm:w-24">
                <Image src={avatarUrl} alt={displayName} width={96} height={96} className="h-full w-full object-cover" />
              </div>
            </div>
          ) : null}

          {/* Text, Bio, and CTAs: Always centered */}
          <div className="flex flex-col items-center text-center">
            
            <h1 className="text-3xl font-semibold" style={{ color: theme.text }}>
              {displayName}
            </h1>
            
            {bio ? (
               <div 
                className="mt-1 text-sm leading-relaxed" 
                // Add white-space: pre-wrap to respect line breaks and multiple spaces
                style={{ color: theme.muted, whiteSpace: "pre-wrap" }}
              >
                <ReactMarkdown>{bio}</ReactMarkdown>
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
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
    </header>
  );
}