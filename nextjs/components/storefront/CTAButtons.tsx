// components/storefront/CTAButtons.tsx
"use client";

import SfButton from "@/components/storefront/SfButton";
import {
  getDefaultButtonStyle,
  getDefaultButtonShadow,
  getDefaultButtonTone,
} from "@/lib/theme";
import type {
  StorefrontConfig,
  ButtonStyle,
  ButtonShadow,
  ButtonTone,
} from "@/lib/types";

export default function CTAButtons({
  whatsapp,
  instagramUrl,
  customLabel,
  customUrl,
  accent,
  cfg,
  btnStyle,
  btnShadow,
  btnTone,
  themeVariant = "clean",
  className,
  hoverStyle,
}: {
  whatsapp?: string;
  instagramUrl?: string;
  customLabel?: string;
  customUrl?: string;
  accent?: string;
  cfg?: StorefrontConfig | null;
  btnStyle?: ButtonStyle;
  btnShadow?: ButtonShadow;
  btnTone?: ButtonTone;
  themeVariant?: "clean" | "bold" | "minimal"; // NEW fallback hint
  className?: string;
  hoverStyle?: React.CSSProperties;
}) {
  // 1️⃣ collect CTA items
  const items: { label: string; href: string; key: string }[] = [];
  if (whatsapp) {
    const href = `https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`;
    items.push({ label: "Contact via WhatsApp", href, key: "wa" });
  }
  if (instagramUrl) {
    items.push({ label: "Open in Instagram", href: instagramUrl, key: "ig" });
  }
  if (customUrl && customLabel?.trim()) {
    items.push({ label: customLabel, href: customUrl, key: "custom" });
  }

  if (!items.length) return null;

  // 2️⃣ Resolve theme defaults — safe fallback if cfg missing
  const resolvedStyle =
    btnStyle ??
    (cfg ? getDefaultButtonStyle(cfg) : themeVariant === "bold" ? "pills" : themeVariant === "minimal" ? "square" : "rounded");

  const resolvedShadow =
    btnShadow ??
    (cfg ? getDefaultButtonShadow(cfg) : "soft");

  const resolvedTone =
    btnTone ??
    (cfg ? getDefaultButtonTone(cfg) : themeVariant === "bold" ? "solid" : "soft");

  // 3️⃣ Render buttons
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {items.map((it) => (
        <SfButton
          key={it.key}
          href={it.href}
          size="md"
          btnStyle={resolvedStyle}
          btnShadow={resolvedShadow}
          btnTone={resolvedTone}
          className={className}
          style={{
            backgroundColor: resolvedTone === "solid" ? accent : undefined,
            ...(hoverStyle ?? {}),
          }}
        >
          {it.label}
        </SfButton>
      ))}
    </div>
  );
}
