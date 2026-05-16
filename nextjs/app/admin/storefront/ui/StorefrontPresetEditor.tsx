"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import type {
  LayoutPreset,
  StorefrontConfig,
  StoreTypePreset,
  ThemeVariant,
} from "@/lib/types";
import {
  applyPresetToConfig,
  layoutPresetPatch,
  LAYOUT_PRESET_OPTIONS,
  mergeStorefrontConfig,
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
    const next = mergeStorefrontConfig(config, patch);
    setConfig(next);
    persist(patch);
  }

  function applyLayoutPreset(preset: LayoutPreset) {
    setConfig(applyPresetToConfig(config, preset));
    persist(layoutPresetPatch(preset));
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
        <div className="max-w-xl">
          <h2 className="text-base font-semibold text-neutral-900">Storefront setup</h2>
          <p className="mt-1 text-sm text-neutral-500">Choose the closest starting point. You can customize sections after the basics feel right.</p>
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
        title="Starting point presets"
        prompt="Choose the structure visitors should see first."
      >
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            {LAYOUT_PRESET_OPTIONS.map((option) => {
              const active = option.value === config.layout_preset;
              return (
                <PresetCard
                  key={option.value}
                  title={option.label}
                  description={option.description}
                  kicker={option.value === "product_showcase" ? "Popular default" : "Preset"}
                  active={active}
                  visual={<LayoutPresetPreview preset={option.value} active={active} />}
                  onClick={() => applyLayoutPreset(option.value)}
                />
              );
            })}
          </div>

          <details className="rounded-xl border border-black/10 bg-neutral-50/70 px-3 py-2">
            <summary className="cursor-pointer list-none text-sm font-medium text-neutral-700">
              Business type
              <span className="ml-2 text-xs font-normal text-neutral-500">
                {STORE_TYPE_OPTIONS.find((option) => option.value === config.store_type)?.label}
              </span>
            </summary>
            <div className="mt-3 flex flex-wrap gap-2">
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
          </details>
        </div>
      </GuidedSection>

      <GuidedSection
        step="2"
        title="Visual themes"
        prompt="Pick the overall feel and a palette."
      >
        <div className="grid gap-5 lg:grid-cols-[1fr,300px]">
          <div className="grid gap-3 sm:grid-cols-3">
            {THEME_VARIANT_OPTIONS.map((option) => {
              const active = option.value === variant;
              return (
                <PresetCard
                  key={option.value}
                  title={option.label}
                  description={option.description}
                  kicker="Theme"
                  active={active}
                  visual={<ThemeVariantPreview variant={option.value} active={active} />}
                  onClick={() => setThemeVariant(option.value)}
                />
              );
            })}
          </div>
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">Palette</div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
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
                    className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left text-sm transition ${
                      active ? "border-neutral-900 bg-neutral-900 text-white" : "border-black/10 bg-white hover:bg-neutral-50"
                    }`}
                  >
                    <span>{option.label}</span>
                    <PaletteDots preset={option.value} active={active} />
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
    <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-start gap-3 border-b border-black/10 pb-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
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
  kicker,
  title,
  description,
  active,
  visual,
  onClick,
}: {
  kicker?: string;
  title: string;
  description: string;
  active: boolean;
  visual?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group relative flex min-h-56 flex-col overflow-hidden rounded-2xl border p-3 text-left transition sm:min-h-60 ${
        active
          ? "border-neutral-950 bg-white shadow-md ring-2 ring-neutral-950 ring-offset-2"
          : "border-black/10 bg-white hover:-translate-y-0.5 hover:border-black/20 hover:bg-neutral-50 hover:shadow-md"
      }`}
    >
      <div className={`absolute left-0 top-0 h-1 w-full ${active ? "bg-neutral-950" : "bg-transparent"}`} />
      <div className="mb-3 flex h-6 items-center justify-between gap-2">
        <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${
          active ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-600"
        }`}>
          {active ? "Selected" : kicker}
        </span>
        {active ? <CheckCircle2 className="h-5 w-5 text-neutral-950" /> : null}
      </div>
      {visual ? <div className="mb-4 h-32 overflow-hidden rounded-xl">{visual}</div> : null}
      <div className="min-h-20">
        <div className="text-sm font-semibold text-neutral-950">{title}</div>
        <p className="mt-2 text-xs leading-5 text-neutral-500">
          {description}
        </p>
      </div>
      <span className={`mt-auto pt-4 text-xs font-semibold ${active ? "text-neutral-950" : "text-neutral-500 group-hover:text-neutral-900"}`}>
        {active ? "Ready to customize" : "Use this preset"}
      </span>
    </button>
  );
}

function LayoutPresetPreview({ preset, active }: { preset: LayoutPreset; active: boolean }) {
  const frame = active ? "border-neutral-300 bg-neutral-100" : "border-black/10 bg-neutral-100";
  const screen = "bg-white";
  const ink = active ? "bg-neutral-950" : "bg-neutral-900";
  const muted = active ? "bg-neutral-200" : "bg-neutral-200";
  const accent = active ? "bg-emerald-500" : "bg-neutral-900";

  if (preset === "business_card") {
    return (
      <PhoneMockup frame={frame} screen={screen}>
        <div className="flex h-full flex-col items-center justify-center">
          <div className={`h-10 w-10 rounded-full ${accent}`} />
          <div className={`mt-3 h-2 w-24 rounded-full ${ink}`} />
          <div className={`mt-2 h-2 w-16 rounded-full ${muted}`} />
          <div className="mt-4 flex gap-2">
            {[0, 1, 2].map((item) => (
              <div key={item} className={`h-6 w-6 rounded-full ${item === 0 ? ink : muted}`} />
            ))}
          </div>
        </div>
      </PhoneMockup>
    );
  }

  if (preset === "link_in_bio") {
    return (
      <PhoneMockup frame={frame} screen={screen}>
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-full ${accent}`} />
          <div className="space-y-1">
            <div className={`h-2 w-20 rounded-full ${ink}`} />
            <div className={`h-2 w-12 rounded-full ${muted}`} />
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className={`h-6 rounded-full ${item === 0 ? ink : "bg-neutral-100"} border border-black/5`} />
          ))}
        </div>
      </PhoneMockup>
    );
  }

  if (preset === "collections_first") {
    return (
      <PhoneMockup frame={frame} screen={screen}>
        <div className={`h-2 w-24 rounded-full ${ink}`} />
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className={`h-10 rounded-lg ${item === 0 ? accent : "bg-neutral-100"} border border-black/5`} />
          ))}
        </div>
      </PhoneMockup>
    );
  }

  if (preset === "featured_drop") {
    return (
      <PhoneMockup frame={frame} screen={screen}>
        <div className={`h-12 rounded-xl ${accent}`} />
        <div className={`mt-3 h-2 w-28 rounded-full ${ink}`} />
        <div className={`mt-2 h-2 w-16 rounded-full ${muted}`} />
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-6 rounded-md border border-black/5 bg-neutral-100" />
          ))}
        </div>
      </PhoneMockup>
    );
  }

  return (
    <PhoneMockup frame={frame} screen={screen}>
      <div className="grid grid-cols-2 gap-2">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className={`aspect-square rounded-lg ${item === 0 ? accent : "bg-neutral-100"} border border-black/5`} />
        ))}
      </div>
    </PhoneMockup>
  );
}

function ThemeVariantPreview({ variant, active }: { variant: ThemeVariant; active: boolean }) {
  const styles: Record<ThemeVariant, { bg: string; panel: string; accent: string; muted: string; text: string }> = {
    clean: { bg: "bg-stone-100", panel: "bg-white", accent: "bg-emerald-500", muted: "bg-stone-200", text: "bg-neutral-900" },
    minimal: { bg: "bg-zinc-950", panel: "bg-zinc-800", accent: "bg-white", muted: "bg-zinc-600", text: "bg-zinc-100" },
    bold: { bg: "bg-rose-100", panel: "bg-sky-600", accent: "bg-amber-300", muted: "bg-white/35", text: "bg-white" },
  };
  const style = styles[variant];
  return (
    <div className={`h-full rounded-xl border p-3 ${active ? "border-neutral-300" : "border-black/10"} ${style.bg}`}>
      <div className={`h-full rounded-lg p-3 shadow-sm ${style.panel}`}>
        <div className="flex items-center justify-between">
          <div className={`h-2 w-14 rounded-full ${style.text}`} />
          <div className={`h-5 w-5 rounded-full ${style.accent}`} />
        </div>
        <div className={`mt-3 h-7 rounded-lg ${style.accent}`} />
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className={`h-7 rounded-md ${style.text}`} />
          <div className={`h-7 rounded-md ${style.muted}`} />
          <div className={`h-7 rounded-md ${style.muted}`} />
        </div>
      </div>
    </div>
  );
}

function PhoneMockup({
  frame,
  screen,
  children,
}: React.PropsWithChildren<{ frame: string; screen: string }>) {
  return (
    <div className={`h-full rounded-xl border p-2 ${frame}`}>
      <div className={`h-full overflow-hidden rounded-lg p-3 ${screen}`}>
        {children}
      </div>
    </div>
  );
}

function PaletteDots({ preset, active }: { preset: string; active: boolean }) {
  const palettes: Record<string, string[]> = {
    default: ["#111827", "#10b981", "#f3f4f6"],
    warm: ["#7c2d12", "#f97316", "#fff7ed"],
    cool: ["#1e3a8a", "#06b6d4", "#ecfeff"],
    light: ["#111827", "#737373", "#fafafa"],
    dark: ["#f9fafb", "#a3a3a3", "#171717"],
    sunset: ["#be123c", "#fb923c", "#fff1f2"],
    ocean: ["#0f766e", "#38bdf8", "#ecfeff"],
    forest: ["#14532d", "#84cc16", "#f7fee7"],
  };
  const colors = palettes[preset] ?? palettes.default;
  return (
    <span className="flex shrink-0 items-center -space-x-1">
      {colors.map((color) => (
        <span
          key={color}
          className={`h-4 w-4 rounded-full border ${active ? "border-white/50" : "border-black/10"}`}
          style={{ backgroundColor: color }}
        />
      ))}
    </span>
  );
}
