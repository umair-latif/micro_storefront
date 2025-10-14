// components/site/MarketingNavbar.tsx
"use client"; // Explicitly make this a client component

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/examples", label: "Examples" },
  { href: "/tutorials", label: "Tutorials" },
];

const ACCENT = "#e6759d";

export default function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  // Effect to track scrolling
  useEffect(() => {
    const handleScroll = () => {
      // Set 'scrolled' to true if the vertical scroll position is more than 10px
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Cleanup the event listener on component unmount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Conditional classes for background and shadow
  const navClasses = `
    fixed top-0 left-0 right-0 z-10 transition-all duration-300
    ${scrolled 
        ? 'bg-white/95 shadow-lg backdrop-blur-sm' // Solid, slightly translucent background on scroll
        : 'bg-transparent' // Transparent when at the top
    }
  `;

  return (
    // Apply the conditional classes here
    <nav className={navClasses}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        
        {/* Logo/Brand Name (Left) - Logo size increased */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/brand/logo-large.png"
            alt="Microw Logo"
            width={180} // Increased from 120
            height={90}  // Increased from 60
            className="h-auto w-auto" 
            priority
          />
        </Link>

        {/* Navigation Links and CTAs (Right) */}
        <div className="flex items-center space-x-4">
          {/* Menu Items */}
          <div className="hidden space-x-4 text-sm font-medium text-neutral-600 md:flex">
            {NAV_LINKS.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-neutral-900 transition">
                {item.label}
              </Link>
            ))}
          </div>

          {/* Login/Signup CTAs (Right-aligned) */}
          <Link
            href="/admin/login"
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:shadow-md"
            style={{ backgroundColor: ACCENT }}
          >
            Log in
          </Link>
          <Link
            href="/admin/login?mode=signup"
            className="hidden items-center justify-center rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 sm:inline-flex"
          >
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
}