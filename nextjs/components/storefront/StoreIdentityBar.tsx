import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function translucent(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value) ? `${value}e6` : "rgba(255,255,255,.9)";
}

export default function StoreIdentityBar({
  storeName,
  avatarUrl,
  backHref,
  contextLabel,
  theme,
}: {
  storeName: string;
  avatarUrl: string | null;
  backHref: string;
  contextLabel?: string | null;
  theme: any;
}) {
  const surface = theme?.surface ?? "#ffffff";
  const text = theme?.text ?? "#111111";
  const muted = theme?.muted ?? "#666666";
  const primary = theme?.primary ?? text;

  return (
    <header
      className="sticky top-0 z-20 -mx-4 mb-4 border-b px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      style={{
        background: translucent(surface),
        borderColor: "rgba(0,0,0,.08)",
      }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href={backHref}
          aria-label="Back"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition hover:bg-black/5"
          style={{ color: text, borderColor: "rgba(0,0,0,.1)" }}
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border" style={{ borderColor: "rgba(0,0,0,.1)" }}>
          {avatarUrl ? (
            <Image src={avatarUrl} alt={storeName} fill sizes="40px" className="object-cover" />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-sm font-semibold"
              style={{ background: primary, color: surface }}
            >
              {initials(storeName) || "S"}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="truncate text-sm font-semibold leading-5" style={{ color: text }}>
            {storeName}
          </div>
          {contextLabel ? (
            <div className="truncate text-xs leading-4" style={{ color: muted }}>
              {contextLabel}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
