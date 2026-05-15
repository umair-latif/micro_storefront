import { DEFAULT_STOREFRONT_CONFIG } from "@/lib/defaults";
import type {
  LayoutPreset,
  StorefrontConfig,
  StoreTypePreset,
  ThemeVariant,
} from "@/lib/types";

export const STORE_TYPE_OPTIONS: Array<{
  value: StoreTypePreset;
  label: string;
  description: string;
}> = [
  { value: "creator", label: "Creator / Influencer", description: "Content, drops, links, and social-first offers." },
  { value: "artist", label: "Artist / Designer", description: "Visual work, commissions, prints, or design services." },
  { value: "shop", label: "Small Shop", description: "Products, collections, prices, and buying links." },
  { value: "services", label: "Service Provider", description: "Bookings, forms, packages, and direct contact." },
  { value: "food", label: "Food / Home Business", description: "Menus, preorder links, pickup info, and WhatsApp." },
  { value: "pod", label: "POD / Merch Store", description: "Merch, external product links, and featured drops." },
  { value: "portfolio_links", label: "Portfolio + Links", description: "A clean profile with links and selected work." },
];

export const LAYOUT_PRESET_OPTIONS: Array<{
  value: LayoutPreset;
  label: string;
  description: string;
  patch: StorefrontConfig;
}> = [
  {
    value: "business_card",
    label: "Business Card",
    description: "A simple profile with identity, socials, and contact buttons.",
    patch: { landing_page: "hero-only" },
  },
  {
    value: "link_in_bio",
    label: "Link-in-Bio",
    description: "A stack of links, offers, and actions for mobile visitors.",
    patch: { landing_page: "products", display_mode: "links" },
  },
  {
    value: "product_showcase",
    label: "Product Showcase",
    description: "A clean product grid with detail pages and buying links.",
    patch: { landing_page: "products", display_mode: "grid" },
  },
  {
    value: "collections_first",
    label: "Collections First",
    description: "Lead with collections before visitors browse individual items.",
    patch: { landing_page: "categories", show_categories: true },
  },
  {
    value: "featured_drop",
    label: "Featured Drop",
    description: "Best for launches, limited releases, and a focused offer.",
    patch: { landing_page: "products", display_mode: "grid" },
  },
];

export const THEME_VARIANT_OPTIONS: Array<{
  value: ThemeVariant;
  label: string;
  description: string;
}> = [
  { value: "clean", label: "Clean", description: "Soft, neutral, Instagram-like." },
  { value: "minimal", label: "Minimal", description: "Sharp, restrained, and quiet." },
  { value: "bold", label: "Bold", description: "High contrast and more expressive." },
];

export const PALETTE_PRESETS: Record<ThemeVariant, Array<{ value: string; label: string }>> = {
  clean: [
    { value: "default", label: "Default" },
    { value: "warm", label: "Warm" },
    { value: "cool", label: "Cool" },
  ],
  minimal: [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ],
  bold: [
    { value: "sunset", label: "Sunset" },
    { value: "ocean", label: "Ocean" },
    { value: "forest", label: "Forest" },
  ],
};

export function layoutPresetPatch(layout: LayoutPreset): StorefrontConfig {
  const hit = LAYOUT_PRESET_OPTIONS.find((item) => item.value === layout);
  return { layout_preset: layout, ...(hit?.patch ?? {}) };
}

function parseRawConfig(raw: unknown): StorefrontConfig {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as StorefrontConfig;
    } catch {
      return {};
    }
  }
  return raw as StorefrontConfig;
}

export function normalizeStorefrontConfig(raw?: StorefrontConfig | string | null): StorefrontConfig {
  const parsed = parseRawConfig(raw);
  const rawTheme = (parsed as any).theme;
  const theme = typeof rawTheme === "string" ? { variant: rawTheme } : rawTheme ?? {};
  const defaultTheme = DEFAULT_STOREFRONT_CONFIG.theme;
  const defaultThemeObj = typeof defaultTheme === "string" ? { variant: defaultTheme } : defaultTheme ?? {};

  const normalized: StorefrontConfig = {
    ...DEFAULT_STOREFRONT_CONFIG,
    ...parsed,
    theme: {
      ...defaultThemeObj,
      ...theme,
      palette: {
        ...(defaultThemeObj.palette ?? {}),
        ...(theme.palette ?? {}),
      },
    },
  };

  if (!normalized.layout_preset) normalized.layout_preset = "product_showcase";
  if (!normalized.store_type) normalized.store_type = "shop";

  const patch = layoutPresetPatch(normalized.layout_preset);
  return {
    ...normalized,
    landing_page: normalized.landing_page ?? patch.landing_page,
    display_mode: normalized.display_mode ?? patch.display_mode,
    show_categories: normalized.show_categories ?? patch.show_categories ?? true,
  };
}

export function getStoreTypeLabel(value?: StoreTypePreset | null) {
  return STORE_TYPE_OPTIONS.find((item) => item.value === value)?.label ?? "Small Shop";
}

export function getLayoutPresetLabel(value?: LayoutPreset | null) {
  return LAYOUT_PRESET_OPTIONS.find((item) => item.value === value)?.label ?? "Product Showcase";
}
