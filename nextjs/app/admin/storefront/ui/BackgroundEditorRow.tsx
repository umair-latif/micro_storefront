"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { Loader2, Upload, Trash2 } from "lucide-react";

type BgType = "none" | "color" | "image" | "gradient";

export default function BackgroundEditorRow({
  theme,
  update,
  profileId = "storefront",
}: {
  theme: any;
  update: (partial: any) => void;
  profileId?: string;
}) {
  const supabase = createClient();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [deletingBg, setDeletingBg] = useState(false);

  const currentValue = theme?.background?.value ?? "";
  const currentType: BgType = theme?.background?.type ?? "color";

  const isImage = currentType === "image" && currentValue && /^https?:\/\//i.test(currentValue);

  async function handleUpload(file: File) {
    setUploadingBg(true);
    try {
      // build path, like you do in profile form
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${profileId}/bg-${Date.now()}.${ext}`;

      // upload to Supabase storage
      const { error: upErr } = await supabase.storage
        .from("profile-images") // <-- make sure this bucket exists and is public
        .upload(path, file, {
          upsert: true,
          cacheControl: "3600",
        });

      if (upErr) {
        console.error("background upload error:", upErr);
        alert("Upload failed.");
        return;
      }

      // get public URL
      const { data: pub } = supabase.storage
        .from("profile-images")
        .getPublicUrl(path);

      const publicUrl = pub?.publicUrl;
      if (!publicUrl) {
        alert("No public URL from Supabase.");
        return;
      }

      // update theme: mark as image
      update({
        background: {
          type: "image",
          value: publicUrl,
        },
      });
    } catch (err) {
      console.error("bg upload failed:", err);
      alert("Upload failed.");
    } finally {
      setUploadingBg(false);
    }
  }

  // attempt to remove both from theme state AND optionally from bucket
  async function handleRemove() {
    // 1) optimistic update theme first
    setDeletingBg(true);

    try {
      // best-effort: derive object path from public URL
      // profile form used:
      //   const marker = "/object/public/profile-images/";
      // we do the same pattern with our bucket
      const marker = "/object/public/background-images/";
      const idx = currentValue.indexOf(marker);

      if (idx !== -1) {
        const objPath = currentValue.substring(idx + marker.length);
        // try to remove from storage
        const { error: delErr } = await supabase.storage
          .from("profile-images")
          .remove([objPath]);
        if (delErr) {
          // we won't block UI on this
          console.warn("Could not delete background from storage:", delErr);
        }
      }

      // clear theme background in UI
      update({
        background: {
          type: "color",
          value: "", // or null to fall back to default
        },
      });
    } catch (err) {
      console.error("bg remove failed:", err);
      alert("Remove failed.");
    } finally {
      setDeletingBg(false);
    }
  }

  function handleManualChange(val: string) {
    const trimmed = val.trim();

    // guess type from what user typed
    const looksLikeUrl = /^https?:\/\//i.test(trimmed);
    const looksLikeGrad = /^((repeating-)?linear-gradient|radial-gradient)\(/i.test(trimmed);
    const looksLikeHex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed);

    let nextType: BgType = "color";

    if (!trimmed) {
      nextType = "none";
    } else if (looksLikeUrl) {
      nextType = "image";
    } else if (looksLikeGrad) {
      nextType = "gradient";
    } else if (looksLikeHex) {
      nextType = "color";
    } else {
      // fallback: user typed something weird (keep previous type or assume color)
      nextType = currentType ?? "color";
    }

    update({
      background: {
        type: nextType,
        value: trimmed || null,
      },
    });
  }

  return (
    <div className="space-y-2">
      {/* Row label + preview + delete */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-medium">Background</div>

        {isImage ? (
          <div className="flex items-center gap-2">
            {/* preview */}
            <div className="relative h-8 w-12 overflow-hidden rounded border border-black/10 bg-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentValue}
                alt="bg preview"
                className="h-full w-full object-cover"
              />
            </div>

            {/* remove */}
            <button
              type="button"
              onClick={handleRemove}
              disabled={deletingBg}
              className="inline-flex items-center gap-1 rounded-md border border-black/10 bg-white px-2 py-1 text-xs hover:bg-neutral-50 disabled:opacity-60"
              title="Remove background image"
            >
              {deletingBg ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
              <span>Remove</span>
            </button>
          </div>
        ) : null}
      </div>

      {/* Input + upload */}
      <div className="flex items-center gap-2">
        {/* manual input */}
        <input
          className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm"
          placeholder="#F8FAFC  |  linear-gradient(...)  |  https://...jpg"
          value={currentValue}
          onChange={(e) => handleManualChange(e.target.value)}
        />

        {/* hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.currentTarget.files?.[0];
            if (file) {
              handleUpload(file);
            }
            e.currentTarget.value = "";
          }}
        />

        {/* Upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingBg}
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-medium shadow-sm hover:bg-neutral-50 disabled:opacity-60"
          title="Upload background image"
        >
          {uploadingBg ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploadingBg ? "Uploading…" : "Upload"}
        </button>
      </div>

      <p className="text-xs text-neutral-500 leading-relaxed">
        Paste a color (#fff), a CSS gradient, or upload an image.
        Uploading stores the image in <code>profile-images</code> and sets
        background.type = "image".
      </p>
    </div>
  );
}
