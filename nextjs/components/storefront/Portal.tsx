"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function Portal({ children }: { children: React.ReactNode }) {
  const mountRef = useRef<Element | null>(null);
  const elRef = useRef<HTMLElement | null>(null);

  if (!elRef.current && typeof document !== "undefined") {
    elRef.current = document.createElement("div");
  }

  useEffect(() => {
    mountRef.current = document.body;
    const el = elRef.current!;
    mountRef.current.appendChild(el);
    return () => {
      mountRef.current?.removeChild(el);
    };
  }, []);

  return elRef.current ? createPortal(children, elRef.current) : null;
}
