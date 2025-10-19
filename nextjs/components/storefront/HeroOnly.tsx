"use client";
import Image from "next/image";
import CTAButtons from "@/components/storefront/CTAButtons";
import SocialLinks from "@/components/storefront/SocialLinks";
import { type SocialsConfig } from "@/lib/types";

export default function HeroOnly({
  coverUrl,
  avatarUrl,
  title,
  bio,
  socials,
  whatsapp,
  theme,
  dense,
}: {
  coverUrl?: string | null;
  avatarUrl?: string | null;
  title: string;
  bio?: string | null;
  socials: SocialsConfig | null;
  whatsapp?: string | null;
  theme: any;
  dense?:boolean|null;
}) {
  return (
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden text-center">
      {coverUrl ? (
        <Image src={coverUrl} alt="cover" fill className="object-cover" priority />
      ) : (
        <div className="absolute inset-0 bg-black/10" />
      )}
      <div className={`absolute inset-0 ${theme.overlay}`} />
      <div className="relative z-10 mx-auto w-full max-w-xl px-6">
        <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-3xl ring-2 ring-white/70">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={title} width={96} height={96} className="h-24 w-24 object-cover" />
          ) : (
            <div className="h-24 w-24 bg-white/20" />
          )}
        </div>
        <h1 className="text-3xl font-semibold" style={{ color: theme.heroText }}>{title}</h1>
        {bio ? <p className="mt-2 text-base" style={{ color: theme.mutedColor }}>{bio}</p> : null}
        <div className="mt-4 flex justify-center">
          <SocialLinks socials={socials} mutedColor={theme.mutedColor} accentColor={theme.accent}/>
        </div>
        <div className="mt-6">
          <CTAButtons
            whatsapp={whatsapp ?? undefined}
            accent={theme.accent}
            themeVariant={theme.variant}         
            />
        </div>
      </div>
    </section>
  );
}
