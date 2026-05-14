"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Trash2, Upload, X } from "lucide-react";
import MarkdownEditor from "@/components/site/MarkdownEditor";
import { createClient } from "@/lib/supabase-client";

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
  visible?: boolean | null;
};

type Category = { id: string; name: string };

export default function ProductEditorModal({
  product,
  onClose,
  onSaved,
}: {
  product: Product;
  onClose: () => void;
  onSaved: (p: Product) => void;
}) {
  const supabase = createClient();
  const [form, setForm] = useState<Product>(product);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingImg, setDeletingImg] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setForm(product), [product]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .eq("profile_id", product.profile_id)
        .order("name", { ascending: true });
      if (!error) setCategories((data ?? []) as Category[]);
    })();
  }, [product.profile_id, supabase]);

  function update<K extends keyof Product>(key: K, value: Product[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    setSaving(true);
    const patch = {
      title: form.title,
      price: form.price ?? null,
      caption: form.caption ?? null,
      instagram_permalink: form.instagram_permalink ?? null,
      thumb_url: form.thumb_url ?? null,
      cta_label: form.cta_label ?? null,
      cta_url: form.cta_url ?? null,
      category_id: form.category_id ?? null,
      visible: form.visible ?? true,
    };
    const { data, error } = await supabase
      .from("products")
      .update(patch)
      .eq("id", form.id)
      .select("id, profile_id, title, price, caption, thumb_url, instagram_permalink, cta_label, cta_url, category_id, visible")
      .single();

    setSaving(false);
    if (!error && data) {
      onSaved(data as Product);
    } else {
      console.error("Save product error:", error);
    }
  }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filename = `${form.profile_id}/${form.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("product-images").upload(filename, file, {
        upsert: true,
        cacheControl: "3600",
      });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(filename);
      if (!pub?.publicUrl) throw new Error("No public URL returned from storage.");

      const { data, error } = await supabase
        .from("products")
        .update({ thumb_url: pub.publicUrl })
        .eq("id", form.id)
        .select("id, profile_id, title, price, caption, thumb_url, instagram_permalink, cta_label, cta_url, category_id, visible")
        .single();

      if (error) throw error;
      if (data) setForm(data as Product);
    } catch (e) {
      console.error("Upload error:", e);
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteImage() {
    if (!form.thumb_url) return;
    setDeletingImg(true);
    try {
      const url = form.thumb_url;
      const marker = "/object/public/product-images/";
      const idx = url.indexOf(marker);
      if (idx !== -1) {
        const path = url.substring(idx + marker.length);
        await supabase.storage.from("product-images").remove([path]);
      }
      const { data, error } = await supabase
        .from("products")
        .update({ thumb_url: null })
        .eq("id", form.id)
        .select("id, profile_id, title, price, caption, thumb_url, instagram_permalink, cta_label, cta_url, category_id, visible")
        .single();
      if (error) throw error;
      if (data) setForm(data as Product);
    } catch (e) {
      console.error("Delete image error:", e);
    } finally {
      setDeletingImg(false);
    }
  }

  const canSave = useMemo(() => !!(form.title && form.title.trim()), [form.title]);

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40" onClick={onClose} />

      <div className="fixed inset-0 z-[61] flex items-start justify-center p-3 sm:p-6">
        <div
          role="dialog"
          aria-modal="true"
          className="w-full max-w-3xl rounded-2xl bg-white shadow-xl ring-1 ring-black/10"
          style={{ maxHeight: "85vh" }}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/10 bg-white/90 px-4 py-3 backdrop-blur">
            <div>
              <h3 className="text-base font-semibold">Edit product</h3>
              <p className="text-xs text-neutral-500">Details first, links last.</p>
            </div>
            <button
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-neutral-50"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="overflow-y-auto px-4 py-4" style={{ maxHeight: "calc(85vh - 104px)" }}>
            <div className="grid gap-4 lg:grid-cols-[280px,1fr]">
              <aside className="space-y-3">
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-neutral-100">
                  {form.thumb_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.thumb_url} alt={form.title || "Product"} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-neutral-400">No image</div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.currentTarget.files?.[0];
                      if (file) void handleUpload(file);
                      e.currentTarget.value = "";
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-60"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploading ? "Uploading..." : "Upload image"}
                  </button>
                  <button
                    onClick={handleDeleteImage}
                    disabled={!form.thumb_url || deletingImg}
                    className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-60"
                  >
                    {deletingImg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Delete
                  </button>
                </div>
              </aside>

              <div className="space-y-4">
                <section className="space-y-3 rounded-xl border border-black/10 p-3">
                  <div>
                    <h4 className="text-sm font-semibold">Product basics</h4>
                    <p className="text-xs text-neutral-500">Shown in product cards and on the product page.</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextInput label="Title" value={form.title ?? ""} onChange={(v) => update("title", v)} />
                    <label className="block">
                      <span className="text-sm font-medium">Price</span>
                      <input
                        type="number"
                        step="0.01"
                        className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
                        value={form.price ?? ""}
                        onChange={(e) => update("price", e.currentTarget.value ? Number(e.currentTarget.value) : null)}
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium">Collection</span>
                      <select
                        className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
                        value={form.category_id ?? ""}
                        onChange={(e) => update("category_id", e.target.value || null)}
                      >
                        <option value="">None</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="inline-flex items-center gap-2 self-end text-sm">
                      <input
                        type="checkbox"
                        checked={form.visible ?? true}
                        onChange={(e) => update("visible", e.currentTarget.checked)}
                        className="h-4 w-4 rounded border-black/20"
                      />
                      Visible
                    </label>
                  </div>
                </section>

                <section className="space-y-3 rounded-xl border border-black/10 p-3">
                  <div>
                    <h4 className="text-sm font-semibold">Product details</h4>
                    <p className="text-xs text-neutral-500">Shown above the action buttons on the product page.</p>
                  </div>
                  <MarkdownEditor
                    label="Caption"
                    value={form.caption ?? ""}
                    onChange={(md) => update("caption", md)}
                    placeholder="Materials, sizing, care notes, pickup details..."
                    rows={5}
                  />
                </section>

                <section className="space-y-3 rounded-xl border border-black/10 p-3">
                  <div>
                    <h4 className="text-sm font-semibold">Product links</h4>
                    <p className="text-xs text-neutral-500">Use one primary action, then optional supporting links.</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextInput
                      label="Primary action label"
                      value={form.cta_label ?? ""}
                      onChange={(v) => update("cta_label", v || null)}
                      placeholder="Buy on Etsy"
                    />
                    <TextInput
                      label="Primary action URL"
                      type="url"
                      value={form.cta_url ?? ""}
                      onChange={(v) => update("cta_url", v || null)}
                      placeholder="https://..."
                    />
                    <div className="sm:col-span-2">
                      <TextInput
                        label="Instagram post or reel"
                        type="url"
                        value={form.instagram_permalink ?? ""}
                        onChange={(v) => update("instagram_permalink", v || null)}
                        placeholder="https://instagram.com/p/..."
                      />
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 z-10 flex justify-end gap-2 border-t border-black/10 bg-white/90 px-4 py-3 backdrop-blur">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={!canSave || saving}
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        type={type}
        className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
