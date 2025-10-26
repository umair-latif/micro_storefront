// lib/types.ts
import type { CSSProperties } from "react";

/* ============================== Theme ==================================== */

export type ThemeVariant = "clean" | "bold" | "minimal";
export type ButtonStyle  = "square" | "rounded" | "pills";
export type ButtonShadow = "none" | "soft" | "hard";         // « was "bold", aligned to helpers
export type ButtonTone   = "solid" | "outline" | "soft";
export type TopSectionMode = "header" | "hero";
export type HeaderStyle    = "small" | "large-square" | "large-circle";
export type BackgroundType = "none" | "color" | "image" | "gradient";

export type ThemeBackground = {
  type?: BackgroundType;
  value?: string | null; // hex/rgb for color, data for gradient, URL for image
};

export type ThemePalette = {
  preset?: string | null;
  primary?: string | null;
  accent?: string | null;
  // Optional resolved tokens (filled by resolver)
  bg?: string;
  surface?: string;
  text?: string;
  muted?: string;
};

export type StorefrontTheme = {
  variant?: ThemeVariant;
  palette?: ThemePalette;
  background?: ThemeBackground;
  // Global UI defaults
  defaults?: {
    product_view?: GridMode;
    category_nav_style?: CategoryNavStyle;
    button_style?: ButtonStyle;
    button_shadow?: ButtonShadow;
    button_tone?: ButtonTone;
  };
};

// Base tokens your resolver produces (extend as needed)
export type BaseColorTokens = {
  background: string; // base bg color fallback
  surface: string;
  text: string;
  muted: string;
  primary: string;
  accent: string;
  onBackground: "#000000" | "#ffffff";
  onPrimary: "#000000" | "#ffffff";
  onAccent: "#000000" | "#ffffff";
};

export interface ResolvedTheme extends BaseColorTokens {
  backgroundType: "none" | "color" | "image" | "gradient";
  backgroundImage?: string;
  backgroundCSS?: CSSProperties;

  // add these so finalizeTokens(...) is type-safe
  variant: "clean" | "bold" | "minimal";
  primary: string;            // (yes, also in BaseColorTokens; keeps theme.ts happy)
  wrapper: string;
  card: string;
  button: string;
  chip: string;
}

/* ============================ Landing Blocks ============================= */

// Unified grid modes used across admin + public
export type GridMode = "grid" | "grid_1" | "grid_2" | "grid_3" | "list" | "links";
export type CategoryNavStyle = "auto" | "chips" | "pills" | "square";

// Common optional flags for all blocks
type BaseBlock = { _hidden?: boolean };

export type LandingBlock =
  | ({
      type: "hero";
      title?: string;
      show_avatar?: boolean;
      show_socials?: boolean;
      show_ctas?: boolean;
      dense?: boolean;
    } & BaseBlock)
  | ({
      type: "categories_wall";        // NEW: was category_cover_wall
      view?: GridMode;                // "grid" | "list" | "links"
      columns?: 2 | 3 | 4;            // for grid only (default 3)
      limit?: number;
    } & BaseBlock)
  | ({
      type: "products";
      source: "all" | { category_id: string };
      view: GridMode;
      show_price?: boolean;
      show_caption?: boolean;
      limit?: number;
      cta?: "whatsapp" | "product" | "none";
      show_category_nav?: boolean;          // default false
      category_nav_style?: CategoryNavStyle; // "auto" (default), "chips" | "pills" | "square"
    } & BaseBlock)
  | ({
      type: "text";
      content_md: string;
      align?: "start" | "center";
    } & BaseBlock);

/* ============================ Storefront cfg ============================= */

export type StorefrontDisplayMode = GridMode;

export type StorefrontLanding =
  | "products"
  | "categories"
  | "hero-only"
  | "business-card"; // alias of hero-only

export type StorefrontConfig = {
  theme?: StorefrontTheme;

  // Block-based rendering (public page + admin builder)
  landing_blocks?: LandingBlock[];

  // Legacy/compat fields (still supported & mapped to blocks at runtime)
  display_mode?: StorefrontDisplayMode;
  landing_page?: StorefrontLanding;
  show_categories?: boolean | null;

  landing_overrides?: {
    /** Product view used on /[slug]/c/[cat] pages. */
    category_page_view?: GridMode;
  };

  top_section?: {
    mode?: TopSectionMode;          // "header" (default) | "hero"
    header_style?: HeaderStyle;     // "small" | "large-square" | "large-circle"
  };

  // Optional extras used in admin
  sort?: "newest" | "price_asc" | "price_desc" | "manual";
  cta_visibility?: Partial<Record<"instagram" | "whatsapp" | "custom1" | "custom2", boolean>>;
};

/* ========================== Socials / entities =========================== */

export type SocialsConfig = {
  instagram?: string | null;
  tiktok?: string | null;
  x?: string | null; // twitter / X
  facebook?: string | null;
  etsy?: string | null;
  amazon?: string | null;
  youtube?: string | null;
  [key: string]: string | null | undefined;
};

export type Category = {
  id: string;
  name: string;
  position?: number | null;
  cover_img?: string | null;
};

export type Product = {
  id: string;
  title: string;
  caption?: string | null;
  price?: string | null;
  thumb_url?: string | null;
  visible: boolean | null;
  category_id?: string | null;
  cta_label?: string | null;
  cta_url?: string | null;
  instagram_permalink?: string | null;
  position?: number | null;
};
