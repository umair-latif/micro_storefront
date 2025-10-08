"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { AlertTriangle, Loader2, Plus } from "lucide-react";
import CategoryForm, { type CategoryRow } from "./CategoryForm";

type Category = {
  id: string;
  name: string;
  cover_img: string | null;
  position: number | null;
};

export default function CategoriesManager({ profileId }: { profileId: string }) {
  const supabase = createClient();
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [reloading, setReloading] = useState(false); // small spinner when refreshing after create

  async function load() {
    setLoading(true);
    setErrorMsg(null);

    const { data, error } = await supabase
      .from("categories")
      .select("id, name, cover_img, position")
      .eq("profile_id", profileId)
      .order("position", { ascending: true });

    if (error) {
      console.error("Load categories error:", error);
      setErrorMsg(error.message ?? "Failed to load categories.");
      setItems([]);
    } else {
      setItems((data ?? []) as Category[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!profileId) {
      setItems([]);
      setLoading(false);
      setErrorMsg("No store selected.");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  return (
    <div className="space-y-4 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <AlertTriangle className="h-4 w-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-600">Manage your categories</div>
        <button
          onClick={() => setShowCreate((s) => !s)}
          className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm hover:bg-neutral-50"
        >
          <Plus className="h-4 w-4" />
          New category
        </button>
      </div>

      {showCreate && (
        <CategoryForm
          mode="create"
          profileId={profileId}
          onCreated={(c) => {
            // add to top optimistically
            setItems((prev) => [{ ...(c as Category) }, ...prev]);
            setShowCreate(false);
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="text-sm text-neutral-600">No categories yet.</div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <li key={c.id}>
              <CategoryForm
                mode="edit"
                profileId={profileId}
                category={c}
                onUpdated={(next) => {
                  setItems((prev) => prev.map((x) => (x.id === next.id ? (next as any) : x)));
                }}
                onDeleted={(id) => {
                  setItems((prev) => prev.filter((x) => x.id !== id));
                }}
              />
            </li>
          ))}
        </ul>
      )}

      {reloading ? (
        <div className="flex items-center gap-2 pt-1 text-xs text-neutral-500">
          <Loader2 className="h-3 w-3 animate-spin" /> Refreshing…
        </div>
      ) : null}
    </div>
  );
}
