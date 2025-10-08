import type { StorefrontConfig, StorefrontTheme } from "./types";

export type ResolvedTheme = {
  background: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;

  variant: "clean" | "bold" | "minimal"; // NEW
  primary: string;                        // NEW

  wrapper: string;
  card: string;
  button: string;
  chip: string;
};

function clampHex(color?: string | null, fallback: string): string {
  const c = (color ?? "").trim();
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c) ? c : fallback;
}

// Clean presets (IG-like neutrals)
const CLEAN: Record<string, Omit<ResolvedTheme, "wrapper" | "card" | "button" | "chip" | "variant" | "primary">> = {
  default: { background:"#fafafa", surface:"#ffffff", text:"#111111", muted:"#6b7280", accent:"#111111" },
  warm:    { background:"#fbf7f2", surface:"#ffffff", text:"#1a1a1a", muted:"#7a6a5a", accent:"#1a1a1a" },
  cool:    { background:"#f5f7fb", surface:"#ffffff", text:"#121212", muted:"#62708a", accent:"#121212" },
};

// Minimal presets (light/dark)
const MINIMAL: Record<string, Omit<ResolvedTheme, "wrapper" | "card" | "button" | "chip" | "variant" | "primary">> = {
  light: { background:"#ffffff", surface:"#ffffff", text:"#0f172a", muted:"#64748b", accent:"#0f172a" },
  dark:  { background:"#0b0f19", surface:"#0f1424", text:"#e5e7eb", muted:"#9aa4b2", accent:"#e5e7eb" },
};

// Bold derives from primary/accent (or named presets)
const BOLD_PRESETS: Record<string, { primary: string; accent: string; background?: string; surface?: string; text?: string; muted?: string }> = {
  sunset: { primary:"#ef4444", accent:"#f59e0b" },
  ocean:  { primary:"#0ea5e9", accent:"#22c55e" },
  forest: { primary:"#16a34a", accent:"#22d3ee" },
};

function finalizeTokens(
  base: Omit<ResolvedTheme, "wrapper" | "card" | "button" | "chip" | "variant" | "primary">,
  meta: { variant: "clean" | "bold" | "minimal"; primary: string }
): ResolvedTheme {
  const t = base;
  return {
    ...t,
    variant: meta.variant,
    primary: meta.primary,
    wrapper: "min-h-screen",
    card: "rounded-2xl border border-black/10 bg-white shadow-sm",
    button: "inline-flex items-center gap-2 rounded-full px-4 py-2 border border-black/10 shadow-sm hover:shadow",
    chip: "inline-flex items-center rounded-full border border-black/10 px-3 py-1.5 text-sm bg-white",
  };
}

export function getThemeFromConfig(cfg: StorefrontConfig): ResolvedTheme {
  const theme: StorefrontTheme | undefined = cfg.theme;
  const variant = theme?.variant ?? "clean";
  const preset = theme?.palette?.preset ?? "default";

  if (variant === "minimal") {
    const p = MINIMAL[preset] ?? MINIMAL.light;
    // primary can mirror accent for non-Bold variants
    return finalizeTokens(p, { variant: "minimal", primary: p.accent });
  }

  if (variant === "bold") {
    if (BOLD_PRESETS[preset]) {
      const bp = BOLD_PRESETS[preset];
      const primary = clampHex(bp.primary, "#111111");
      const accent  = clampHex(bp.accent, "#111111");
      const background = bp.background ?? "#ffffff";
      const surface    = bp.surface    ?? "#ffffff";
      const text       = bp.text       ?? "#111111";
      const muted      = bp.muted      ?? "#6b7280";
      return finalizeTokens({ background, surface, text, muted, accent }, { variant: "bold", primary });
    }
    // custom colors
    const primary = clampHex(theme?.palette?.primary, "#111111");
    const accent  = clampHex(theme?.palette?.accent,  "#6b7280");
    return finalizeTokens(
      { background:"#ffffff", surface:"#ffffff", text:"#111111", muted:"#6b7280", accent: primary || "#111111" },
      { variant: "bold", primary } // expose primary even for custom
    );
  }

  // clean default
  const c = CLEAN[preset] ?? CLEAN.default;
  return finalizeTokens(c, { variant: "clean", primary: c.accent });
}
