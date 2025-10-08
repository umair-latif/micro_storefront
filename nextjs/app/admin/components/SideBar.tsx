"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { LayoutGrid, ShoppingBag, FolderKanban, Palette } from "lucide-react";

const nav = [
  { href: "/admin/profile", label: "Store Profile", icon: LayoutGrid },
  { href: "/admin/categories", label: "Categories", icon: FolderKanban },
  { href: "/admin/products", label: "Products", icon: ShoppingBag },
  { href: "/admin/storefront", label: "Storefront", icon: Palette },
];

export default function Sidebar({
  variant = "desktop",
}: {
  variant?: "desktop" | "drawer";
}) {
  const pathname = usePathname();
  const search = useSearchParams();
  const store = search.get("store");

  // Container visibility:
  // - desktop: only show on lg+ (hide on mobile)
  // - drawer: only show on mobile (drawer area already hidden on lg)
  const containerClass =
    variant === "desktop" ? "hidden lg:block" : "block lg:hidden";

  return (
    <nav className={containerClass}>
      <ul className="space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={`${item.href}${store ? `?store=${store}` : ""}`}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ring-1 ring-transparent hover:bg-neutral-50 hover:ring-black/5 ${
                  active
                    ? "bg-neutral-900 text-white hover:bg-neutral-900 hover:ring-black/0"
                    : ""
                }`}
              >
                <Icon className="h-4 w-4" /> {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
