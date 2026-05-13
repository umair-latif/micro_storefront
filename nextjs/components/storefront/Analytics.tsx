"use client";
import { useEffect } from "react";

export function useViewPing(profileId: string) {
  useEffect(() => {
    fetch("/api/analytics/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId }),
    }).catch(() => {});
  }, [profileId]);
}

export function trackCtaClick(payload: Record<string, any>) {
  fetch("/api/analytics/cta", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(() => {});
}
