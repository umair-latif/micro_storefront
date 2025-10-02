"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { ChevronDown } from "lucide-react";

interface Profile {
  id: string;
  slug: string;
  display_name: string | null;
}

export default function StoreSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const currentStore = search.get("store");
  const popRef = useRef<HTMLDivElement>(null);

  // fetch stores
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    (async () => {
      setLoading(true);
      setErrorMsg(null);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, slug, display_name")
        .order("created_at", { ascending: true });
      if (cancelled) return;
      if (error) {
        setErrorMsg("Failed to load stores");
        setProfiles([]);
      } else {
        setProfiles((data ?? []) as Profile[]);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // active profile
  const active = useMemo(() => {
    if (!currentStore) return null;
    return profiles.find((p) => p.id === currentStore || p.slug === currentStore) || null;
  }, [profiles, currentStore]);

  function applyStore(idOrSlug: string) {
    const params = new URLSearchParams(search.toString());
    params.set("store", idOrSlug);
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  // close on click outside / escape
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      if (popRef.current && !popRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const label = loading
    ? "Loading stores…"
    : active
    ? active.display_name || active.slug
    : profiles.length
    ? "Select a store"
    : errorMsg || "No stores found";

  return (
    <div className="relative inline-block text-left">
        <button
            disabled={loading}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-medium hover:bg-neutral-50"
        >
            {active ? active.display_name || active.slug : loading ? "Loading..." : "Select a store"}
            <ChevronDown className="h-4 w-4" />
        </button>

        {open && (
            <div
            className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-black/10 bg-white p-1 shadow-md z-50"
            >
            {profiles.map((p) => (
                <button
                key={p.id}
                onClick={() => {
                    applyStore(p.id);
                    setOpen(false);
                }}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-50 ${
                    active?.id === p.id ? "bg-neutral-100" : ""
                }`}
                >
                <div className="font-medium">{p.display_name || p.slug}</div>
                <div className="text-xs text-neutral-500">/{p.slug}</div>
                </button>
            ))}
            </div>
        )}
    </div>
  );
}
