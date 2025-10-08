// components/storefront/ProductGallery.tsx
"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({
  images,
  theme,
}: {
  images: string[];
  theme: any;
}) {
  const [active, setActive] = useState(0);
  const hasThumbs = images.length > 1;

  if (!images?.length) {
    return (
      <div className="aspect-square w-full rounded-2xl bg-neutral-100" />
    );
  }

  return (
    <div className="w-full">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
        <Image
          src={images[active]}
          alt="Product image"
          fill
          className="object-cover"
          priority
        />
        {/* soft fade bottom to body color */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
          //style={{ background: `linear-gradient(to top, ${theme.background}, rgba(0,0,0,0))` }}
        />
      </div>

      {hasThumbs && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((src, idx) => (
            <button
              key={src + idx}
              onClick={() => setActive(idx)}
              className={`relative aspect-square overflow-hidden rounded-xl border ${idx === active ? "border-black/30" : "border-black/10"}`}
              aria-label={`Image ${idx + 1}`}
            >
              <Image src={src} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
