import { DEFAULT_STOREFRONT_CONFIG } from "@/lib/defaults";
import type {
  GridMode,
  LandingBlock,
  LayoutPreset,
  StorefrontConfig,
  StorefrontLanding,
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

export function layoutPresetToLegacyKeys(layout_preset: LayoutPreset): StorefrontConfig {
  const hit = LAYOUT_PRESET_OPTIONS.find((item) => item.value === layout_preset);
  return { ...(hit?.patch ?? {}) };
}

export function layoutPresetPatch(layout: LayoutPreset): StorefrontConfig {
  return { layout_preset: layout, ...layoutPresetToLegacyKeys(layout) };
}

export function applyPresetToConfig(config: unknown, presetId: LayoutPreset): StorefrontConfig {
  return mergeStorefrontConfig(config, layoutPresetPatch(presetId));
}

function getLayoutPresetPatch(layout: LayoutPreset): StorefrontConfig {
  const hit = LAYOUT_PRESET_OPTIONS.find((item) => item.value === layout);
  return { layout_preset: layout, ...(hit?.patch ?? {}) };
}

const GRID_MODES = new Set<GridMode>(["grid", "grid_1", "grid_2", "grid_3", "list", "links"]);
const LANDING_PAGES = new Set<StorefrontLanding>(["products", "categories", "hero-only", "business-card"]);
const LAYOUT_PRESETS = new Set<LayoutPreset>(LAYOUT_PRESET_OPTIONS.map((item) => item.value));
const STORE_TYPES = new Set<StoreTypePreset>(STORE_TYPE_OPTIONS.map((item) => item.value));
const THEME_VARIANTS = new Set<ThemeVariant>(THEME_VARIANT_OPTIONS.map((item) => item.value));

export function parseStorefrontConfig(raw: unknown): StorefrontConfig {
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

function normalizeLandingPage(value: unknown): StorefrontLanding | undefined {
  if (value === "business-card") return "hero-only";
  return typeof value === "string" && LANDING_PAGES.has(value as StorefrontLanding)
    ? (value as StorefrontLanding)
    : undefined;
}

function normalizeGridMode(value: unknown): GridMode | undefined {
  return typeof value === "string" && GRID_MODES.has(value as GridMode) ? (value as GridMode) : undefined;
}

function normalizeLayoutPreset(value: unknown): LayoutPreset | undefined {
  return typeof value === "string" && LAYOUT_PRESETS.has(value as LayoutPreset) ? (value as LayoutPreset) : undefined;
}

function normalizeStoreType(value: unknown): StoreTypePreset | undefined {
  return typeof value === "string" && STORE_TYPES.has(value as StoreTypePreset) ? (value as StoreTypePreset) : undefined;
}

function normalizeThemeVariant(value: unknown): ThemeVariant | undefined {
  return typeof value === "string" && THEME_VARIANTS.has(value as ThemeVariant) ? (value as ThemeVariant) : undefined;
}

function normalizeAliases(parsed: StorefrontConfig & Record<string, any>): StorefrontConfig {
  return {
    ...parsed,
    display_mode: normalizeGridMode(parsed.display_mode ?? parsed.view),
    show_categories: parsed.show_categories ?? parsed.showCategories,
    landing_page: normalizeLandingPage(parsed.landing_page ?? parsed.landingPage ?? parsed.landing),
    layout_preset: normalizeLayoutPreset(parsed.layout_preset ?? parsed.layoutPreset),
    store_type: normalizeStoreType(parsed.store_type ?? parsed.storeType),
  };
}

export function normalizeStorefrontConfig(raw?: unknown): StorefrontConfig {
  const parsed = normalizeAliases(parseStorefrontConfig(raw) as StorefrontConfig & Record<string, any>);
  const rawTheme = (parsed as any).theme;
  const theme = typeof rawTheme === "string" ? { variant: rawTheme } : rawTheme ?? {};
  const defaultTheme = DEFAULT_STOREFRONT_CONFIG.theme;
  const defaultThemeObj = typeof defaultTheme === "string" ? { variant: defaultTheme } : defaultTheme ?? {};
  const normalizedVariant = normalizeThemeVariant(theme.variant) ?? normalizeThemeVariant(defaultThemeObj.variant) ?? "clean";

  const normalized: StorefrontConfig = {
    ...DEFAULT_STOREFRONT_CONFIG,
    ...parsed,
    theme: {
      ...defaultThemeObj,
      ...theme,
      variant: normalizedVariant,
      palette: {
        ...(defaultThemeObj.palette ?? {}),
        ...(theme.palette ?? {}),
      },
      background: {
        ...(defaultThemeObj.background ?? {}),
        ...(theme.background ?? {}),
      },
    },
  };

  if (!normalized.layout_preset) normalized.layout_preset = "product_showcase";
  if (!normalized.store_type) normalized.store_type = "shop";

  const patch = getLayoutPresetPatch(normalized.layout_preset);
  return {
    ...normalized,
    landing_page: normalized.landing_page ?? patch.landing_page,
    display_mode: normalized.display_mode ?? patch.display_mode,
    show_categories: normalized.show_categories ?? patch.show_categories ?? true,
  };
}

export function mergeStorefrontConfig(current: unknown, patch: StorefrontConfig): StorefrontConfig {
  const cfg = normalizeStorefrontConfig(current);
  const currentTheme = typeof cfg.theme === "string" ? { variant: cfg.theme as ThemeVariant } : cfg.theme ?? {};
  const patchTheme = typeof patch.theme === "string" ? { variant: patch.theme as ThemeVariant } : patch.theme ?? {};

  return normalizeStorefrontConfig({
    ...cfg,
    ...patch,
    theme: {
      ...currentTheme,
      ...patchTheme,
      palette: {
        ...(currentTheme.palette ?? {}),
        ...(patchTheme.palette ?? {}),
      },
      background: {
        ...(currentTheme.background ?? {}),
        ...(patchTheme.background ?? {}),
      },
    },
  });
}

export function getStorefrontLandingBlocks(raw?: unknown): LandingBlock[] {
  const cfg = normalizeStorefrontConfig(raw);
  if (Array.isArray(cfg.landing_blocks) && cfg.landing_blocks.length > 0) {
    return cfg.landing_blocks;
  }

  const hero: LandingBlock = { type: "hero", show_avatar: true, show_socials: true, show_ctas: true };

  if (cfg.landing_page === "hero-only" || cfg.landing_page === "business-card") return [hero];
  if (cfg.landing_page === "categories") {
    return [
      hero,
      { type: "categories_wall", view: "grid", columns: 3 },
    ];
  }

  return [
    hero,
    { type: "products", source: "all", view: cfg.display_mode ?? "grid_3", show_price: true },
  ];
}

export function getStoreTypeLabel(value?: StoreTypePreset | null) {
  return STORE_TYPE_OPTIONS.find((item) => item.value === value)?.label ?? "Small Shop";
}

export function getLayoutPresetLabel(value?: LayoutPreset | null) {
  return LAYOUT_PRESET_OPTIONS.find((item) => item.value === value)?.label ?? "Product Showcase";
}
