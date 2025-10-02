"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { LinkIcon, Check } from "lucide-react";

export default function CopyStoreURL() {
  const [copied, setCopied] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const search = useSearchParams();
  const store = search.get("store");

  useEffect(() => {
    if (!store) return setSlug(null);
    const supabase = createClient();
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("slug")
        .or(`id.eq.${store},slug.eq.${store}`)
        .maybeSingle();
      setSlug(data?.slug ?? null);
    })();
  }, [store]);

  const url = slug ? `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/${slug}` : null;

  return (
    <button
      disabled={!url}
      onClick={async () => {
        if (!url) return;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
      title={url ?? "Select a store first"}
    >
      {copied ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
      {copied ? "Copied" : "Copy store URL"}
    </button>
  );
}
