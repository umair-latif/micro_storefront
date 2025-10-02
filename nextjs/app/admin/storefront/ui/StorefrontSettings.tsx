// app/admin/storefront/ui/StorefrontSettings.tsx
"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { StorefrontConfig, StorefrontDisplayMode } from "@/lib/types";
import { DEFAULT_STOREFRONT_CONFIG } from "@/lib/defaults";
import { createClient } from "@/lib/supabase-client";
import { CheckCircle2, Loader2 } from "lucide-react";

function Section({ title, children, description }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="text-sm text-neutral-600">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function StorefrontSettings({
  profileId,
  slug,
  initialConfig,
}: {
  profileId: string;
  slug: string;
  initialConfig: StorefrontConfig;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [saving, startSaving] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [config, setConfig] = useState<StorefrontConfig>(initialConfig ?? DEFAULT_STOREFRONT_CONFIG);

  useEffect(() => {
    setConfig(initialConfig ?? DEFAULT_STOREFRONT_CONFIG);
  }, [initialConfig]);

  async function save(next: StorefrontConfig) {
    startSaving(async () => {
      setConfig(next);
      const { error } = await supabase
        .from("profiles")
        .update({ storefront_config: next })
        .eq("id", profileId);
      if (!error) setSavedAt(Date.now());
    });
  }

  function onChange<K extends keyof StorefrontConfig>(key: K, value: StorefrontConfig[K]) {
    const next = { ...config, [key]: value } as StorefrontConfig;
    void save(next);
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Controls */}
      <div className="space-y-4">
        <Section title="View Mode" description="Choose how products render on your public page">
          <div className="grid grid-cols-3 gap-2">
            {(["grid", "links", "list"] as StorefrontDisplayMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => onChange("display_mode", mode)}
                className={`rounded-xl border px-3 py-2 text-sm capitalize ${
                  config.display_mode === mode ? "border-neutral-900 bg-neutral-900 text-white" : "border-black/10 bg-white hover:bg-neutral-50"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Categories" description="Show categories as scrollable chips below the header">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={config.show_categories}
              onChange={(e) => onChange("show_categories", e.currentTarget.checked)}
              className="h-4 w-4 rounded border-black/20"
            />
            Show categories
          </label>
        </Section>

        <Section title="Sorting" description="How products are ordered by default">
          <select
            value={config.sort}
            onChange={(e) => onChange("sort", e.currentTarget.value as any)}
            className="w-full rounded-xl border border-black/10 bg-white p-2 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
            <option value="manual">Manual</option>
          </select>
        </Section>

        <Section title="CTAs" description="Choose which CTAs are visible by default">
          <div className="grid grid-cols-2 gap-2">
            {(["instagram", "whatsapp", "custom1", "custom2"] as const).map((key) => (
              <label key={key} className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!config.cta_visibility?.[key]}
                  onChange={(e) => {
                    const next = {
                      ...config,
                      cta_visibility: { ...config.cta_visibility, [key]: e.currentTarget.checked },
                    };
                    void save(next);
                  }}
                  className="h-4 w-4 rounded border-black/20"
                />
                {key}
              </label>
            ))}
          </div>
        </Section>

        <div className="flex items-center gap-2 text-sm text-neutral-600">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : savedAt ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Saved just now
            </>
          ) : (
            <span>Changes autosave</span>
          )}
        </div>
      </div>

      {/* Live Preview */}
      <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="mb-3">
          <div className="text-sm font-medium">Live Preview</div>
          <div className="text-xs text-neutral-600">/{slug}</div>
        </div>
        {/* Skeleton preview that mirrors public UI at a high level (no backend changes) */}
        {config.display_mode === "grid" && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-neutral-100" />
            ))}
          </div>
        )}
        {config.display_mode === "links" && (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm shadow-sm">Example link {i + 1}</div>
            ))}
          </div>
        )}
        {config.display_mode === "list" && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-3 rounded-xl border border-black/10 bg-white p-3 shadow-sm">
                <div className="h-20 w-20 rounded-lg bg-neutral-100" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-1/2 rounded bg-neutral-100" />
                  <div className="h-3 w-1/3 rounded bg-neutral-100" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-8 w-20 rounded-lg bg-neutral-100" />
                    <div className="h-8 w-24 rounded-lg bg-neutral-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
