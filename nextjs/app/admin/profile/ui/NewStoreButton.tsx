"use client";

import { useEffect, useState, useTransition } from "react";
import Portal from "@/components/ui/Portal";
import { createClient } from "@/lib/supabase-client";
import { createStoreAction } from "@/app/admin/profile/actions";

export default function NewStoreButton() {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // 🔹 Track login state
  useEffect(() => {
    let mounted = true;

    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      if (mounted) setUser(data.user);
    }
    fetchUser();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user || null);
      if (!session?.user) setOpen(false); // close modal if logged out
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, [supabase]);

  function onSubmit(formData: FormData) {
    setErr(null);
    start(async () => {
      const res = await createStoreAction(formData);
      if (res && !res.ok) setErr(res.error);
    });
  }

  // 🧱 If user is not logged in, show disabled button
  if (!user) {
    return (
      <button
        disabled
        title="Please log in to create a store"
        className="inline-flex items-center gap-2 rounded-xl bg-neutral-200 px-3 py-2 text-sm font-medium text-neutral-500 cursor-not-allowed"
      >
        New Store
      </button>
    );
  }

  // 🧩 Main logged-in UI
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
      >
        New Store
      </button>

      {open && (
        <Portal>
          <div
            className="fixed inset-0 z-[100] flex justify-center bg-black/40 overflow-y-auto pt-24 pb-10"
            aria-modal="true"
            role="dialog"
            onClick={() => setOpen(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
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
