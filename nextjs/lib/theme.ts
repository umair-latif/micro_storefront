import type { StorefrontConfig, StorefrontTheme } from "./types";
// Assuming types.ts contains:
// type StorefrontConfig = { theme?: StorefrontTheme; ... };
// type StorefrontTheme = { variant?: 'clean'|'bold'|'minimal'; palette?: { preset?: string; primary?: string | null; accent?: string | null }; background?: { type: 'color' | 'gradient' | 'image' | 'none'; value: string | null }; }

// Define the full set of resolved properties
export type ResolvedTheme = {
    // RESOLVED COLOR TOKENS
    surface: string;
    text: string;
    muted: string;
    accent: string;
    background: string; 

    // NEW BACKGROUND PROPERTIES
    backgroundType: 'color' | 'gradient' | 'image' | 'none'; 

    variant: "clean" | "bold" | "minimal";
    primary: string; // The primary color (used for text/links in bold, or sometimes main text in minimal)

    // UTILITY/CSS CLASS STRINGS
    wrapper: string;
    card: string;
    button: string;
    chip: string;
};

// Define a type for the base color tokens (surface, text, muted, accent, background)
// This simplifies the definition of CLEAN, MINIMAL, etc.
type BaseColorTokens = Omit<ResolvedTheme, "wrapper" | "card" | "button" | "chip" | "variant" | "primary" | "backgroundType">;

/**
 * Ensures a color is a valid hex code, otherwise returns fallback.
 */
function clampHex(fallback: string | null, color?: string | null): string {
    const c = (color ?? "").trim();
    // Allow 3 or 6 digit hex codes
    return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c) ? c : (fallback ?? '');
}

// Clean presets (IG-like neutrals)
const CLEAN: Record<string, BaseColorTokens> = {
    default: { background:"#fafafa", surface:"#ffffff", text:"#111111", muted:"#6b7280", accent:"#6b7280" },
    warm: 	 { background:"#fbf7f2", surface:"#ffffff", text:"#1a1a1a", muted:"#7a6a5a", accent:"#7a6a5a" },
    cool: 	 { background:"#f5f7fb", surface:"#ffffff", text:"#121212", muted:"#62708a", accent:"#62708a" },
};

// Minimal presets (light/dark)
const MINIMAL: Record<string, BaseColorTokens> = {
    light: { background:"#ffffff", surface:"#ffffff", text:"#0f172a", muted:"#64748b", accent:"#0f172a" },
    dark: 	 { background:"#0b0f19", surface:"#0f1424", text:"#e5e7eb", muted:"#9aa4b2", accent:"#6b7280" },
};

// Bold derives from primary/accent (or named presets) - Needs explicit primary/accent fields
// We define the key Primary/Accent colors, and let the base be CLEAN.default unless otherwise specified
const BOLD_PRESETS: Record<string, { primary: string; accent: string; background?: string; surface?: string; text?: string; muted?: string }> = {
    sunset: { primary:"#ef4444", accent:"#f59e0b" },
    ocean: 	{ primary:"#0ea5e9", accent:"#22D3EE" },
    forest: { primary:"#16a34a", accent:"#34D399" },
};

/**
 * Finalizes the resolved color tokens and adds utility CSS class strings.
 * @param base - The resolved color tokens, including the final background value.
 * @param meta - Additional metadata like variant, primary color, and background type.
 */
function finalizeTokens(
    base: BaseColorTokens & { background: string }, // Base + final background value
    meta: { variant: "clean" | "bold" | "minimal"; primary: string; backgroundType: ResolvedTheme['backgroundType'] }
): ResolvedTheme {
    const cardBorderColor = meta.variant === "minimal" && base.background === MINIMAL.dark.background
        ? "border-white/10" // Use light border on dark minimal theme
        : "border-black/10"; // Use dark border otherwise
    return {
        // Spread all resolved colors (surface, text, muted, accent, background)
        ...base, 
        
        // Add required metadata
        variant: meta.variant,
        primary: meta.primary, 
        backgroundType: meta.backgroundType,

        // Add utility/CSS class strings
        wrapper: "min-h-screen",
        // NOTE: card CSS needs to be adjusted in the application layer if using a dark theme
        card: `rounded-2xl border ${cardBorderColor} shadow-sm`, 
        button: "inline-flex items-center gap-2 rounded-full px-4 py-2 border border-black/10 shadow-sm hover:shadow",
        chip: "inline-flex items-center rounded-full border border-black/10 px-3 py-1.5 text-sm bg-white",
    } as ResolvedTheme; 
}

export function resolveCategoryNavStyle(
  themeVariant?: "clean" | "bold" | "minimal",
  style?: "auto" | "chips" | "pills" | "square"
) {
  if (style && style !== "auto") return style;
  switch (themeVariant) {
    case "bold":
      return "chips";
    case "minimal":
      return "square";
    case "clean":
    default:
      return "pills";
  }
}

export function getThemeFromConfig(cfg: StorefrontConfig): ResolvedTheme {
    const theme: StorefrontTheme | undefined = cfg.theme;
    const variant = theme?.variant ?? "clean";
    const preset = theme?.palette?.preset ?? "default";

    
    // --- 1. RESOLVE BASE COLOR TOKENS (surface, text, muted, accent, background) ---
    let base: BaseColorTokens;
    let resolvedAccent: string;  // Accent color from the preset
    let resolvedPrimary: string; // Primary color from the preset (defaults to accent for non-bold)
    
    // Start with the default clean base
    base = CLEAN.default;
    resolvedAccent = base.accent;
    resolvedPrimary = base.accent;

    if (variant === "minimal") {
        base = MINIMAL[preset] ?? MINIMAL.light;
        resolvedAccent = base.accent;
        resolvedPrimary = base.accent;
    } else if (variant === "bold") {
        if (BOLD_PRESETS[preset]) {
            const bp = BOLD_PRESETS[preset];
            // Bold starts with clean default base, but overrides specific parts
            resolvedAccent = clampHex(base.accent, bp.accent);
            resolvedPrimary = clampHex(base.accent, bp.primary);
            
            // Use explicitly defined colors from BOLD_PRESETS if they exist (for dark bold themes)
            base.background = bp.background ?? base.background;
            base.surface = bp.surface 	?? base.surface;
            base.text = bp.text 		?? base.text;
            base.muted = bp.muted 		?? base.muted;
        } 
        // If preset is 'custom' or unknown, it keeps the clean default base, relying on Step 2 for color.
    } else {
        // clean preset
        base = CLEAN[preset] ?? CLEAN.default;
        resolvedAccent = base.accent;
        resolvedPrimary = base.accent;
    }

    // --- 2. APPLY CUSTOM COLOR OVERRIDES (Overrides always take precedence) ---
    const customAccent = clampHex(null, theme?.palette?.accent);
    const customPrimary = clampHex(null, theme?.palette?.primary);

    const finalAccent = customAccent || resolvedAccent;
    const finalPrimary = customPrimary || resolvedPrimary;
    
    // Update base with the final accent color
    const finalBase: BaseColorTokens = { ...base, accent: finalAccent };
    
    
    // --- 3. RESOLVE DYNAMIC BACKGROUND ---
    const bgType = theme?.background?.type ?? 'color';
    let bgValue = theme?.background?.value ?? '';
    
    // Fallback logic: If no custom value is set OR if type is 'none', use the base background color
    if (!bgValue || bgType === 'none') {
        bgValue = finalBase.background;
    }

    // --- 4. FINALIZE ---
    return finalizeTokens(
        { ...finalBase, background: bgValue }, // Base + final background value
        { 
            variant, 
            primary: finalPrimary, 
            backgroundType: bgType as ResolvedTheme['backgroundType'] 
        }
    );
}