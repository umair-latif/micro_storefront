"use client";
import { useEffect } from "react";

export function useViewPing(storefrontId: number) {
  useEffect(() => {
    // POST to /api/analytics/view
    fetch("/api/analytics/view", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ storefrontId }) }).catch(() => {});
  }, [storefrontId]);
}

export function trackCtaClick(payload: Record<string, any>) {
  fetch("/api/analytics/cta", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(() => {});
}
