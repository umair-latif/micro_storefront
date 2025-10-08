import Link from "next/link";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-12 border-t border-black/5 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: brand + tagline */}
        <div className="flex items-center gap-3">
          <Logo className="h-7 w-7" />
          <div>
            <Link href="/" className="text-base font-semibold tracking-tight hover:opacity-80">
              microw.me
            </Link>
            <p className="text-sm text-black/60">simple storefronts for creators</p>
          </div>
        </div>

        {/* Middle: auth / primary actions */}
        <nav className="flex flex-wrap items-center gap-4 text-sm">
          <Link href="/login" className="hover:underline">Log in</Link>
          <Link href="/signup" className="rounded-full border border-black/10 px-3 py-1 hover:bg-black/5">Sign up</Link>
        </nav>

        {/* Right: legal */}
        <div className="text-xs text-black/60">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link href="/impressum" className="hover:underline">Impressum</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <span>© {year} microw.me</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopOpacity="1" />
          <stop offset="1" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="url(#g)"></rect>
      <path d="M8 9h8v2H8zM8 13h5v2H8z" fill="white" />
    </svg>
  );
}
