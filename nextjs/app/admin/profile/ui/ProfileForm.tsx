// app/admin/profile/ui/ProfileForm.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase-client";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { StorefrontConfig } from "@/lib/types";
import MarkdownEditor from "@/components/site/MarkdownEditor";

type Props = {
  initial: {
    id: string;
    slug: string;
    display_name: string | null;
    bio: string | null;
    ig_handle: string | null;
    tt_handle: string | null;
    wa_e164: string | null;
    is_public: boolean;
    storefront_config: StorefrontConfig;
  };
};

export default function ProfileForm({ initial }: Props) {
  const supabase = createClient();
  const [saving, startSaving] = useTransition();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(initial);

  useEffect(() => setForm(initial), [initial]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function save() {
    startSaving(async () => {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: form.display_name,
          bio: form.bio,
          ig_handle: form.ig_handle,
          tt_handle: form.tt_handle,
          wa_e164: form.wa_e164,
          is_public: form.is_public,
        })
        .eq("id", form.id);
      setSaved(!error);
      setTimeout(() => setSaved(false), 1200);
    });
  }

  return (
    <div className="space-y-4 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Display name</span>
          <input
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
            value={form.display_name ?? ""}
            onChange={(e) => update("display_name", e.target.value)}
          />
        </label>

        <label className="inline-flex items-center gap-2 text-sm mt-7">
          <input
            type="checkbox"
            checked={form.is_public}
            onChange={(e) => update("is_public", e.currentTarget.checked)}
            className="h-4 w-4 rounded border-black/20"
          />
          Public storefront
        </label>

        <div className="sm:col-span-2">
          <MarkdownEditor
            label="Bio"
            value={form.bio ?? ""}
            onChange={(md) => update("bio", md)}
            placeholder="Write your bio using markdown (bold, italic, links...)"
            rows={4}
          />
        </div>

        <label className="block">
          <span className="text-sm font-medium">Instagram handle</span>
          <input
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
            placeholder="@yourshop"
            value={form.ig_handle ?? ""}
            onChange={(e) => update("ig_handle", e.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">TikTok handle</span>
          <input
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
            value={form.tt_handle ?? ""}
            onChange={(e) => update("tt_handle", e.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">WhatsApp (E.164)</span>
          <input
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
            placeholder="+491234567890"
            value={form.wa_e164 ?? ""}
            onChange={(e) => update("wa_e164", e.target.value)}
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save changes
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
    </div>
  );
}
