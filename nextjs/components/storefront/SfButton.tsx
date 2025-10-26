"use client";
import * as React from "react";
import Link from "next/link";

import {
  getDefaultButtonStyle,
  getDefaultButtonShadow,
  getDefaultButtonTone,
  getReadableText,
  buttonClasses, // existing utility; still used for size/shape/shadow layout classes
} from "@/lib/theme";

import type {
  StorefrontConfig,
  StorefrontTheme,
  ButtonStyle,
  ButtonShadow,
  ButtonTone,
} from "@/lib/types";

type Common = {
  children: React.ReactNode;
  className?: string;
  /** Additional inline styles to merge after tone/theme styles */
  style?: React.CSSProperties;
  /** sm | md | lg */
  size?: "sm" | "md" | "lg";
  /** If you pass none, we derive from theme */
  btnStyle?: ButtonStyle;
  btnShadow?: ButtonShadow;
  btnTone?: ButtonTone;
  /** Expand to full width */
  fullWidth?: boolean;

  /** Provide theme OR full cfg. If both are provided, cfg wins. */
  theme?: StorefrontTheme | any;
  cfg?: StorefrontConfig | null;

  /** Use primary (default) or accent color as the button chroma source */
  colorSource?: "primary" | "accent";
};

type AnchorProps = Common & { href: string; onClick?: never };
type ButtonElProps = Common & { href?: never; onClick?: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"] };
type Props = AnchorProps | ButtonElProps;

/** Compute inline color styles for a given tone using theme */
function computeToneStyles(
  tone: ButtonTone,
  theme: StorefrontTheme | any,
  colorSource: "primary" | "accent" = "primary"
): React.CSSProperties {
  const base = (colorSource === "accent" ? theme?.accent : theme?.primary) ?? "#1118272f";
  const onBase = getReadableText(base);

  if (tone === "solid") {
    return { background: base, color: onBase, borderColor: base };
  }
  if (tone === "outline") {
    return { background: "transparent", color: base, borderColor: base };
  }
  // "soft" — subtle but readable: keep background transparent, visible border
  return { background: "transparent", color: base, borderColor: base + "1A" }; // ~10% alpha
}

/** Derive final className + styles based on theme/cfg + optional overrides */
function useButtonDerivatives(props: Props) {
  const { theme, cfg, btnStyle, btnShadow, btnTone, size, fullWidth, colorSource, style } = props;

  // Prefer cfg if supplied; otherwise synthesize one from the theme
  const cfgShim = (cfg ?? (theme ? { theme } : null)) as any;

  const styleFinal  = btnStyle  ?? getDefaultButtonStyle(cfgShim);
  const shadowFinal = btnShadow ?? getDefaultButtonShadow(cfgShim);
  const toneFinal   = btnTone   ?? getDefaultButtonTone(cfgShim);

  // Base classes from your central builder (shape/shadow/size/fullWidth)
  let cls = buttonClasses({
    style: styleFinal,
    shadow: shadowFinal,
    tone: toneFinal,   // if buttonClasses already styles colors, it can use this
    size: size ?? "md",
    fullWidth,
  });

  // Merge any custom classes last
  if (props.className) cls += ` ${props.className}`;

  // Inline styles for color/contrast (authoritative)
  const toneStyle = computeToneStyles(toneFinal, theme ?? cfg?.theme ?? {}, colorSource);
  const mergedStyle: React.CSSProperties = { ...toneStyle, ...(style ?? {}) };

  return { cls, mergedStyle, toneFinal };
}

export default function SfButton(props: Props) {
  const { cls, mergedStyle } = useButtonDerivatives(props);

  if ("href" in props && props.href) {
    const { href, children } = props;
    return (
      <Link href={href} className={cls} style={mergedStyle}>
        {children}
      </Link>
    );
  }

  const { onClick, children } = props as ButtonElProps;
  return (
    <button type="button" onClick={onClick} className={cls} style={mergedStyle}>
      {children}
    </button>
  );
}
