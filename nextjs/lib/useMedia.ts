"use client";

import { useEffect, useState } from "react";

export function useMedia(query: string, defaultState = false) {
  const [matches, setMatches] = useState(defaultState);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, [query]);

  return matches;
}
