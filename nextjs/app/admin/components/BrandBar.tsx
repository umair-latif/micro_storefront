"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Menu, Plus } from "lucide-react";
import StoreSwitcher from "./StoreSwitcher";
import CopyStoreURL from "./CopyStoreURL";
import { useDrawer } from "./DrawerProvider";

export default function BrandBar() {
  const search = useSearchParams();
  const store = search.get("store");
  const profile = search.get("profile");
  const { toggleDrawer } = useDrawer();
  const baseClasses = "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium shadow-sm transition ";

  // Define conditional classes using the ternary operator
  const disabledClasses = "bg-neutral-900 text-gray-400 cursor-not-allowed pointer-events-none opacity-70";
  const activeClasses = "bg-neutral-900 text-white hover:bg-neutral-800";
  const combinedClasses = `${baseClasses} ${!store ? disabledClasses : activeClasses}`;

  return (
    <header className="sticky top-0 z-[60] w-full border-b border-black/10 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-2 sm:px-4 overflow-visible">
        {/* Mobile menu */}
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1 ring-black/10 lg:hidden"
          onClick={toggleDrawer}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Brand (switch by breakpoint) */}
        <Link href="/" className="flex items-center gap-2" aria-label="Microw Home">
          {/* Mobile / small screens: logo-mark */}
          <Image
            src="/brand/logo-mark.png"
            alt="Microw"
            width={28}
            height={28}
            className="block lg:hidden"
            priority
          />
          {/* Desktop / large screens: logo-large */}
          <Image
            src="/brand/_logo-large.png"
            alt="Microw"
            width={360}
            height={80}
            className="hidden lg:block h-10 w-auto"
            priority
          />
        </Link>

        <div className="mx-2 h-6 w-px bg-black/10" />

        {/* Center section (keep overflow visible for popovers) */}
        <div className="relative z-[61] flex flex-1 items-center gap-2 overflow-visible">
          <StoreSwitcher />
  
          <Link
            href={`/admin/profile${store ? `?store=${store}` : ""}`}
            className=${baseClasses} ${activeClasses}
          >
            <Plus className="h-4 w-4" /> New Store
          </Link>

          <CopyStoreURL />
        </div>
      </div>
    </header>
  );
}
