"use client";

import { useMemo, useState, useTransition, useRef, useEffect } from "react";
import ThemeTab from "./ThemeTab";
import type { StorefrontTheme, GridMode } from "@/lib/types";
import { updateThemeAction, updateLandingOverridesAction } from "../actions"; // ← add this action
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";

function useDebouncedCallback<T extends (...args: any[]) => void>(fn: T, ms: number) {
  const ref = useRef<number | null>(null);
  return (...args: Parameters<T>) => {
    if (ref.current) window.clearTimeout(ref.current);
    ref.current = window.setTimeout(() => fn(...args), ms);
  };
}

export default function ThemeEditor({
  profileId,
  initialTheme,
  initialCategoryPageView, // ← NEW (optional)
}: {
  profileId: string;
  initialTheme?: StorefrontTheme;
  initialCategoryPageView?: GridMode;
}) {
  const [theme, setTheme] = useState<StorefrontTheme>(
    initialTheme ?? { variant: "clean", palette: { preset: "default" } }
  );
  const [categoryPageView, setCategoryPageView] = useState<GridMode | undefined>(
    initialCategoryPageView
  );

  const [saving, startSaving] = useTransition();
  const [savedTick, setSavedTick] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // --- debounced persists ---
  const persistTheme = useDebouncedCallback((next: StorefrontTheme) => {
    startSaving(async () => {
      setError(null);
      const res = await updateThemeAction(profileId, next);
      if (!res?.ok) {
        setError('error' in res ? res.error : "Failed to save theme.");
        return;
      }

      setSavedTick(Date.now());
    });
  }, 350);

  const persistOverrides = useDebouncedCallback((nextView: GridMode | undefined) => {
    startSaving(async () => {
      setError(null);
      // shape: { landing_overrides: { category_page_view?: GridMode } }
      const res = await updateLandingOverridesAction(profileId, {
        category_page_view: nextView,
      });
      if (!res?.ok) {
        setError('error' in res ? res.error : "Failed to save landing overrides.");
        return;
      }
      setSavedTick(Date.now());
    });
  }, 350);

  function onChange(next: StorefrontTheme) {
    setTheme(next);       // optimistic
    persistTheme(next);   // debounced server write
  }

  function onSetCategoryPageView(next?: GridMode) {
    setCategoryPageView(next); // optimistic
    persistOverrides(next);    // debounced server write
  }

  // small UX flash “Saved”
  useEffect(() => {
    if (!savedTick) return;
    const t = setTimeout(() => setSavedTick(0), 1000);
    return () => clearTimeout(t);
  }, [savedTick]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-neutral-800">Theme</h2>
        <div className="h-5 inline-flex items-center gap-2 text-xs">
          {saving && (
            <span className="inline-flex items-center gap-1 text-neutral-600">
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </span>
          )}
          {!saving && savedTick > 0 && (
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" /> Saved
            </span>
          )}
          {error && (
            <span className="inline-flex items-center gap-1 text-amber-700">
              <TriangleAlert className="h-4 w-4" /> {error}
            </span>
          )}
        </div>
      </div>

      <ThemeTab
        value={theme}
        onChange={onChange}
        // ▼ Advanced: Category Page Product View (global override)
        categoryPageView={categoryPageView}
        onSetCategoryPageView={onSetCategoryPageView}
      />
    </div>
  );
}
