"use client";
import Link from "next/link";
import { type SocialsConfig } from "@/lib/types";

export default function SocialLinks({ socials, mutedColor }: { socials: SocialsConfig | null, mutedColor: string }) {
  if (!socials) return null;
  const entries = Object.entries(socials).filter(([, v]) => !!v);
  if (!entries.length) return null;
  return (
    <nav className="flex flex-wrap gap-2" aria-label="social links">
      {entries.map(([key, href]) => (
        <Link key={key} href={key === "email" ? `mailto:${href}` : (href as string)}
              className="inline-flex items-center gap-1 rounded-full bg-black/5 px-3 py-1 text-sm hover:bg-black/10">
          <span className="capitalize" style={{ color: mutedColor }}>{key}</span>
        </Link>
      ))}
    </nav>
  );
}
