// lib/types.ts

/* ============================== Theme ==================================== */

export type ThemeVariant = "clean" | "bold" | "minimal";

export type ThemeBackground = {
  type?: "color" | "gradient" | "image" | "none";
  value?: string | null;
};

export type ThemePalette = {
  preset?: string | null;
  primary?: string | null;
  accent?: string | null;
  // Optional resolved tokens (filled by your resolver)
  bg?: string;
  surface?: string;
  text?: string;
  muted?: string;
};

export type StorefrontTheme = {
  variant?: ThemeVariant;
  palette?: ThemePalette;
  background?: ThemeBackground;
};

/* ============================ Landing Blocks ============================= */

// unified grid modes used across admin + public
export type GridMode = "grid" | "grid_1" | "grid_2" | "grid_3" | "list" | "links";
export type CategoryNavStyle = "auto" | "chips" | "pills" | "square";
// common optional flags for all blocks
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
      type: "categories_wall";           // NEW: was category_cover_wall
      view?: GridMode;                   // "grid" | "list" | "links"
      columns?: 2 | 3 | 4;               // for grid only (default 3)
      limit?: number;
      _hidden?: boolean;
    } & BaseBlock)
  | ({
      type: "products";
      source: "all" | { category_id: string };
      view: GridMode;
      show_price?: boolean;
      show_caption?: boolean;
      limit?: number;
      cta?: "whatsapp" | "product" | "none";
        show_category_nav?: boolean;       // default false
      category_nav_style?: CategoryNavStyle; // "auto" (default), "chips" | "pills" | "square"
      _hidden?: boolean;
    } & BaseBlock)
  | ({
      type: "text";
      content_md: string;
      align?: "start" | "center";
    } & BaseBlock);

/* ============================ Storefront cfg ============================= */

// de-duplicate: use GridMode everywhere
export type StorefrontDisplayMode = GridMode;

export type StorefrontLanding =
  | "products"
  | "categories"
  | "hero-only"
  | "business-card"; // alias of hero-only

export type StorefrontConfig = {
  theme?: StorefrontTheme;

  // New: block-based rendering (used by public page + admin builder)
  landing_blocks?: LandingBlock[];

  // Legacy/compat fields (still supported & mapped to blocks at runtime)
  display_mode?: StorefrontDisplayMode;
  landing_page?: StorefrontLanding;
  show_categories?: boolean | null;

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
