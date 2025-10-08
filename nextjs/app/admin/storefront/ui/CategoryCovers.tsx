"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase-client";
import { Loader2, Upload, Trash2 } from "lucide-react";

type Category = { id: string; name: string; cover_img: string | null; position: number | null };

export default function CategoryCovers({ profileId }: { profileId: string }) {
  const supabase = createClient();
  const [cats, setCats] = useState<Category[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("categories")
        .select("id, name, cover_img, position")
        .eq("profile_id", profileId)
        .order("position", { ascending: true });
      setCats((data as any) ?? []);
      setLoading(false);
    })();
  }, [profileId, supabase]);

  async function uploadCover(cat: Category, file: File) {
    setBusyId(cat.id);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const key = `${profileId}/${cat.id}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("category-images").upload(key, file, {
        upsert: true,
        cacheControl: "3600",
      });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("category-images").getPublicUrl(key);
      const url = pub?.publicUrl;
      if (!url) throw new Error("No public URL for uploaded cover");

      const { data, error } = await supabase
        .from("categories")
        .update({ cover_img: url })
        .eq("id", cat.id)
        .select("id, name, cover_img, position")
        .single();
      if (error) throw error;

      setCats((prev) => prev.map((c) => (c.id === cat.id ? (data as any) : c)));
    } catch (e) {
      console.error(e);
      // optionally toast
    } finally {
      setBusyId(null);
    }
  }

  async function clearCover(cat: Category) {
    if (!cat.cover_img) return;
    setBusyId(cat.id);
    try {
      await supabase
        .from("categories")
        .update({ cover_img: null })
        .eq("id", cat.id);
      setCats((prev) => prev.map((c) => (c.id === cat.id ? { ...c, cover_img: null } : c)));
      // (Optional) parse the object key and delete from bucket
    } catch (e) {
      console.error(e);
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <div className="text-sm text-neutral-600">Loading categories…</div>;
  if (!cats.length) return <div className="text-sm text-neutral-600">No categories yet.</div>;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cats.map((cat) => (
        <div key={cat.id} className="rounded-2xl border border-black/10 bg-white p-3 shadow-sm">
          <div className="mb-2 text-sm font-medium">{cat.name}</div>
          <div className="relative aspect-video overflow-hidden rounded-xl bg-neutral-100">
            {cat.cover_img ? (
              <Image src={cat.cover_img} alt={cat.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-neutral-500">No cover</div>
            )}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              ref={(el) => (fileRefs.current[cat.id] = el)}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.currentTarget.files?.[0];
                if (f) uploadCover(cat, f);
                e.currentTarget.value = "";
              }}
            />
            <button
              onClick={() => fileRefs.current[cat.id]?.click()}
              disabled={busyId === cat.id}
              className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs hover:bg-neutral-50 disabled:opacity-60"
            >
              {busyId === cat.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {busyId === cat.id ? "Uploading…" : "Upload cover"}
            </button>
            <button
              onClick={() => clearCover(cat)}
              disabled={busyId === cat.id || !cat.cover_img}
              className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs hover:bg-neutral-50 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
