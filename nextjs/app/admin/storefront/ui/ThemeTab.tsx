import React, { useEffect, useMemo, useState } from "react";
import { Palette, ChevronDown, ChevronUp, Wand2 } from "lucide-react";
import type { GridMode } from "@/lib/types";

/**
 * Drop-in Theme Tab UI for micro_storefront
 *
 * Usage:
 * <ThemeTab
 *   value={storefront.theme}
 *   onChange={(next)=>saveTheme(next)}
 *   categoryPageView={cfg.landing_overrides?.category_page_view}
 *   onSetCategoryPageView={(v)=>saveCfg({...cfg, landing_overrides:{...(cfg.landing_overrides||{}), category_page_view:v}})}
 * />
 *
 * Props
 *  - value: {
 *      variant?: 'clean'|'bold'|'minimal'
 *      palette?: { preset?: string|null; primary?: string|null; accent?: string|null }
 *      background?: { type?: 'color'|'gradient'|'image'|'none'; value?: string|null }
 *    }
 *  - onChange: (nextTheme) => void
 *  - categoryPageView?: GridMode                          // OPTIONAL
 *  - onSetCategoryPageView?: (v: GridMode|undefined) => void // OPTIONAL
 */

export type StorefrontTheme = {
  variant?: 'clean' | 'bold' | 'minimal';
  palette?: {
    preset?: string | null;
    primary?: string | null; // hex override
    accent?: string | null;  // hex override
  };
  background?: {
    type?: 'color' | 'gradient' | 'image' | 'none';
    value?: string | null; // css color/gradient or url
  };
};

// -------------------- Presets by Variant -------------------- //
const CLEAN_PRESETS: Record<string, { primary: string; accent: string; bg: string; text: string }>
  = {
    default: { primary: '#111827', accent: '#2563EB', bg: '#FFFFFF', text: '#111827' },
    warm:    { primary: '#1F2937', accent: '#EA580C', bg: '#FFFBF8', text: '#111827' },
    cool:    { primary: '#0F172A', accent: '#06B6D4', bg: '#F8FBFF', text: '#0F172A' },
  };

const MINIMAL_PRESETS: Record<string, { primary: string; accent: string; bg: string; text: string }>
  = {
    light: { primary: '#111827', accent: '#6B7280', bg: '#FFFFFF', text: '#111827' },
    dark:  { primary: '#E5E7EB', accent: '#9CA3AF', bg: '#0B0F19', text: '#E5E7EB' },
  };

const BOLD_PRESETS: Record<string, { primary: string; accent: string; bg: string; text: string }>
  = {
    ocean:  { primary: '#0EA5E9', accent: '#22D3EE', bg: '#06131D', text: '#E6F6FF' },
    sunset: { primary: '#F97316', accent: '#E11D48', bg: '#1A0B0B', text: '#FFEDE6' },
    forest: { primary: '#10B981', accent: '#34D399', bg: '#0B130E', text: '#E6FFF5' },
  };

// -------------------- Resolve Effective Theme -------------------- //
function clampHex(hex?: string | null): string | null {
  if (!hex) return null;
  const h = hex.trim();
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(h)) return h.toUpperCase();
  return null; // ignore invalid
}

function resolveTheme(t: StorefrontTheme | undefined) {
  const variant = t?.variant ?? 'clean';
  const presetName = t?.palette?.preset ?? (
    variant === 'clean' ? 'default' : variant === 'minimal' ? 'light' : 'ocean'
  );

  const base = variant === 'clean' ? CLEAN_PRESETS[presetName]
    : variant === 'minimal' ? MINIMAL_PRESETS[presetName]
    : BOLD_PRESETS[presetName];

  // fallbacks if unknown preset
  const safeBase = base ?? CLEAN_PRESETS.default;

  const primary = clampHex(t?.palette?.primary) ?? safeBase.primary;
  const accent  = clampHex(t?.palette?.accent)  ?? safeBase.accent;

  // background handling
  const bgType  = t?.background?.type ?? 'none';
  const bgValue = t?.background?.value ?? null;

  let backgroundCss = safeBase.bg;
  if (bgType === 'color' && bgValue) backgroundCss = bgValue;
  if (bgType === 'gradient' && bgValue) backgroundCss = bgValue;
  if (bgType === 'image' && bgValue) backgroundCss = `url(${bgValue})`;

  const text = safeBase.text;

  return {
    variant,
    presetName,
    tokens: { primary, accent, background: backgroundCss, text },
  };
}

// -------------------- Curated Looks -------------------- //
const CURATED: Array<{ id: string; name: string; desc: string; theme: StorefrontTheme }>
  = [
    { id: 'clean-default', name: 'Clean / Default', desc: 'Neutral with classic blue accent', theme: { variant: 'clean', palette: { preset: 'default' } } },
    { id: 'clean-warm',    name: 'Clean / Warm',    desc: 'Soft warm surfaces, orange accent', theme: { variant: 'clean', palette: { preset: 'warm' } } },
    { id: 'minimal-light', name: 'Minimal / Light', desc: 'Ultra-light, subtle accent', theme: { variant: 'minimal', palette: { preset: 'light' } } },
    { id: 'minimal-dark',  name: 'Minimal / Dark',  desc: 'Dark canvas, quiet accents', theme: { variant: 'minimal', palette: { preset: 'dark' } } },
    { id: 'bold-ocean',    name: 'Bold / Ocean',    desc: 'Deep teal blues, neon cyan accent', theme: { variant: 'bold', palette: { preset: 'ocean' } } },
    { id: 'bold-sunset',   name: 'Bold / Sunset',   desc: 'Orange primary with magenta accent', theme: { variant: 'bold', palette: { preset: 'sunset' } } },
    { id: 'bold-forest',   name: 'Bold / Forest',   desc: 'Emerald primary, fresh mint accent', theme: { variant: 'bold', palette: { preset: 'forest' } } },
  ];

// -------------------- UI Helpers -------------------- //
function Swatch({ color, title }: { color: string; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-6 w-6 rounded border border-black/10" style={{ background: color }} />
      <span className="text-xs text-neutral-600">{title}</span>
    </div>
  );
}

function Section({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-800"><Palette className="h-4 w-4" /> {title}</div>
      {children}
    </section>
  );
}

function RadioCard({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-sm transition hover:bg-neutral-50 ${selected ? 'border-neutral-900' : 'border-black/10'}`}
    >
      {label}
    </button>
  );
}

function PresetCard({ name, active, onPick, sample }: { name: string; active: boolean; onPick: () => void; sample: { primary: string; accent: string; bg: string; text: string } }) {
  return (
    <button
      type="button"
      onClick={onPick}
      className={`w-full rounded-xl border p-3 text-left transition hover:bg-neutral-50 ${active ? 'border-neutral-900' : 'border-black/10'}`}
    >
      <div className="mb-2 grid grid-cols-4 gap-2">
        <div className="h-8 rounded" style={{ background: sample.bg }} />
        <div className="h-8 rounded" style={{ background: sample.primary }} />
        <div className="h-8 rounded" style={{ background: sample.accent }} />
        <div className="h-8 rounded" style={{ background: sample.text }} />
      </div>
      <div className="text-sm font-medium">{name}</div>
    </button>
  );
}

function AdvancedRow({ label, children }: React.PropsWithChildren<{ label: string }>) {
  return (
    <label className="block text-sm">
      <span className="text-neutral-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

// -------------------- Main Theme Tab -------------------- //
export default function ThemeTab({
  value,
  onChange,
  categoryPageView,                 // ← NEW (optional)
  onSetCategoryPageView,            // ← NEW (optional)
}: {
  value?: StorefrontTheme;
  onChange: (t: StorefrontTheme) => void;
  categoryPageView?: GridMode;
  onSetCategoryPageView?: (v: GridMode | undefined) => void;
}) {
  const [openAdvanced, setOpenAdvanced] = useState(false);
  const [theme, setTheme] = useState<StorefrontTheme>(value ?? { variant: 'clean', palette: { preset: 'default' } });

  useEffect(() => { setTheme(value ?? { variant: 'clean', palette: { preset: 'default' } }); }, [value]);

  const resolved = useMemo(() => resolveTheme(theme), [theme]);

  function update(next: Partial<StorefrontTheme>) {
    const merged: StorefrontTheme = {
      variant: next.variant ?? theme.variant,
      palette: { preset: theme.palette?.preset ?? null, primary: theme.palette?.primary ?? null, accent: theme.palette?.accent ?? null, ...(next.palette ?? {}) },
      background: { type: theme.background?.type ?? 'none', value: theme.background?.value ?? null, ...(next.background ?? {}) },
    };
    setTheme(merged);
    onChange(merged);
  }

  // Variant list
  const variants: Array<'clean'|'bold'|'minimal'> = ['clean', 'bold', 'minimal'];

  // Presets for current variant
  const presetMap = theme.variant === 'clean' ? CLEAN_PRESETS : theme.variant === 'minimal' ? MINIMAL_PRESETS : BOLD_PRESETS;
  const presetNames = Object.keys(presetMap);
  const activePreset = theme.palette?.preset ?? presetNames[0];

  function resetOverrides() {
    update({ palette: { preset: activePreset, primary: null, accent: null }, background: { type: 'none', value: null } });
  }

  function applyCurated(c: StorefrontTheme) {
    update({ variant: c.variant, palette: { preset: c.palette?.preset ?? null, primary: c.palette?.primary ?? null, accent: c.palette?.accent ?? null }, background: c.background });
  }

  return (
    <div className="space-y-4">
      {/* Curated Looks */}
      <Section title="Curated looks (one-click)">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CURATED.map((c) => {
            const r = resolveTheme(c.theme);
            const active = theme.variant === c.theme.variant && (theme.palette?.preset ?? '') === (c.theme.palette?.preset ?? '');
            return (
              <button key={c.id} type="button" onClick={() => applyCurated(c.theme)} className={`rounded-xl border p-3 text-left transition hover:bg-neutral-50 ${active ? 'border-neutral-900' : 'border-black/10'}`}>
                <div className="mb-2 flex items-center gap-2"><Wand2 className="h-4 w-4" /><div className="font-medium text-sm">{c.name}</div></div>
                <div className="mb-2 grid grid-cols-4 gap-2">
                  <div className="h-8 rounded" style={{ background: r.tokens.background }} />
                  <div className="h-8 rounded" style={{ background: r.tokens.primary }} />
                  <div className="h-8 rounded" style={{ background: r.tokens.accent }} />
                  <div className="h-8 rounded" style={{ background: r.tokens.text }} />
                </div>
                <div className="text-xs text-neutral-600">{c.desc}</div>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Variant */}
      <Section title="Variant">
        <div className="flex flex-wrap gap-2">
          {variants.map(v => (
            <RadioCard key={v} label={v} selected={theme.variant === v} onClick={() => update({ variant: v, palette: { preset: Object.keys(v === 'clean' ? CLEAN_PRESETS : v === 'minimal' ? MINIMAL_PRESETS : BOLD_PRESETS)[0], primary: null, accent: null } })} />
          ))}
        </div>
      </Section>

      {/* Preset */}
      <Section title="Palette preset">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {presetNames.map((p) => (
            <PresetCard key={p} name={p} active={activePreset === p} sample={presetMap[p]} onPick={() => update({ palette: { preset: p, primary: null, accent: null } })} />
          ))}
        </div>
      </Section>

      {/* Advanced */}
      <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <button
          type="button"
          onClick={() => setOpenAdvanced(s => !s)}
          className="mb-3 flex w-full items-center justify-between text-sm font-medium text-neutral-800"
        >
          <span>Advanced (optional overrides)</span>
          {openAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {openAdvanced && (
          <div className="grid gap-3 sm:grid-cols-2">
            {/* NEW: Category page product view override (global) */}
            {typeof onSetCategoryPageView === "function" && (
              <AdvancedRow label="Category Page Product View (override)">
                <select
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
                  value={categoryPageView ?? ""}
                  onChange={(e) => {
                    const v = e.target.value as GridMode | "";
                    onSetCategoryPageView(v ? (v as GridMode) : undefined);
                  }}
                >
                  <option value="">Default (theme)</option>
                  <option value="grid">Grid</option>
                  <option value="grid_1">Grid 1</option>
                  <option value="grid_2">Grid 2</option>
                  <option value="grid_3">Grid 3</option>
                  <option value="list">List</option>
                  <option value="links">Links</option>
                </select>
                <p className="mt-1 text-xs text-neutral-500">
                  Controls how products render on category pages (<code>/slug/c/[cat]</code>). Does not affect Product blocks on the landing page.
                </p>
              </AdvancedRow>
            )}

            <AdvancedRow label="Primary color (hex)">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={clampHex(theme.palette?.primary) ?? '#000000'}
                  onChange={(e) => update({ palette: { primary: e.target.value } })}
                  className="h-9 w-9 rounded border border-black/10"
                />
                <input
                  type="text"
                  placeholder="#000000"
                  value={theme.palette?.primary ?? ''}
                  onChange={(e) => update({ palette: { primary: e.target.value || null } })}
                  className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm"
                />
              </div>
            </AdvancedRow>

            <AdvancedRow label="Accent color (hex)">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={clampHex(theme.palette?.accent) ?? '#000000'}
                  onChange={(e) => update({ palette: { accent: e.target.value } })}
                  className="h-9 w-9 rounded border border-black/10"
                />
                <input
                  type="text"
                  placeholder="#000000"
                  value={theme.palette?.accent ?? ''}
                  onChange={(e) => update({ palette: { accent: e.target.value || null } })}
                  className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm"
                />
              </div>
            </AdvancedRow>

            <AdvancedRow label="Background type">
              <select
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
                value={theme.background?.type ?? 'none'}
                onChange={(e) => update({ background: { type: e.target.value as any } })}
              >
                <option value="none">None (use preset)</option>
                <option value="color">Color</option>
                <option value="gradient">Gradient CSS</option>
                <option value="image">Image URL</option>
              </select>
            </AdvancedRow>

            <AdvancedRow label="Background value">
              <input
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
                placeholder="#F8FAFC  |  linear-gradient(...)  |  https://...jpg"
                value={theme.background?.value ?? ''}
                onChange={(e) => update({ background: { value: e.target.value || null } })}
              />
            </AdvancedRow>

            <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
              <button type="button" onClick={resetOverrides} className="rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-neutral-50">Reset overrides</button>
              <span className="text-xs text-neutral-500">Final theme = Variant → Preset → (optional) Overrides</span>
            </div>
          </div>
        )}
      </section>
      
      {/* Live Preview */}
      <Section title="Effective theme preview">
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          {/* Mini hero preview */}
          <div className="rounded-xl ring-1 ring-black/5 overflow-hidden" style={{ background: resolved.tokens.background }}>
            <div className="p-6">
              <div className="text-xs uppercase tracking-widest opacity-80" style={{ color: resolved.tokens.text }}>/{resolved.variant} · {resolved.presetName}</div>
              <h3 className="mt-2 text-2xl font-bold" style={{ color: resolved.tokens.text }}>Your Store</h3>
              <p className="mt-1 text-sm opacity-90" style={{ color: resolved.tokens.text }}>A quick preview of surface and text on your background.</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium" style={{ background: resolved.tokens.primary, color: '#FFFFFF' }}>Primary CTA</div>
              <div className="mt-2 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium" style={{ background: resolved.tokens.accent, color: '#0B0F19' }}>Accent CTA</div>
            </div>
          </div>

          {/* Token swatches */}
          <div className="rounded-xl border border-black/10 p-3">
            <div className="mb-2 text-sm font-medium">Tokens</div>
            <div className="grid grid-cols-2 gap-2">
              <Swatch color={resolved.tokens.background} title="background" />
              <Swatch color={resolved.tokens.text}       title="text" />
              <Swatch color={resolved.tokens.primary}    title="primary" />
              <Swatch color={resolved.tokens.accent}     title="accent" />
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
