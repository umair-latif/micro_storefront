"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Menu, LogOut, Plus, Store } from "lucide-react";
import StoreSwitcher from "./StoreSwitcher";
import CopyStoreURL from "./CopyStoreURL";
import { createClient } from "@/lib/supabase-client";
import { useDrawer } from "./DrawerProvider";

export default function BrandBar() {
  const router = useRouter();
  const search = useSearchParams();
  const store = search.get("store");
  const { toggleDrawer } = useDrawer();

  async function handleLogout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (!error) router.push("/admin/(auth)/login");
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-black/10 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-2 sm:px-4">
        {/* Mobile menu button */}
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

        {/* Keep overflow visible so popovers (store switcher) can float */}
        <div className="relative flex flex-1 items-center gap-2 overflow-x-visible z-50">
          <StoreSwitcher />

          <Link
            href={`/admin/profile${store ? `?store=${store}` : ""}`}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-3 py-2 font-sm text-white shadow-sm hover:bg-neutral-800"
          >
            <Plus className="h-4 w-4" /> New Store
          </Link>

          <CopyStoreURL />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </div>
    </header>
  );
}
