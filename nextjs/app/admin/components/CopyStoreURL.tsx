"use client";

import { useState } from "react";
import { Link as LinkIcon, Check } from "lucide-react";

export default function CopyStoreURL({ compact = false, url }: { compact?: boolean; url?: string }) {
  const [ok, setOk] = useState(false);

  async function copy() {
    const toCopy = url ?? window.location.origin + window.location.pathname.replace(/^\/admin.*/, "");
    await navigator.clipboard.writeText(toCopy);
    setOk(true);
    setTimeout(() => setOk(false), 1000);
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={copy}
        aria-label="Copy public link"
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white hover:bg-neutral-50"
      >
        {ok ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm hover:bg-neutral-50"
    >
      {ok ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
      <span className="hidden sm:inline">{ok ? "Copied" : "Copy store link"}</span>
    </button>
  );
}
