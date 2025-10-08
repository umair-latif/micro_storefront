import type { StorefrontConfig } from "./types";

export const DEFAULT_STOREFRONT_CONFIG: StorefrontConfig = {
  display_mode: "grid",
  show_categories: true,
  sort: "newest",
  landing_page: "products",
  cta_visibility: { instagram: true, whatsapp: true, custom1: true, custom2: false },
  theme: {
    variant: "clean",
    palette: { preset: "default", primary: null, accent: null },
  },
};
