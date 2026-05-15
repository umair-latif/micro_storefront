"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import type {
  StorefrontConfig,
  StoreTypePreset,
  ThemeVariant,
} from "@/lib/types";
import {
  layoutPresetPatch,
  LAYOUT_PRESET_OPTIONS,
  normalizeStorefrontConfig,
  PALETTE_PRESETS,
  STORE_TYPE_OPTIONS,
  THEME_VARIANT_OPTIONS,
} from "@/lib/storefront-config";
import { updateStorefrontConfigAction } from "../actions";

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
}: {
  profileId: string;
  initialConfig?: StorefrontConfig | null;
}) {
  const [config, setConfig] = useState<StorefrontConfig>(() => normalizeStorefrontConfig(initialConfig));
  const [saving, startSaving] = useTransition();
  const [savedTick, setSavedTick] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const theme = config.theme ?? {};
  const variant = (theme.variant ?? "clean") as ThemeVariant;
  const paletteOptions = PALETTE_PRESETS[variant] ?? PALETTE_PRESETS.clean;

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
    const currentTheme = config.theme ?? {};
    const patchTheme = patch.theme ?? {};
    const next = normalizeStorefrontConfig({
      ...config,
      ...patch,
      theme: {
        ...currentTheme,
        ...patchTheme,
        palette: {
          ...(currentTheme.palette ?? {}),
          ...(patchTheme.palette ?? {}),
        },
      },
    });
    setConfig(next);
    persist(patch);
  }

  function setThemeVariant(nextVariant: ThemeVariant) {
    update({
      theme: {
        ...theme,
        variant: nextVariant,
        palette: {
          ...(theme.palette ?? {}),
          preset: PALETTE_PRESETS[nextVariant][0]?.value ?? "default",
        },
      },
    });
  }

  useEffect(() => {
    if (!savedTick) return;
    const timer = window.setTimeout(() => setSavedTick(0), 1000);
    return () => window.clearTimeout(timer);
  }, [savedTick]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Build your storefront</h2>
          <p className="mt-1 text-sm text-neutral-500">Start with presets, then fine-tune only if needed.</p>
        </div>
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

      <GuidedSection
        step="1"
        title="Choose a starting point"
        prompt="Pick the closest business type, then choose how the page should behave."
      >
        <div className="space-y-4">
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">Storefront type</div>
            <div className="flex flex-wrap gap-2">
              {STORE_TYPE_OPTIONS.map((option) => {
                const active = option.value === config.store_type;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => update({ store_type: option.value as StoreTypePreset })}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      active ? "border-neutral-900 bg-neutral-900 text-white" : "border-black/10 bg-white hover:bg-neutral-50"
                    }`}
                    title={option.description}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {LAYOUT_PRESET_OPTIONS.map((option) => (
              <PresetCard
                key={option.value}
                title={option.label}
                description={option.description}
                active={option.value === config.layout_preset}
                onClick={() => update(layoutPresetPatch(option.value))}
              />
            ))}
          </div>
        </div>
      </GuidedSection>

      <GuidedSection
        step="2"
        title="Choose a visual style"
        prompt="Select the overall feel first, then a simple palette."
      >
        <div className="grid gap-4 lg:grid-cols-[1fr,280px]">
          <div className="grid gap-3 sm:grid-cols-3">
            {THEME_VARIANT_OPTIONS.map((option) => (
              <PresetCard
                key={option.value}
                title={option.label}
                description={option.description}
                active={option.value === variant}
                onClick={() => setThemeVariant(option.value)}
              />
            ))}
          </div>
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">Palette</div>
            <div className="grid gap-2">
              {paletteOptions.map((option) => {
                const active = option.value === (theme.palette?.preset ?? "default");
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      update({
                        theme: {
                          ...theme,
                          palette: { ...(theme.palette ?? {}), preset: option.value },
                        },
                      })
                    }
                    className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                      active ? "border-neutral-900 bg-neutral-900 text-white" : "border-black/10 bg-white hover:bg-neutral-50"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </GuidedSection>
    </div>
  );
}

function GuidedSection({
  step,
  title,
  prompt,
  children,
}: React.PropsWithChildren<{ step: string; title: string; prompt: string }>) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
          {step}
        </div>
        <div>
          <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
          <p className="mt-1 text-sm text-neutral-500">{prompt}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function PresetCard({
  title,
  description,
  active,
  onClick,
}: {
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-28 rounded-2xl border p-4 text-left transition ${
        active
          ? "border-neutral-900 bg-neutral-900 text-white shadow-sm"
          : "border-black/10 bg-white hover:-translate-y-0.5 hover:bg-neutral-50 hover:shadow-sm"
      }`}
    >
      <div className="text-sm font-semibold">{title}</div>
      <p className={`mt-2 text-xs leading-5 ${active ? "text-white/75" : "text-neutral-500"}`}>
        {description}
      </p>
    </button>
  );
}
