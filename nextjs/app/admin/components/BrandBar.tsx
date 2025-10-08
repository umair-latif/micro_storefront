"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Menu, LogOut, Plus, Store } from "lucide-react";
import StoreSwitcher from "./StoreSwitcher";
import CopyStoreURL from "./CopyStoreURL";
import { createClient } from "@/lib/supabase-client";
import { useDrawer } from "./DrawerProvider";
import { useTransition } from "react";
import { signOutServer } from "@/app/auth/actions"; // server action that clears httpOnly cookies + redirects

export default function BrandBar() {
  const search = useSearchParams();
  const store = search.get("store");
  const { toggleDrawer } = useDrawer();
  const [pending, start] = useTransition();

  async function handleLogout() {
    if (pending) return; // prevent double-clicks

    // 1) Clear browser-stored session (localStorage) so client won't silently rehydrate
    const supabase = createClient();
    await supabase.auth.signOut();

    // 2) Clear server httpOnly cookies & redirect on the server
    start(async () => {
      await signOutServer("/admin/login?m=logged_out");
      // no code after this runs on success because server action redirects
    });
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-black/10 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-2 sm:px-4">
        {/* Mobile menu */}
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1 ring-black/10 lg:hidden"
          onClick={toggleDrawer}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Store className="h-5 w-5" />
          <span className="hidden sm:inline">Micro Storefront</span>
        </Link>

        <div className="mx-2 h-6 w-px bg-black/10" />

        {/* Center section */}
        <div className="relative z-50 flex flex-1 items-center gap-2 overflow-x-visible">
          <StoreSwitcher />
          <Link
            href={`/admin/profile${store ? `?store=${store}` : ""}`}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-neutral-800"
          >
            <Plus className="h-4 w-4" /> New Store
          </Link>
          <CopyStoreURL />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLogout}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />
            {pending ? "Logging out…" : "Logout"}
          </button>
        </div>
      </div>
    </header>
  );
}
