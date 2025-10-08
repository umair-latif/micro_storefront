// components/storefront/CTAButtons.tsx
"use client";

import Link from "next/link";

export default function CTAButtons({
  whatsapp,
  instagramUrl,
  customLabel,
  customUrl,
  accent,
  buttonClass,
  hoverStyle,
}: {
  whatsapp?: string;
  instagramUrl?: string;
  customLabel?: string;
  customUrl?: string;
  accent: string;
  buttonClass?: string;
  hoverStyle?: React.CSSProperties;
}) {
  const items: { label: string; href: string; key: string }[] = [];

  if (whatsapp) {
    const href = `https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`;
    items.push({ label: "WhatsApp", href, key: "wa" });
  }
  if (instagramUrl) {
    items.push({ label: "Instagram", href: instagramUrl, key: "ig" });
  }
  if (customUrl && (customLabel || "").trim()) {
    items.push({ label: customLabel!, href: customUrl, key: "custom" });
  }

  if (!items.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <Link
          key={it.key}
          href={it.href}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass || "inline-flex items-center gap-2 rounded-full px-4 py-2 border border-black/10 shadow-sm hover:shadow"}
          style={{ color: "#fff", backgroundColor: accent, ...(hoverStyle ?? {}) }}
        >
          {it.label}
        </Link>
      ))}
    </div>
  );
}
