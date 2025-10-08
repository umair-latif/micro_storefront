// lib/types.ts

// ===== Theme =====
export type ThemeVariant = "clean" | "bold" | "minimal";

export type ThemePalette = {
  // Palette preset names you support (e.g. "default", "warm", "cool", "forest", "sunset", etc.)
  preset?: string | null;
  // Optional overrides (mainly used by "bold")
  primary?: string | null;
  accent?: string | null;
  // Optional resolved tokens (set by your theme resolver)
  bg?: string;
  surface?: string;
  text?: string;
  muted?: string;
};

export type StorefrontTheme = {
  variant?: ThemeVariant;
  palette?: ThemePalette;
};

// ===== Storefront config =====
export type StorefrontDisplayMode = "grid" | "list" | "links";
export type StorefrontLanding =
  | "products"
  | "categories"
  | "hero-only"
  | "business-card"; // alias for "hero-only"

export type StorefrontConfig = {
  theme?: StorefrontTheme;

  // Layout / rendering
  display_mode?: StorefrontDisplayMode;
  landing_page?: StorefrontLanding;
  show_categories?: boolean | null;

  // Optional extras used in admin
  sort?: "newest" | "price_asc" | "price_desc" | "manual";
  cta_visibility?: Partial<
    Record<"instagram" | "whatsapp" | "custom1" | "custom2", boolean>
  >;
};

// ===== Socials / entities =====
export type SocialsConfig = {
  instagram?: string | null;
  tiktok?: string | null;
  x?: string | null; // twitter / X
  facebook?: string | null;
  etsy?: string | null;
  amazon?: string | null;
  youtube?: string | null;
  // Allow future keys without breaking types
  [key: string]: string | null | undefined;
};

// ===== Data rows =====
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
