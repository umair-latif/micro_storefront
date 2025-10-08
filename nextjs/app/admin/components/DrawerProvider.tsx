"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";

type DrawerCtx = {
  open: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
};

const Ctx = createContext<DrawerCtx | null>(null);

export function useDrawer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDrawer must be used within <DrawerProvider>");
  return ctx;
}

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const openDrawer = useCallback(() => setOpen(true), []);
  const closeDrawer = useCallback(() => setOpen(false), []);
  const toggleDrawer = useCallback(() => setOpen((v) => !v), []);

  // ✅ Close the drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Ctx.Provider value={{ open, openDrawer, closeDrawer, toggleDrawer }}>
      {children}
    </Ctx.Provider>
  );
}

/** Renders the mobile slide-over with an overlay */
export function Drawer({ children }: { children: React.ReactNode }) {
  const { open, closeDrawer } = useDrawer();

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden="true"
        onClick={closeDrawer}
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      {/* Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform bg-white shadow-xl ring-1 ring-black/10 transition-transform duration-200 ease-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="h-full overflow-y-auto p-3">{children}</div>
      </div>
    </>
  );
}
