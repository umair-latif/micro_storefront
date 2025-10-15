"use client";

import { useMemo, useState, useTransition, useRef, useEffect } from "react";
import ThemeTab from "./ThemeTab"; // from canvas
import type { StorefrontTheme } from "@/lib/types";
import { updateThemeAction } from "../actions";
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
}: {
  profileId: string;
  initialTheme?: StorefrontTheme;
}) {
  const [theme, setTheme] = useState<StorefrontTheme>(initialTheme ?? { variant: "clean", palette: { preset: "default" } });
  const [saving, startSaving] = useTransition();
  const [savedTick, setSavedTick] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // optimistic update + debounced persist
  const persist = useDebouncedCallback((next: StorefrontTheme) => {
    startSaving(async () => {
      setError(null);
      const res = await updateThemeAction(profileId, next);
      if (!res.ok) {
        //setError(res.error);
        return;
      }
      setSavedTick(Date.now());
    });
  }, 350);

  function onChange(next: StorefrontTheme) {
    setTheme(next);     // optimistic
    persist(next);      // debounced server write
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

      <ThemeTab value={theme} onChange={onChange} />
    </div>
  );
}
