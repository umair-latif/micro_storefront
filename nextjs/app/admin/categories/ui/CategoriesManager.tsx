"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { Loader2, Plus, Trash, AlertTriangle } from "lucide-react";

type Category = {
  id: string;
  name: string;
};

export default function CategoriesManager({ profileId }: { profileId: string }) {
  const supabase = createClient();
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErrorMsg(null);

    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .eq("profile_id", profileId);

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

  async function create() {
    const name = newName.trim();
    if (!name) return;

    setCreating(true);
    setErrorMsg(null);

    const { error } = await supabase.from("categories").insert({
      profile_id: profileId,
      name,
    });

    if (error) {
      console.error("Create category error:", error);
      setErrorMsg(error.message ?? "Failed to create category.");
    } else {
      setNewName("");
      await load();
    }
    setCreating(false);
  }

  async function remove(id: string) {
    setErrorMsg(null);
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      console.error("Delete category error:", error);
      setErrorMsg(error.message ?? "Failed to delete category.");
    } else {
      setItems((prev) => prev.filter((c) => c.id !== id));
    }
  }

  async function rename(id: string, value: string) {
    const name = value.trim();
    if (!name) return;

    setErrorMsg(null);
    const { error } = await supabase.from("categories").update({ name }).eq("id", id);
    if (error) {
      console.error("Rename category error:", error);
      setErrorMsg(error.message ?? "Failed to rename category.");
    } else {
      setItems((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <AlertTriangle className="h-4 w-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex gap-2">
        <input
          placeholder="New category name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm"
        />
        <button
          onClick={create}
          disabled={creating}
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-neutral-600">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-neutral-600">No categories yet.</div>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-xl border border-black/10 bg-white p-3"
            >
              <input
                defaultValue={c.name}
                onBlur={(e) => {
                  const v = e.currentTarget.value;
                  if (v && v !== c.name) rename(c.id, v);
                }}
                className="w-full rounded-md border border-transparent px-2 py-1 text-sm hover:border-black/10 focus:border-black/20"
              />
              <button
                onClick={() => remove(c.id)}
                className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 hover:bg-neutral-50"
                title="Delete"
              >
                <Trash className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
