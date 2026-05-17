"use client";

import SfButton from "@/components/storefront/SfButton";
import {
  getDefaultButtonShadow,
  getDefaultButtonStyle,
  getDefaultButtonTone,
} from "@/lib/theme";
import type {
  ButtonShadow,
  ButtonStyle,
  ButtonTone,
  StorefrontConfig,
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
  themeVariant?: "clean" | "bold" | "minimal";
  className?: string;
  hoverStyle?: React.CSSProperties;
}) {
  const items: { label: string; href: string; key: string }[] = [];

  if (customUrl && customLabel?.trim()) {
    items.push({ label: customLabel, href: customUrl, key: "custom" });
  }
  if (instagramUrl) {
    items.push({ label: "View on Instagram", href: instagramUrl, key: "ig" });
  }
  if (whatsapp) {
    const href = `https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`;
    items.push({ label: "Contact via WhatsApp", href, key: "wa" });
  }

  if (!items.length) return null;

  const resolvedStyle =
    btnStyle ??
    (cfg ? getDefaultButtonStyle(cfg) : themeVariant === "bold" ? "pills" : themeVariant === "minimal" ? "square" : "rounded");

  const resolvedShadow = btnShadow ?? (cfg ? getDefaultButtonShadow(cfg) : "soft");

  const resolvedTone = btnTone ?? (cfg ? getDefaultButtonTone(cfg) : themeVariant === "bold" ? "solid" : "soft");

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {items.map((it, index) => (
        <SfButton
          key={it.key}
          href={it.href}
          size="md"
          btnStyle={resolvedStyle}
          btnShadow={resolvedShadow}
          btnTone={index === 0 ? resolvedTone : "outline"}
          className={className}
          style={{
            backgroundColor: index === 0 && resolvedTone === "solid" ? accent : undefined,
            ...(hoverStyle ?? {}),
          }}
        >
          {it.label}
        </SfButton>
      ))}
    </div>
  );
}
