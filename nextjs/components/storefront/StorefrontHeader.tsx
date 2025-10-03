"use client";
import Image from "next/image";
import SocialLinks from "@/components/storefront/SocialLinks";
import WhatsAppCTA from "@/components/storefront/WhatsAppCTA";
import { type SocialsConfig } from "@/lib/types";

export default function StorefrontHeader({ coverUrl, avatarUrl, title, bio, socials, whatsappNumber, theme }:
{ coverUrl?: string | null; avatarUrl?: string | null; title: string; bio?: string | null; socials: SocialsConfig | null; whatsappNumber?: string | null; theme: any; }) {
  return (
    <header className="mb-6">
      <div className="relative h-40 w-full overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/0" />
        {coverUrl ? (<Image src={coverUrl} alt="cover" fill className="object-cover" />) : (<div className="h-full w-full bg-black/5" />)}
      </div>
      <div className="-mt-10 flex items-end gap-4 px-2">
        <div className="h-20 w-20 overflow-hidden rounded-2xl ring-2 ring-white">
          {avatarUrl ? (<Image src={avatarUrl} alt={title} width={80} height={80} className="h-20 w-20 object-cover" />) : (<div className="h-20 w-20 bg-black/10" />)}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-semibold" style={{ color: theme.text }}>{title}</h1>
          {bio ? (<p className="mt-1 text-sm" style={{ color: theme.muted }}>{bio}</p>) : null}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <SocialLinks socials={socials} mutedColor={theme.muted} />
            {whatsappNumber ? (<WhatsAppCTA phone={whatsappNumber} label="Chat on WhatsApp" className={theme.button} accent={theme.accent} />) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
