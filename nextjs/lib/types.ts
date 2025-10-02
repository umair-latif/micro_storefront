export type StorefrontDisplayMode = "grid" | "links" | "list";

export type StorefrontConfig = {
  display_mode: StorefrontDisplayMode;
  show_categories: boolean;
  sort: "newest" | "price_asc" | "price_desc" | "manual";
  cta_visibility: {
    instagram?: boolean;
    whatsapp?: boolean;
    custom1?: boolean;
    custom2?: boolean;
  };
  theme?: "classic" | "glass" | "minimal";
};