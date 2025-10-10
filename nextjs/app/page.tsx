import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Microw — Link-in-bio storefronts for creators",
  description:
    "Microw lets creators and small shops sell beautifully with a modern, customizable link-in-bio storefront.",
  openGraph: {
    title: "Microw — Link-in-bio storefronts for creators",
    description:
      "Microw lets creators and small shops sell beautifully with a modern, customizable link-in-bio storefront.",
    images: [{ url: "/og.png" }], // optional; add /public/og.png
  },
  twitter: {
    card: "summary_large_image",
    title: "Microw",
    description:
      "A modern link-in-bio storefront for creators and small shops.",
    images: ["/og.png"], // optional
  },
};

const ACCENT = "#e6759d";

export default function MarketingHome() {
  return (
    <main
      className="min-h-[100svh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-[#fff3f7] to-white"
      style={{
        // gentle background tint
        // @ts-ignore
        "--tw-gradient-from": "#ffffff",
        "--tw-gradient-stops": "var(--tw-gradient-from), #fff3f7, #ffffff",
      }}
    >
      <div className="mx-auto flex min-h-[100svh] max-w-4xl flex-col items-center justify-center px-6 text-center">
        {/* Logo */}
        <div className="mb-6">
          <Image
            src="/brand/logo-hero.png"
            alt="Microw"
            width={600}
            height={300}
            priority
          />
        </div>

        {/* Headline */}
        <h1 className="text-3xl font-semibold sm:text-5xl">
          Your link-in-bio, now a{" "}
          <span className="font-bold" style={{ color: ACCENT }}>
            beautiful storefront
          </span>
          .
        </h1>

        {/* Subcopy */}
        <p className="mt-4 max-w-2xl text-balance text-neutral-600 sm:text-lg">
          Microw lets creators and small shops showcase products, links, and
          CTAs in a clean, themeable page. Add categories, Instagram-style
          product cards, and one-tap WhatsApp.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/admin/login"
            className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:shadow"
            style={{ backgroundColor: ACCENT }}
          >
            Log in
          </Link>
          <Link
            href="/admin/login?mode=signup"
            className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
          >
            Sign up
          </Link>
        </div>

        {/* Tiny footer */}
        <div className="mt-12 text-xs text-neutral-500">
          © {new Date().getFullYear()} Microw. All rights reserved.
        </div>
      </div>
    </main>
  );
}
