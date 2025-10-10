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

  const supabase = useMemo(() => createClient(), []);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);

  const currentStore = search.get("store");

  // Load stores owned by current user
  async function loadStores() {
    setLoading(true);
    setErrorMsg(null);

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr) {
      console.error("getUser error:", userErr);
    }
    const user = userData?.user;
    if (!user) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, slug, display_name")
      .eq("owner_uid", user.id) // ✅ only this user’s stores
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Load stores error:", error);
      setErrorMsg("Failed to load stores");
      setProfiles([]);
    } else {
      setProfiles((data ?? []) as Profile[]);
    }
    setLoading(false);
  }

  // Initial + reactive auth listener
  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!mounted) return;
      if (user) loadStores();
      else setProfiles([]);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) loadStores();
      else {
        setProfiles([]);
        setOpen(false);
      }
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, [supabase]);

  // Active store
  const active = useMemo(() => {
    if (!currentStore) return null;
    return profiles.find((p) => p.id === currentStore || p.slug === currentStore) || null;
  }, [profiles, currentStore]);

  // Apply new store selection
  function applyStore(idOrSlug: string) {
    const params = new URLSearchParams(search.toString());
    params.set("store", idOrSlug);
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  // Close dropdown on outside click or escape
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
    <div className="relative inline-block text-left z-[62]" ref={popRef}>
      <button
        disabled={loading}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-medium hover:bg-neutral-50"
      >
        {label}
        <ChevronDown className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-black/10 bg-white p-1 shadow-lg z-[70]">
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => applyStore(p.id)}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-50 ${
                active?.id === p.id ? "bg-neutral-100" : ""
              }`}
            >
              <div className="font-medium">{p.display_name || p.slug}</div>
              <div className="text-xs text-neutral-500">/{p.slug}</div>
            </button>
          ))}
          {!profiles.length && !loading && (
            <div className="p-3 text-sm text-neutral-500 text-center">No stores found</div>
          )}
        </div>
      )}
    </div>
  );
}
