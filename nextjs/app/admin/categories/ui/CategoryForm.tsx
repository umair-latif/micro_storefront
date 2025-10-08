"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase-client";
import { Loader2, Upload, Trash2, Check, X } from "lucide-react";
import { removeObjectByUrl } from "@/lib/storage-cleanup";

export type CategoryRow = {
  id: string;
  name: string;
  cover_img: string | null;
  position?: number | null;
};

type Props =
  | {
      mode: "create";
      profileId: string;
      onCancel?: () => void;
      onCreated?: (c: CategoryRow) => void;
      className?: string;
    }
  | {
      mode: "edit";
      profileId: string;
      category: CategoryRow;
      onCancel?: () => void;
      onUpdated?: (c: CategoryRow) => void;
      onDeleted?: (id: string) => void;
      className?: string;
    };

export default function CategoryForm(props: Props) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState(
    props.mode === "edit" ? props.category.name : ""
  );
  const [cover, setCover] = useState<string | null>(
    props.mode === "edit" ? props.category.cover_img : null
  );

  const [busy, setBusy] = useState<"save" | "upload" | "remove" | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setErr("Please enter a category name.");
      return;
    }
    setErr(null);
    setBusy("save");

    try {
      if (props.mode === "create") {
        const { data, error } = await supabase
          .from("categories")
          .insert({
            profile_id: props.profileId,
            name: trimmed,
            cover_img: cover ?? null,
          })
          .select("id, name, cover_img, position")
          .single();
        if (error) throw error;
        props.onCreated?.(data as any);
        props.onCancel?.();
      } else {
        const { category } = props;
        const { data, error } = await supabase
          .from("categories")
          .update({ name: trimmed, cover_img: cover ?? null })
          .eq("id", category.id)
          .select("id, name, cover_img, position")
          .single();
        if (error) throw error;
        props.onUpdated?.(data as any);
      }
    } catch (e: any) {
      setErr(e?.message ?? "Save failed.");
    } finally {
      setBusy(null);
    }
  }

  async function handleUpload(file: File) {
    setBusy("upload");
    setErr(null);
    try {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const keyBase =
        props.mode === "edit"
            ? `${props.profileId}/${props.category.id}`
            : `${props.profileId}/new-${Date.now()}`;
        const key = `${keyBase}-cover.${ext}`;

        const { error: upErr } = await supabase.storage
        .from("category-images")
        .upload(key, file, {
            upsert: true,
            cacheControl: "3600",
            contentType: file.type || "image/*",
        });
        if (upErr) throw upErr;

        const { data: pub } = supabase.storage
        .from("category-images")
        .getPublicUrl(key);
        const url = pub?.publicUrl;
        if (!url) throw new Error("No public URL for uploaded file.");

        setCover(url);

        // 👇 Persist immediately if we're editing an existing category
        if (props.mode === "edit") {
        const { data, error } = await supabase
            .from("categories")
            .update({ cover_img: url })
            .eq("id", props.category.id)
            .select("id, name, cover_img, position")
            .single();
        if (error) throw error;
        props.onUpdated?.(data as any); // keep the list in sync
        }
    } catch (e: any) {
        setErr(e?.message ?? "Upload failed.");
    } finally {
        setBusy(null);
        if (fileRef.current) fileRef.current.value = "";
    }
 }

  async function handleDelete() {
  if (props.mode !== "edit") return;
  setErr(null);
  setBusy("remove");
  try {
    // best-effort: delete the cover (if any) first
    await removeObjectByUrl(props.category.cover_img);

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", props.category.id);

    if (error) throw error;
    props.onDeleted?.(props.category.id);
  } catch (e: any) {
    setErr(e?.message ?? "Delete failed.");
  } finally {
    setBusy(null);
  }
}

    async function handleRemoveCover() {
    // Best-effort: delete the storage object
    await removeObjectByUrl(cover);
    setCover(null);

    if (props.mode === "edit") {
        const { data, error } = await supabase
        .from("categories")
        .update({ cover_img: null })
        .eq("id", props.category.id)
        .select("id, name, cover_img, position")
        .single();
        if (!error) props.onUpdated?.(data as any);
    }
    }
  return (
    <div className={`rounded-2xl border border-black/10 bg-white p-3 shadow-sm ${props.className ?? ""}`}>
      <div className="mb-2 text-sm font-medium">
        {props.mode === "edit" ? "Edit category" : "New category"}
      </div>

      {err ? (
        <div className="mb-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {err}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-[1fr,180px]">
        <label className="block">
          <span className="text-sm">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
            placeholder="e.g. New Arrivals"
          />
        </label>

        <div className="block">
          <span className="text-sm">Cover image</span>
          <div className="mt-1">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-neutral-100">
              {cover ? (
                <Image src={cover} alt="Cover" fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-neutral-500">
                  No cover
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 flex gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.currentTarget.files?.[0];
                if (f) void handleUpload(f);
              }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={busy === "upload"}
              className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs hover:bg-neutral-50 disabled:opacity-60"
            >
              {busy === "upload" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {busy === "upload" ? "Uploading…" : "Upload"}
            </button>
            <button
              onClick={handleRemoveCover}
              disabled={!cover}
              className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs hover:bg-neutral-50 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={busy === "save"}
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Save
        </button>
        {props.onCancel ? (
          <button
            onClick={props.onCancel}
            className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm hover:bg-neutral-50"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        ) : null}
        {props.mode === "edit" ? (
          <button
            onClick={handleDelete}
            className="ml-auto inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        ) : null}
      </div>
    </div>
  );
}
