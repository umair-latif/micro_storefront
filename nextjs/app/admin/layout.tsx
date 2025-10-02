// app/admin/layout.tsx
import type { ReactNode } from "react";
import BrandBar from "./components/BrandBar";
import Sidebar from "./components/SideBar";
import { DrawerProvider, Drawer } from "./components/DrawerProvider";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <DrawerProvider>
        <BrandBar />

        {/* Mobile drawer (shows on mobile only) */}
        <Drawer>
          <Sidebar variant="drawer" />
        </Drawer>

        <div className="mx-auto max-w-7xl px-3 sm:px-4">
          <div className="grid grid-cols-1 gap-4 py-4 lg:grid-cols-[240px_1fr]">
            {/* Desktop sidebar (shows on lg+) */}
            <aside className="lg:sticky lg:top-4 lg:h-[calc(100vh-5rem)]">
              <Sidebar variant="desktop" />
            </aside>

            <main className="min-w-0 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
              {children}
            </main>
          </div>
        </div>
      </DrawerProvider>
    </div>
  );
}
