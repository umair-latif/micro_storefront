"use client";

import { type PropsWithChildren, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, Trash2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase-client";

type SocialsConfig = {
  instagram?: string | null;
  tiktok?: string | null;
  x?: string | null;
  facebook?: string | null;
  etsy?: string | null;
  amazon?: string | null;
  youtube?: string | null;
  whatsapp?: string | null;
};

type Profile = {
  id: string;
  slug: string;
  display_name: string | null;
  bio: string | null;
  ig_handle: string | null;
  tt_handle: string | null;
  wa_e164: string | null;
  profile_img: string | null;
  header_img: string | null;
  socials_config: SocialsConfig | null;
  owner_uid?: string | null;
};

function normalizeSocials(data: any): SocialsConfig {
  return {
    instagram: data?.socials_config?.instagram ?? (data?.ig_handle ? `https://instagram.com/${data.ig_handle.replace(/^@/, "")}` : null),
    tiktok: data?.socials_config?.tiktok ?? (data?.tt_handle ? `https://tiktok.com/@${data.tt_handle.replace(/^@/, "")}` : null),
    x: data?.socials_config?.x ?? null,
    facebook: data?.socials_config?.facebook ?? null,
    etsy: data?.socials_config?.etsy ?? null,
    amazon: data?.socials_config?.amazon ?? null,
    youtube: data?.socials_config?.youtube ?? null,
    whatsapp: data?.socials_config?.whatsapp ?? data?.wa_e164 ?? null,
  };
}

export default function ProfilePage() {
  const supabase = createClient();
  const search = useSearchParams();
  const store = (search.get("store") ?? "").trim() || null;

  const [loading, setLoading] = useState(true);
  const [saving, startSaving] = useTransition();
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [notOwner, setNotOwner] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);
  const [deletingCover, setDeletingCover] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setUserId(data.user?.id ?? null);
    });
    return () => {
      mounted = false;
    };
  }, [supabase]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!store) {
        setProfile(null);
        setLoading(false);
        setNotOwner(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, slug, display_name, bio, ig_handle, tt_handle, wa_e164, profile_img, header_img, socials_config, owner_uid")
        .or(`id.eq.${store},slug.eq.${store}`)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.error("profiles fetch error:", error);
        setErr(error.message ?? "Failed to load profile.");
        setProfile(null);
        setNotOwner(false);
      } else if (!data) {
        setErr(null);
        setProfile(null);
        setNotOwner(false);
      } else if (userId && data.owner_uid && data.owner_uid !== userId) {
        setProfile(null);
        setNotOwner(true);
        setErr(null);
      } else {
        setProfile({ ...(data as Profile), socials_config: normalizeSocials(data) });
        setNotOwner(false);
        setErr(null);
      }

      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [store, supabase, userId]);

  const title = useMemo(() => (profile?.display_name || profile?.slug ? `/${profile?.slug}` : ""), [profile]);

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    if (!profile) return;
    setProfile({ ...profile, [key]: value });
  }

  function updateSocial(key: keyof SocialsConfig, value: string) {
    if (!profile) return;
    setProfile({
      ...profile,
      wa_e164: key === "whatsapp" ? value || null : profile.wa_e164,
      socials_config: { ...(profile.socials_config ?? {}), [key]: value || null },
    });
  }

  function normalizeHandleFromUrl(url: string | null, kind: "instagram" | "tiktok"): string | null {
    if (!url) return null;
    try {
      const u = new URL(url);
      if (kind === "instagram") return u.pathname.replace(/^\/+/, "") || null;
      if (kind === "tiktok") return u.pathname.replace(/^\/+@?/, "") || null;
      return null;
    } catch {
      return url.replace(/^@/, "") || null;
    }
  }

  function save() {
    if (!profile || !userId) return;
    startSaving(async () => {
      setErr(null);
      const socials = profile.socials_config ?? {};
      const igHandle = normalizeHandleFromUrl(socials.instagram ?? null, "instagram");
      const ttHandle = normalizeHandleFromUrl(socials.tiktok ?? null, "tiktok");

      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: profile.display_name,
          bio: profile.bio,
          ig_handle: igHandle ?? profile.ig_handle ?? null,
          tt_handle: ttHandle ?? profile.tt_handle ?? null,
          wa_e164: socials.whatsapp ?? profile.wa_e164,
          profile_img: profile.profile_img,
          header_img: profile.header_img,
          socials_config: socials,
        })
        .eq("id", profile.id)
        .eq("owner_uid", userId);

      if (error) {
        console.error("profile update error:", error);
        setErr(error.message ?? "Failed to save profile.");
        setSaved(false);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 1200);
      }
    });
  }

  async function uploadToBucket(kind: "avatar" | "cover", file: File) {
    if (!profile || !userId) return;
    const setUploading = kind === "avatar" ? setUploadingAvatar : setUploadingCover;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const name = kind === "avatar" ? "avatar" : "cover";
      const path = `${profile.id}/${name}-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("profile-images")
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("profile-images").getPublicUrl(path);
      const publicUrl = pub?.publicUrl;
      if (!publicUrl) throw new Error("No public URL for uploaded file.");

      const patch = kind === "avatar" ? { profile_img: publicUrl } : { header_img: publicUrl };
      const { data, error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", profile.id)
        .eq("owner_uid", userId)
        .select("id, slug, display_name, bio, ig_handle, tt_handle, wa_e164, profile_img, header_img, socials_config, owner_uid")
        .single();

      if (error) throw error;
      setProfile({ ...(data as Profile), socials_config: normalizeSocials(data) });
    } catch (e: any) {
      console.error("upload error:", e);
      setErr(e?.message ?? "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function deleteImage(kind: "avatar" | "cover") {
    if (!profile || !userId) return;
    const url = kind === "avatar" ? profile.profile_img : profile.header_img;
    if (!url) return;

    const setDeleting = kind === "avatar" ? setDeletingAvatar : setDeletingCover;
    setDeleting(true);
    try {
      const marker = "/object/public/profile-images/";
      const idx = url.indexOf(marker);
      if (idx !== -1) {
        const objPath = url.substring(idx + marker.length);
        await supabase.storage.from("profile-images").remove([objPath]);
      }

      const patch = kind === "avatar" ? { profile_img: null } : { header_img: null };
      const { data, error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", profile.id)
        .eq("owner_uid", userId)
        .select("id, slug, display_name, bio, ig_handle, tt_handle, wa_e164, profile_img, header_img, socials_config, owner_uid")
        .single();

      if (error) throw error;
      setProfile({ ...(data as Profile), socials_config: normalizeSocials(data) });
    } catch (e: any) {
      console.error("delete image error:", e);
      setErr(e?.message ?? "Delete failed.");
    } finally {
      setDeleting(false);
    }
  }

  if (!store) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Store Profile</h1>
        <p className="text-sm text-neutral-600">Select a store from the top bar to edit its profile.</p>
      </div>
    );
  }

  if (loading || userId === null) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Store Profile</h1>
        <p className="text-sm text-neutral-600">Loading...</p>
      </div>
    );
  }

  if (notOwner) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Store Profile</h1>
        <p className="text-sm text-red-600">You do not have permission to edit this store.</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Store Profile</h1>
        <p className="text-sm text-red-600">Store &quot;{store}&quot; not found or you do not have access.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Store Profile</h1>
        <p className="text-sm text-neutral-600">{title}</p>
      </div>

      {err ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {err}
        </div>
      ) : null}

      <Section title="Store images" description="Used by the storefront hero, header, and identity bar.">
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
          <div className="relative h-40 w-full bg-neutral-100 sm:h-56">
            {profile.header_img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.header_img} alt="Header" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-neutral-400">No cover image</div>
            )}
            <div className="absolute bottom-3 right-3 z-30 flex flex-wrap gap-2">
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0];
                  if (file) void uploadToBucket("cover", file);
                  e.currentTarget.value = "";
                }}
              />
              <IconButton label="Upload cover" busy={uploadingCover} icon="upload" onClick={() => coverInputRef.current?.click()} />
              <IconButton label="Delete cover" busy={deletingCover} icon="delete" disabled={!profile.header_img} onClick={() => void deleteImage("cover")} />
            </div>
          </div>

          <div className="relative -mt-10 px-4 pb-4 sm:-mt-14 sm:px-6">
            <div className="flex items-end gap-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-2 ring-white sm:h-24 sm:w-24">
                {profile.profile_img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.profile_img} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-neutral-100 text-xs text-neutral-400">
                    No avatar
                  </div>
                )}
              </div>
              <div className="z-20 mb-1 flex flex-wrap gap-2">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.currentTarget.files?.[0];
                    if (file) void uploadToBucket("avatar", file);
                    e.currentTarget.value = "";
                  }}
                />
                <IconButton label="Upload avatar" busy={uploadingAvatar} icon="upload" onClick={() => avatarInputRef.current?.click()} />
                <IconButton label="Delete avatar" busy={deletingAvatar} icon="delete" disabled={!profile.profile_img} onClick={() => void deleteImage("avatar")} />
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Store identity" description="Used wherever the storefront introduces the shop.">
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput label="Display name" value={profile.display_name ?? ""} onChange={(v) => update("display_name", v)} />
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium">Bio</span>
            <textarea
              className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
              rows={3}
              value={profile.bio ?? ""}
              onChange={(e) => update("bio", e.target.value)}
            />
          </label>
        </div>
      </Section>

      <Section title="Contact & social links" description="Used for social icons, hero CTAs, and product contact buttons.">
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput label="WhatsApp number or link" placeholder="+491234567890" value={profile.socials_config?.whatsapp ?? profile.wa_e164 ?? ""} onChange={(v) => updateSocial("whatsapp", v)} />
          <TextInput label="Instagram URL or @handle" value={profile.socials_config?.instagram ?? ""} onChange={(v) => updateSocial("instagram", v)} />
          <TextInput label="TikTok URL or @handle" value={profile.socials_config?.tiktok ?? ""} onChange={(v) => updateSocial("tiktok", v)} />
          <TextInput label="X URL or @handle" value={profile.socials_config?.x ?? ""} onChange={(v) => updateSocial("x", v)} />
          <TextInput label="Facebook URL" value={profile.socials_config?.facebook ?? ""} onChange={(v) => updateSocial("facebook", v)} />
          <TextInput label="Etsy shop URL" value={profile.socials_config?.etsy ?? ""} onChange={(v) => updateSocial("etsy", v)} />
          <TextInput label="Amazon storefront URL" value={profile.socials_config?.amazon ?? ""} onChange={(v) => updateSocial("amazon", v)} />
          <TextInput label="YouTube URL" value={profile.socials_config?.youtube ?? ""} onChange={(v) => updateSocial("youtube", v)} />
        </div>
      </Section>

      <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={save}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save changes
          </button>
          {saved ? (
            <span className="inline-flex items-center gap-1 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4" /> Saved
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: PropsWithChildren<{
  title: string;
  description?: string;
}>) {
  return (
    <section className="space-y-4 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div>
        <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
        {description ? <p className="mt-1 text-xs text-neutral-500">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function IconButton({
  label,
  busy,
  icon,
  disabled,
  onClick,
}: {
  label: string;
  busy: boolean;
  icon: "upload" | "delete";
  disabled?: boolean;
  onClick: () => void;
}) {
  const Icon = icon === "upload" ? Upload : Trash2;
  return (
    <button
      onClick={onClick}
      disabled={disabled || busy}
      title={label}
      className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white/90 px-3 py-1.5 text-xs backdrop-blur hover:bg-white disabled:opacity-60"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
    </button>
  );
}
