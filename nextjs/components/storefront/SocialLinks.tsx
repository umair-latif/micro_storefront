"use client";

import {
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Linkedin,
  Globe,
  Mail,
  Phone,
  MessageCircle,
  Link,
} from "lucide-react";

export default function SocialLinks({
  socials,
  mutedColor = "#666",
  accentColor = "#000",
}: {
  socials: Record<string, string> | null;
  mutedColor?: string;
  accentColor?: string;
}) {
  if (!socials) return null;

  const iconMap: Record<string, any> = {
    instagram: Instagram,
    facebook: Facebook,
    youtube: Youtube,
    twitter: Twitter,
    linkedin: Linkedin,
    website: Globe,
    mail: Mail,
    email: Mail,
    whatsapp: MessageCircle,
    phone: Phone,
    link: Link,
  };

  const entries = Object.entries(socials).filter(
    ([, v]) => v && typeof v === "string" && v.trim() !== ""
  );

  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {entries.map(([key, url]) => {
        const Icon = iconMap[key.toLowerCase()] || Globe;
        let href = url;

        // Normalize URLs for known networks
        if (key === "instagram" && !href.startsWith("http"))
          href = `https://instagram.com/${href}`;
        if (key === "facebook" && !href.startsWith("http"))
          href = `https://facebook.com/${href}`;
        if (key === "x" && !href.startsWith("http"))
          href = `https://x.com/${href}`;
        if (key === "linkedin" && !href.startsWith("http"))
          href = `https://linkedin.com/in/${href}`;
        if (key === "whatsapp" && !href.startsWith("http"))
          href = `https://wa.me/${href.replace(/\D/g, "")}`;
         if (key === "etsy" && !href.startsWith("http"))
          href = `https://etsy.com/${href}`;
        if (key === "mail" || key === "email") href = `mailto:${href}`;
        if (key === "phone") href = `tel:${href}`;

        return (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-110"
            style={{
              color: mutedColor,
            }}
          >
            <Icon
              size={20}
              style={{
                transition: "color 0.2s, opacity 0.2s",
              }}
              className="hover:opacity-80"
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = accentColor + "b3") // ~70% opacity
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = mutedColor)
              }
            />
          </a>
        );
      })}
    </div>
  );
}
