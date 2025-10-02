"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { Loader2, Plus, Pencil, Trash, AlertTriangle } from "lucide-react";
import ProductEditorModal from "./ProductEditorModal";

type Product = {
  id: string;
  profile_id: string;
  title: string;
  price?: number | null;
  caption?: string | null;
  thumb_url?: string | null;
  instagram_permalink?: string | null;
  cta_label?: string | null;
  cta_url?: string | null;
  category_id?: string | null;
  visible?: boolean | null; // NEW
};

export default function ProductsManager({ profileId }: { profileId: string }) {
  const supabase = createClient();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);

  async function load() {
    setLoading(true);
    setErrorMsg(null);

    const { data, error } = await supabase
      .from("products")
      .select("id, profile_id, title, price, caption, thumb_url, instagram_permalink, cta_label, cta_url, category_id, visible")
      .eq("profile_id", profileId)
      .order("id", { ascending: false });

    if (error) {
      console.error("Load products error:", error);
      setErrorMsg(error.message ?? "Failed to load products.");
      setItems([]);
    } else {
      setItems((data ?? []) as Product[]);
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

  async function createAndEdit() {
    setCreating(true);
    setErrorMsg(null);
    const { data, error } = await supabase
      .from("products")
      .insert({ profile_id: profileId, title: "Untitled", price: 0, visible: true })
      .select("id, profile_id, title, price, caption, thumb_url, instagram_permalink, cta_label, cta_url, category_id, visible")
      .single();

    if (error) {
      console.error("Create product error:", error);
      setErrorMsg(error.message ?? "Failed to create product.");
      setCreating(false);
      return;
    }
    setCreating(false);
    setEditing(data as Product);
  }

  async function remove(id: string) {
    setErrorMsg(null);
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      console.error("Delete product error:", error);
      setErrorMsg(error.message ?? "Failed to delete product.");
    } else {
      setItems((prev) => prev.filter((p) => p.id !== id));
    }
  }

  async function toggleVisible(p: Product) {
    const next = !(p.visible ?? true);
    const { error, data } = await supabase
      .from("products")
      .update({ visible: next })
      .eq("id", p.id)
      .select("id, profile_id, title, price, caption, thumb_url, instagram_permalink, cta_label, cta_url, category_id, visible")
      .single();
    if (error) {
      console.error("Toggle visible error:", error);
      setErrorMsg(error.message ?? "Failed to update product visibility.");
      return;
    }
    setItems((prev) => prev.map((it) => (it.id === p.id ? (data as Product) : it)));
  }

  function onSaved(updated: Product) {
    setItems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditing(null);
  }

  return (
    <div className="space-y-4 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <AlertTriangle className="h-4 w-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Products</h2>
        <button
          onClick={createAndEdit}
          disabled={creating}
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} New Product
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-neutral-600">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-neutral-600">No products yet.</div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <li key={p.id} className="rounded-2xl border border-black/10 bg-white p-3">
              <div className="aspect-video w-full overflow-hidden rounded-lg bg-neutral-100">
                {p.thumb_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.thumb_url} alt={p.title || "Product"} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-neutral-400">No image</div>
                )}
              </div>

              <div className="mt-2 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{p.title}</div>
                  <div className="text-xs text-neutral-600">
                    {p.price != null ? `€${Number(p.price).toFixed(2)}` : "No price"}
                  </div>
                </div>
                {/* Quick visible toggle */}
                <label className="inline-flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={p.visible ?? true}
                    onChange={() => toggleVisible(p)}
                    className="h-4 w-4 rounded border-black/20"
                  />
                  Visible
                </label>
              </div>

              <div className="mt-2 flex justify-between">
                <button
                  onClick={() => setEditing(p)}
                  className="inline-flex items-center gap-1 rounded-lg border border-black/10 px-2 py-1 text-xs hover:bg-neutral-50"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </button>
                <button
                  onClick={() => remove(p.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-black/10 px-2 py-1 text-xs hover:bg-neutral-50"
                >
                  <Trash className="h-3 w-3" /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing ? (
        <ProductEditorModal
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={onSaved}
        />
      ) : null}
    </div>
  );
}
