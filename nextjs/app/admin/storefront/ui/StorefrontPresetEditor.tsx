"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { CheckCircle2, ExternalLink, Loader2, TriangleAlert } from "lucide-react";
import type {
  LayoutPreset,
  StorefrontConfig,
  StoreTypePreset,
  ThemeVariant,
} from "@/lib/types";
import { updateStorefrontConfigAction } from "../actions";

const STORE_TYPES: Array<{ value: StoreTypePreset; label: string }> = [
  { value: "creator", label: "Creator / Influencer" },
  { value: "artist", label: "Artist / Designer" },
  { value: "shop", label: "Small Shop" },
  { value: "services", label: "Service Provider" },
  { value: "food", label: "Food / Home Business" },
  { value: "pod", label: "POD / Merch Store" },
  { value: "portfolio_links", label: "Portfolio + Links" },
];

const LAYOUTS: Array<{ value: LayoutPreset; label: string; patch: StorefrontConfig }> = [
  { value: "business_card", label: "Business Card", patch: { landing_page: "hero-only" } },
  { value: "link_in_bio", label: "Link-in-Bio", patch: { landing_page: "products", display_mode: "links" } },
  { value: "product_showcase", label: "Product Showcase", patch: { landing_page: "products", display_mode: "grid" } },
  { value: "collections_first", label: "Collections First", patch: { landing_page: "categories", show_categories: true } },
  { value: "featured_drop", label: "Featured Drop", patch: { landing_page: "products", display_mode: "grid" } },
];

const PALETTES: Record<ThemeVariant, Array<{ value: string; label: string }>> = {
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

function normalizeConfig(config?: StorefrontConfig | null): StorefrontConfig {
  const theme = typeof config?.theme === "string" ? { variant: config.theme as ThemeVariant } : config?.theme;
  return {
    store_type: "shop",
    layout_preset: "product_showcase",
    landing_page: "products",
    display_mode: "grid",
    show_categories: true,
    ...config,
    theme: {
      variant: "clean",
      ...(theme ?? {}),
      palette: {
        preset: "default",
        ...(theme?.palette ?? {}),
      },
    },
  };
}

function layoutPatch(layout: LayoutPreset): StorefrontConfig {
  const hit = LAYOUTS.find((item) => item.value === layout);
  return { layout_preset: layout, ...(hit?.patch ?? {}) };
}

function useDebouncedCallback<T extends (...args: any[]) => void>(fn: T, ms: number) {
  const ref = useRef<number | null>(null);
  return (...args: Parameters<T>) => {
    if (ref.current) window.clearTimeout(ref.current);
    ref.current = window.setTimeout(() => fn(...args), ms);
  };
}

export default function StorefrontPresetEditor({
  profileId,
  initialConfig,
  publicUrl,
}: {
  profileId: string;
  initialConfig?: StorefrontConfig | null;
  publicUrl: string;
}) {
  const [config, setConfig] = useState<StorefrontConfig>(() => normalizeConfig(initialConfig));
  const [saving, startSaving] = useTransition();
  const [savedTick, setSavedTick] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const variant = (config.theme?.variant ?? "clean") as ThemeVariant;
  const paletteOptions = PALETTES[variant] ?? PALETTES.clean;

  const persist = useDebouncedCallback((patch: StorefrontConfig) => {
    startSaving(async () => {
      setError(null);
      const res = await updateStorefrontConfigAction(profileId, patch);
      if (!res.ok) {
        setError("error" in res ? res.error : "Failed to save storefront.");
        return;
      }
      setSavedTick(Date.now());
    });
  }, 250);

  function update(patch: StorefrontConfig) {
    const next = normalizeConfig({
      ...config,
      ...patch,
      theme: {
        ...(config.theme ?? {}),
        ...(patch.theme ?? {}),
        palette: {
          ...(config.theme?.palette ?? {}),
          ...(patch.theme?.palette ?? {}),
        },
      },
    });
    setConfig(next);
    persist(patch);
  }

  function setThemeVariant(nextVariant: ThemeVariant) {
    update({
      theme: {
        ...(config.theme ?? {}),
        variant: nextVariant,
        palette: {
          ...(config.theme?.palette ?? {}),
          preset: PALETTES[nextVariant][0]?.value ?? "default",
        },
      },
    });
  }

  useEffect(() => {
    if (!savedTick) return;
    const timer = window.setTimeout(() => setSavedTick(0), 1000);
    return () => window.clearTimeout(timer);
  }, [savedTick]);

  const selected = useMemo(
    () => ({
      storeType: STORE_TYPES.find((item) => item.value === config.store_type)?.label ?? "Small Shop",
      layout: LAYOUTS.find((item) => item.value === config.layout_preset)?.label ?? "Product Showcase",
      theme: `${variant[0].toUpperCase()}${variant.slice(1)} / ${config.theme?.palette?.preset ?? "default"}`,
    }),
    [config.store_type, config.layout_preset, config.theme?.palette?.preset, variant]
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">Storefront Setup</h2>
            <p className="mt-1 text-xs text-neutral-500">
              {selected.storeType} · {selected.layout} · {selected.theme}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-neutral-50"
            >
              <ExternalLink className="h-4 w-4" />
              View store
            </a>
            <div className="inline-flex h-5 items-center gap-2 text-xs">
              {saving ? (
                <span className="inline-flex items-center gap-1 text-neutral-600">
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </span>
              ) : null}
              {!saving && savedTick > 0 ? (
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" /> Saved
                </span>
              ) : null}
              {error ? (
                <span className="inline-flex items-center gap-1 text-amber-700">
                  <TriangleAlert className="h-4 w-4" /> {error}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <PresetSection title="Store Type" prompt="What kind of storefront are you building?">
        <OptionGrid
          options={STORE_TYPES}
          value={config.store_type ?? "shop"}
          onChange={(storeType) => update({ store_type: storeType as StoreTypePreset })}
        />
      </PresetSection>

      <PresetSection title="Page Layout" prompt="How should the page behave?">
        <OptionGrid
          options={LAYOUTS}
          value={config.layout_preset ?? "product_showcase"}
          onChange={(layout) => update(layoutPatch(layout as LayoutPreset))}
        />
      </PresetSection>

      <PresetSection title="Visual Theme" prompt="How should it look?">
        <div className="grid gap-3 lg:grid-cols-[1fr,1fr]">
          <OptionGrid
            options={[
              { value: "clean", label: "Clean" },
              { value: "minimal", label: "Minimal" },
              { value: "bold", label: "Bold" },
            ]}
            value={variant}
            onChange={(nextVariant) => setThemeVariant(nextVariant as ThemeVariant)}
          />
          <OptionGrid
            options={paletteOptions}
            value={config.theme?.palette?.preset ?? paletteOptions[0]?.value ?? "default"}
            onChange={(preset) =>
              update({
                theme: {
                  ...(config.theme ?? {}),
                  palette: { ...(config.theme?.palette ?? {}), preset },
                },
              })
            }
          />
        </div>
      </PresetSection>
    </div>
  );
}

function PresetSection({
  title,
  prompt,
  children,
}: React.PropsWithChildren<{ title: string; prompt: string }>) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
        <p className="text-xs text-neutral-500">{prompt}</p>
      </div>
      {children}
    </section>
  );
}

function OptionGrid({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
              active ? "border-neutral-900 bg-neutral-900 text-white" : "border-black/10 bg-white hover:bg-neutral-50"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
