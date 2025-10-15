"use client";

import { useTransition } from "react";
export default function StorefrontSettingsForm({
  profileId,
  current,
}: {
  profileId: string;
  current?: any; // existing storefront_config from DB if you have it
}) {
  const [pending, start] = useTransition();

  // Extract all theme fields, including new background fields
  const variant = current?.theme?.variant ?? "clean";
  const preset = current?.theme?.palette?.preset ?? "default";
  const primary = current?.theme?.palette?.primary ?? "";
  const accent  = current?.theme?.palette?.accent ?? "";
  const bgType  = current?.theme?.background?.type ?? "color";
  const bgValue = current?.theme?.background?.value ?? "";
  const landing = current?.landing_page ?? "products";
  const view    = current?.display_mode ?? "grid";

  function onSubmit(form: FormData) {
    // UPDATED: Include new background fields
    const input = {
      profileId,
      variant: form.get("variant") as any,
      preset: form.get("preset") as string,
      primary: form.get("primary") as string,
      accent: form.get("accent") as string,
      backgroundType: form.get("backgroundType") as any,
      backgroundValue: form.get("backgroundValue") as string,
      landing: form.get("landing") as any,
      view: form.get("view") as any,
    };
  }

  return (
    <form
      action={onSubmit}
      className="space-y-6 rounded-2xl border border-black/5 bg-white p-4"
    >
      {/* Theme Variant */}
      <div>
        <label className="block text-sm font-medium">Theme Variant</label>
        <select name="variant" defaultValue={variant} className="mt-1 w-full rounded-md border p-2">
          <option value="clean">Clean</option>
          <option value="bold">Bold</option>
          <option value="minimal">Minimal</option>
        </select>
      </div>

      {/* Theme Preset */}
      <div>
        <label className="block text-sm font-medium">Palette preset</label>
        <select name="preset" defaultValue={preset} className="mt-1 w-full rounded-md border p-2">
          {/* Including all options for simplicity */}
          <option value="default">Default (Clean)</option>
          <option value="warm">Warm (Clean)</option>
          <option value="cool">Cool (Clean)</option>
          <option value="sunset">Sunset (Bold)</option>
          <option value="ocean">Ocean (Bold)</option>
          <option value="forest">Forest (Bold)</option>
          <option value="light">Minimal Light</option>
          <option value="dark">Minimal Dark</option>
          <option value="custom">Custom Colors</option>
        </select>
        <p className="mt-1 text-xs text-black/60">Use 'Custom Colors' to apply Primary/Accent values below to any variant.</p>
      </div>

      {/* Color overrides */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Primary (Hex)</label>
          <input name="primary" defaultValue={primary} placeholder="#ff6b6b" className="mt-1 w-full rounded-md border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Accent (Hex)</label>
          <input name="accent" defaultValue={accent} placeholder="#feca57" className="mt-1 w-full rounded-md border p-2" />
        </div>
      </div>
      
      {/* Background fields */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Background Type</label>
          <select name="backgroundType" defaultValue={bgType} className="mt-1 w-full rounded-md border p-2">
            <option value="color">Solid Color</option>
            <option value="gradient">CSS Gradient</option>
            <option value="image">Image URL</option>
            <option value="none">None</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Background Value</label>
          <input name="backgroundValue" defaultValue={bgValue} placeholder="#fff or linear-gradient(...) or URL" className="mt-1 w-full rounded-md border p-2" />
        </div>
      </div>


      {/* Landing page */}
      <div>
        <label className="block text-sm font-medium">Landing page</label>
        <select name="landing" defaultValue={landing} className="mt-1 w-full rounded-md border p-2">
          <option value="products">Products (shop)</option>
          <option value="categories">Categories (directory)</option>
          <option value="hero-only">Hero only (business card)</option>
        </select>
      </div>

      {/* Default view for lists */}
      <div>
        <label className="block text-sm font-medium">Default view</label>
        <select name="view" defaultValue={view} className="mt-1 w-full rounded-md border p-2">
          <option value="grid">Grid</option>
          <option value="list">List</option>
          <option value="links">Links</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-full border border-black/10 px-4 py-2 shadow-sm hover:shadow"
      >
        {pending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}