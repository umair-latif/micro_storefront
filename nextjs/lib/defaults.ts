import type { StorefrontConfig } from "./types";

export const DEFAULT_STOREFRONT_CONFIG: StorefrontConfig = {
  display_mode: "grid",
  show_categories: true,
  sort: "newest",
  cta_visibility: { instagram: true, whatsapp: true },
  theme: "classic",
};