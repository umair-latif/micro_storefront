"use client";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import StoreSwitcher from "./StoreSwitcher";
import CopyStoreURL from "./CopyStoreURL";
import { useDrawer } from "./DrawerProvider";
import NewStoreButton from "@/app/admin/profile/ui/NewStoreButton";
import { useMedia } from "@/lib/useMedia";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { signOutServer } from "@/app/auth/actions";

function LogoutButton({ isWide }: { isWide: boolean }) {
  const supabase = useMemo(() => createClient(), []);
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    if (busy) return;
    setBusy(true);
    try {
      await supabase.auth.signOut();                                // clear client
      await signOutServer("/admin/(auth)/login?m=logged_out");      // clear cookies + redirect
    } finally {
      setBusy(false);
    }
  }

  // Looks like other icon buttons—icon-only on narrow, icon+label on wide
  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={busy}
      title="Logout"
      className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-60"
    >
      <LogOut className="h-5 w-5" />
      {isWide ? (busy ? "Logging out…" : "Logout") : null}
    </button>
  );
}

export default function BrandBar() {
  const search = useSearchParams();
  const { toggleDrawer } = useDrawer();
  // ✅ Wide if viewport ≥ 768px (desktop/tablet)
  const isWide = useMedia("(min-width: 768px)", true);

  return (
    <div className="sticky top-0 z-[60] bg-white/90 backdrop-blur border-b">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 py-2 flex items-center gap-3">
        {/* Left: drawer toggle on mobile */}
        <button
          onClick={toggleDrawer}
          className="inline-flex lg:hidden items-center justify-center rounded-xl border border-black/10 bg-white p-2 hover:bg-neutral-50"
          title="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Brand */}
         <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Microw Home">
          {/* Small: mark */}
          <Image
            src="/brand/logo-mark.png"
            alt="microw"
            title="micro.me"
            width={48}
            height={48}
            className="block lg:hidden h-8 w-8 min-h-8 min-w-8"
            priority
          />
          {/* Large: full logo */}
          <Image
            src="/brand/logo-large.png"
            alt="Microw"
            title="micro.me"
            width={460}
            height={380}
            className="hidden lg:block h-12 w-auto shrink-0"
            priority
          />
        </Link>

        {/* Center actions (grow to push tools to the right) */}
        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <StoreSwitcher />
          <NewStoreButton />
          <CopyStoreURL />
          {/* 🔒 New: Logout moved here */}
          <LogoutButton isWide={isWide} />
        </div>
      </div>
    </div>
  );
}
