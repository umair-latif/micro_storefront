"use client";

import { useState, useTransition, useEffect } from "react";
import Portal from "@/components/storefront/Portal";
import { createStoreAction } from "@/app/admin/profile/actions";

export default function NewStoreButton() {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setErr(null);
    start(async () => {
      const res = await createStoreAction(formData);
      if (res && !res.ok) setErr(res.error);
      // success will redirect server-side
    });
  }

  // optional: lock body scroll when modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
      >
        New Store
      </button>

      {open && (
        <Portal>
          <div
            className="fixed inset-0 z-[100] flex justify-center bg-black/40 overflow-y-auto pt-24 pb-10"
            aria-modal="true"
            role="dialog"
            onClick={() => setOpen(false)}  // click backdrop closes
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl"
              onClick={(e) => e.stopPropagation()} // prevent backdrop close
            >
              <div className="text-base font-semibold mb-2">Create a new store</div>
              {err && (
                <div className="mb-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  {err}
                </div>
              )}
              <form action={onSubmit} className="space-y-3">
                <label className="block">
                  <span className="text-sm font-medium">Display name</span>
                  <input
                    name="display_name"
                    className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
                    placeholder="My Shop"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Slug (optional)</span>
                  <input
                    name="slug"
                    className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
                    placeholder="my-shop"
                  />
                </label>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={pending}
                    className="rounded-xl bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
                  >
                    {pending ? "Creating…" : "Create store"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
