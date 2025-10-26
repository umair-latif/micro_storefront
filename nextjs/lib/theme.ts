// lib/theme.ts
import type {
  StorefrontConfig,
  StorefrontTheme,
  CategoryNavStyle,
  GridMode,
  ButtonStyle,
  ButtonShadow,
  ButtonTone,
  LandingBlock,
  ResolvedTheme,
  BaseColorTokens,
} from "./types";

/* ----------------------------- Utilities ------------------------------ */

/** Ensure a string is a valid 3/6-digit hex; otherwise fallback */
function clampHex(fallback: string | null, color?: string | null): string {
  const c = (color ?? "").trim();
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c) ? c : (fallback ?? "");
}

const toRgb = (hexOrRgb: string): [number, number, number] => {
  if (hexOrRgb.startsWith("rgb")) {
    const m = hexOrRgb.match(/\d+(\.\d+)?/g);
    if (!m) return [0, 0, 0];
    return [Number(m[0]), Number(m[1]), Number(m[2])];
  }
  const hex = hexOrRgb.replace("#", "").trim();
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

const relLuminance = (r: number, g: number, b: number) => {
  const toLin = (c: number) => {
    const cs = c / 255;
    return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
  };
  const [R, G, B] = [toLin(r), toLin(g), toLin(b)];
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

// Returns black or white for best contrast on bg
export const getReadableText = (bg: string): "#000000" | "#ffffff" => {
  const [r, g, b] = toRgb(bg);
  const Lbg = relLuminance(r, g, b);
  const cBlack = (Lbg + 0.05) / 0.05; // contrast vs black
  const cWhite = 1.05 / (Lbg + 0.05); // contrast vs white
  return cWhite >= cBlack ? "#ffffff" : "#000000";
};

/* ------------------------------ Presets ------------------------------- */

// Clean presets (IG-like neutrals)
const CLEAN: Record<string, BaseColorTokens> = {
  default: { background: "#fafafa", surface: "#ffffff", text: "#111111", muted: "#6b7280", accent: "#6b7280", primary: "#6b7280", onBackground: "#000000", onPrimary: "#ffffff", onAccent: "#000000" },
  warm:    { background: "#fbf7f2", surface: "#ffffff", text: "#1a1a1a", muted: "#7a6a5a", accent: "#7a6a5a", primary: "#7a6a5a", onBackground: "#000000", onPrimary: "#ffffff", onAccent: "#000000" },
  cool:    { background: "#f5f7fb", surface: "#ffffff", text: "#121212", muted: "#62708a", accent: "#62708a", primary: "#62708a", onBackground: "#000000", onPrimary: "#ffffff", onAccent: "#000000" },
};

// Minimal presets (light/dark)
const MINIMAL: Record<string, BaseColorTokens> = {
  light: { background: "#ffffff", surface: "#ffffff", text: "#0f172a", muted: "#3d4147ff", accent: "#0f172a", primary: "#0f172a", onBackground: "#000000", onPrimary: "#ffffff", onAccent: "#ffffff" },
  dark:  { background: "#0b0f19", surface: "#0f1424", text: "#e5e7eb", muted: "#9aa4b2", accent: "#6b7280", primary: "#e5e7eb", onBackground: "#ffffff", onPrimary: "#000000", onAccent: "#000000" },
};

// Bold presets derive from primary/accent; base starts from CLEAN.default unless overridden
const BOLD_PRESETS: Record<string, { primary: string; accent: string; background?: string; surface?: string; text?: string; muted?: string }> = {
  sunset: { primary: "#ef4444", accent: "#f59e0b" },
  ocean:  { primary: "#0ea5e9", accent: "#22D3EE" },
  forest: { primary: "#16a34a", accent: "#34D399" },
};

/* --------------------------- Token Finalizer --------------------------- */

function finalizeTokens(
  base: BaseColorTokens & { background: string },
  meta: { variant: "clean" | "bold" | "minimal"; primary: string; backgroundType: ResolvedTheme["backgroundType"] }
): ResolvedTheme {
  // choose a card border that works for dark minimal
  const cardBorderColor =
    meta.variant === "minimal" && base.background.toLowerCase() === MINIMAL.dark.background.toLowerCase()
      ? "border-white/10"
      : "border-black/10";

  return {
    ...base,

    variant: meta.variant,
    primary: meta.primary,
    backgroundType: meta.backgroundType,

    // Utility classes (use CSS vars upstream if you prefer)
    wrapper: "min-h-screen",
    card: `rounded-2xl border ${cardBorderColor} shadow-sm`,
    button: "inline-flex items-center gap-2 rounded-full px-4 py-2 border border-black/10 shadow-sm hover:shadow",
    chip: "inline-flex items-center rounded-full border border-black/10 px-3 py-1.5 text-sm bg-white",
  };
}

/* ---------------------- Public Helpers / Defaults ---------------------- */

export function resolveCategoryNavStyle(
  themeVariant?: "clean" | "bold" | "minimal",
  style?: CategoryNavStyle
): Exclude<CategoryNavStyle, "auto"> {
  if (style && style !== "auto") return style;
  switch (themeVariant) {
    case "bold":    return "chips";
    case "minimal": return "square";
    case "clean":
    default:        return "pills";
  }
}

export function getDefaultButtonStyle(cfg?: StorefrontConfig | null): ButtonStyle {
  return (cfg?.theme?.defaults?.button_style ?? inferButtonStyleFromVariant(cfg?.theme?.variant)) as ButtonStyle;
}

export function getDefaultButtonShadow(cfg?: StorefrontConfig | null): ButtonShadow {
  return (cfg?.theme?.defaults?.button_shadow ?? "soft") as ButtonShadow;
}

export function getDefaultButtonTone(cfg?: StorefrontConfig | null): ButtonTone {
  // Bold pops with "solid"; Clean/Minimal often "soft"/"outline"
  return (cfg?.theme?.defaults?.button_tone ?? (cfg?.theme?.variant === "bold" ? "solid" : "soft")) as ButtonTone;
}

function inferButtonStyleFromVariant(variant?: "clean" | "bold" | "minimal"): ButtonStyle {
  switch (variant) {
    case "bold":    return "pills";
    case "minimal": return "square";
    case "clean":
    default:        return "rounded";
  }
}

export function getDefaultProductView(cfg: StorefrontConfig | null | undefined): GridMode {
  const fromTheme = cfg?.theme?.defaults?.product_view as GridMode | undefined;
  if (fromTheme) return fromTheme;
  const legacy = (cfg?.display_mode as GridMode | undefined) ?? undefined;
  if (legacy) return legacy;
  return "grid_3";
}

/* -------------------------- Theme Resolution --------------------------- */

export function getThemeFromConfig(cfg: StorefrontConfig): ResolvedTheme {
  const theme: StorefrontTheme | undefined = cfg.theme;
  const variant = theme?.variant ?? "clean";
  const preset  = theme?.palette?.preset ?? "default";

  // 1) Base tokens + default primary/accent
  let base: BaseColorTokens = CLEAN.default;
  let resolvedAccent = base.accent;
  let resolvedPrimary = base.primary;

  if (variant === "minimal") {
    base = MINIMAL[preset] ?? MINIMAL.light;
    resolvedAccent = base.accent;
    resolvedPrimary = base.primary;
  } else if (variant === "bold") {
    // Start from clean default; override with preset
    base = { ...CLEAN.default };
    if (BOLD_PRESETS[preset]) {
      const bp = BOLD_PRESETS[preset];
      resolvedAccent  = clampHex(base.accent, bp.accent);
      resolvedPrimary = clampHex(base.primary, bp.primary);
      base.background = bp.background ?? base.background;
      base.surface    = bp.surface    ?? base.surface;
      base.text       = bp.text       ?? base.text;
      base.muted      = bp.muted      ?? base.muted;
    }
  } else {
    base = CLEAN[preset] ?? CLEAN.default;
    resolvedAccent = base.accent;
    resolvedPrimary = base.primary;
  }

  // 2) Custom overrides (take precedence)
  const customAccent  = clampHex(null, theme?.palette?.accent);
  const customPrimary = clampHex(null, theme?.palette?.primary);
  const finalAccent   = customAccent  || resolvedAccent;
  const finalPrimary  = customPrimary || resolvedPrimary;

  const finalBase: BaseColorTokens = { ...base, accent: finalAccent, primary: finalPrimary };

  // 3) Resolve dynamic background (color/image/gradient)
  const bgType  = theme?.background?.type ?? "color";
  let bgValue   = theme?.background?.value ?? "";

  let background = finalBase.background;      // solid fallback
  let backgroundImage: string | undefined;
  let backgroundCSS: React.CSSProperties | undefined;

  if (bgType === "image") {
    const url = bgValue.trim();
    if (url) {
      backgroundImage = `url("${url}")`;
      backgroundCSS = {
        backgroundImage,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    }
  } else if (bgType === "gradient") {
    backgroundImage = bgValue;
    backgroundCSS = { backgroundImage };
  } else if (bgType === "color") {
    background = bgValue || finalBase.background;
  } else {
    // 'none' → keep base color
    background = finalBase.background;
  }

  // 4) Finalize standard tokens FIRST
  const standard = finalizeTokens(
    { ...finalBase, background },
    { variant, primary: finalPrimary, backgroundType: bgType as ResolvedTheme["backgroundType"] }
  );

  // 5) Merge extra background fields AFTER to satisfy TS
  return {
    ...standard,
    backgroundImage,
    backgroundCSS,
  };
}

/* ------------------------ Category Page Defaults ------------------------ */

export function getCategoryPageView(cfg?: StorefrontConfig | null): GridMode {
  const adv = cfg?.landing_overrides?.category_page_view as GridMode | undefined;
  if (adv) return adv;

  const blocks = (cfg as any)?.landing_blocks as LandingBlock[] | undefined;
  if (Array.isArray(blocks)) {
    const hit = blocks.find((b) => b.type === "products" && (b as any).view) as any;
    if (hit?.view) return hit.view as GridMode;
  }

  return getDefaultProductView(cfg);
}

/* ------------------------- Button Class Builder ------------------------- */

export function buttonClasses(
  opts: {
    style?: ButtonStyle;
    shadow?: ButtonShadow;
    tone?: ButtonTone;
    size?: "sm" | "md" | "lg";
    fullWidth?: boolean;
  } = {}
): string {
  const { style = "rounded", shadow = "soft", tone = "solid", size = "md", fullWidth } = opts;

  const radius =
    style === "square" ? "rounded-lg" :
    style === "pills"  ? "rounded-full" :
                         "rounded-xl";

  const padding =
    size === "sm" ? "px-3 py-1.5 text-sm" :
    size === "lg" ? "px-5 py-3 text-base" :
                    "px-4 py-2 text-sm";

  const width = fullWidth ? "w-full" : "";

  const base = [
    "inline-flex items-center justify-center gap-2",
    "transition focus:outline-none",
    "focus-visible:ring-2 focus-visible:ring-[var(--sf-primary)]/40",
    radius,
    padding,
    width,
  ];

  const toneClasses =
    tone === "outline"
      ? "border border-[var(--sf-primary)] text-[var(--sf-primary)] bg-transparent hover:bg-[var(--sf-primary)]/5"
      : tone === "soft"
      ? "border border-[var(--sf-border)] bg-[var(--sf-primary)]/10 text-[var(--sf-text)] hover:bg-[var(--sf-primary)]/15"
      : // solid
        "border border-[var(--sf-primary)] bg-[var(--sf-primary)] text-white hover:brightness-95";

  const shadowClasses =
    shadow === "none" ? "" :
    shadow === "hard" ? "shadow-lg" : "shadow"; // soft

  return [...base, toneClasses, shadowClasses].join(" ");
}

/* -------------------- Category Nav Style from Config -------------------- */

export function getDefaultCategoryNavStyle(
  cfg: StorefrontConfig | null | undefined
): Exclude<CategoryNavStyle, "auto"> {
  const preset = cfg?.theme?.defaults?.category_nav_style;
  return resolveCategoryNavStyle(cfg?.theme?.variant, preset);
}
