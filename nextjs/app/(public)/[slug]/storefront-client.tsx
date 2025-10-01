'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';

type Profile = {
  display_name: string;
  bio?: string;
  profile_img?: string;
  header_img?: string;
  ig_handle?: string;
  tt_handle?: string;
  wa_e164?: string;
};

type Category = { id: string; name: string; cover?: string | null };
type Product = {
  id: string;
  title: string;
  price?: string | null;
  caption?: string | null;
  instagram_permalink?: string | null;
  thumb_url?: string | null;
  ig_user?: string | null;
  category_id?: string | null;
  cta_label?: string | null;
  cta_url?: string | null;
};

export default function StorefrontClient({
  profile,
  categories,
  products,
}: {
  profile: Profile;
  categories: Category[];
  products: Product[];
}) {
  const [activeCat, setActiveCat] = useState<string>(categories[0]?.id || 'all');
  const [open, setOpen] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    if (activeCat === 'all') return products;
    return products.filter((p) => (p.category_id || '') === activeCat);
  }, [products, activeCat]);

  return (
    <>
      {/* HEADER (non-sticky) */}
      <section className="relative">
        {/* Background image */}
        <div className="relative h-44 md:h-56 w-full overflow-hidden">
          {profile.header_img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.header_img}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400" />
          )}
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Foreground content */}
        <div className="absolute inset-0 px-4 pt-6 pb-16">
          {/* Social glass bar — TOP CENTER */}
          {(profile.ig_handle || profile.tt_handle || profile.wa_e164) && (
            <div className="absolute top-1/4 -translate-y-1/2 right-4 z-10">
                <div className="flex flex-col items-center gap-3 rounded-full px-2.5 py-3 bg-white/55 backdrop-blur-md border border-white/60 shadow-sm">
                 {profile.ig_handle && (
                  <a
                    href={`https://instagram.com/${profile.ig_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 grid place-items-center rounded-full bg-white/80 hover:bg-white transition"
                    aria-label="Instagram"
                    title="Instagram"
                  >
                    {/* Instagram glyph */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-gray-800">
                      <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm0 2h10c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3zm11 2a1 1 0 100 2 1 1 0 000-2zM12 7a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z"/>
                    </svg>
                  </a>
                )}
                {profile.tt_handle && (
                  <a
                    href={`https://tiktok.com/@${profile.tt_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 grid place-items-center rounded-full bg-white/80 hover:bg-white transition"
                    aria-label="TikTok"
                    title="TikTok"
                  >
                    {/* TikTok glyph */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-gray-800">
                      <path d="M16 3c.5 2.1 2 3.7 4 4v3c-1.9 0-3.7-.7-5-1.9V15a6 6 0 11-6-6c.5 0 1 .1 1.5.2V8.4A9 9 0 006 8a9 9 0 109 9V3h1z"/>
                    </svg>
                  </a>
                )}
                {profile.wa_e164 && (
                  <a
                    href={`https://wa.me/${profile.wa_e164}?text=${encodeURIComponent(`Hi ${profile.display_name}`)}`}
                    className="w-8 h-8 grid place-items-center rounded-full bg-green-600 hover:bg-green-700 text-white transition"
                    aria-label="WhatsApp"
                    title="WhatsApp"
                  >
                    {/* WhatsApp glyph */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.52 3.48A11.92 11.92 0 0012.02 0C5.41 0 .05 5.36.05 11.97c0 2.11.55 4.17 1.6 6L0 24l6.21-1.63a12 12 0 005.81 1.48h.01C18.64 23.85 24 18.48 24 11.97a11.92 11.92 0 00-3.48-8.49zM12.02 21.3h-.01a9.3 9.3 0 01-4.74-1.29l-.34-.2-3.69.97.99-3.6-.22-.37a9.3 9.3 0 01-1.4-4.83c0-5.13 4.18-9.31 9.32-9.31a9.25 9.25 0 016.6 2.73 9.28 9.28 0 012.72 6.59c0 5.14-4.18 9.31-9.33 9.31zm5.35-7.02c-.29-.15-1.72-.85-1.98-.94-.27-.1-.46-.15-.66.15-.19.29-.76.94-.94 1.13-.17.19-.35.22-.65.07-.29-.15-1.24-.46-2.36-1.46-.87-.78-1.46-1.75-1.63-2.04-.17-.29 0-.45.13-.59.13-.13.29-.35.43-.52.15-.17.19-.29.29-.49.1-.19.05-.37-.02-.52-.08-.15-.66-1.58-.9-2.16-.24-.58-.48-.5-.66-.51h-.57c-.19 0-.5.07-.76.37-.26.29-1 1-1 2.43s1.02 2.82 1.17 3.01c.15.19 2 3.05 4.84 4.28.68.3 1.21.48 1.63.62.68.22 1.3.19 1.79.12.55-.08 1.72-.7 1.97-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.19-.54-.34z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Avatar + text on smoky panel */}
          <div className="flex items-start gap-3">
            {profile.profile_img ? (
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 shrink-0 ring-2 ring-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.profile_img}
                  alt={profile.display_name}
                  className="object-cover w-16 h-16"
                />
              </div>
            ) : null}

            <div className={`min-w-0 flex-1 ${profile.profile_img ? '' : 'text-center mx-auto'}`}>
              <div className={`inline-block rounded-xl px-4 py-3 bg-white/20 backdrop-blur-md text-white ${profile.profile_img ? '' : 'mx-auto'}`}>
                <h1 className="font-semibold text-base">{profile.display_name}</h1>
                {profile.bio && (
                  <p className="text-white/95 text-sm whitespace-pre-line leading-snug mt-0.5">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES — attached to header bottom with ~25% overlap */}
      <div className="-mt-8 px-0 pb-3 relative z-20">
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-4 w-max pl-4 pr-4 pt-2">
            {categories.map((c) => {
              const active = c.id === activeCat;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCat(c.id)}
                  className="flex flex-col items-center gap-1 shrink-0"
                >
                  <span
                    className={[
                      'relative inline-grid place-items-center rounded-full bg-white',
                      'w-16 h-16 shadow-sm',
                      active
                        ? 'ring-2 ring-offset-2 ring-offset-white ring-purple-500'
                        : 'ring-1 ring-gray-200',
                    ].join(' ')}
                  >
                    <span className="w-[95%] h-[95%] rounded-full overflow-hidden bg-gray-100">
                      {c.cover ? (
                        <Image
                          src={c.cover}
                          alt={c.name}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-[10px] text-gray-400">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </span>
                  </span>
                  <span
                    className={`text-[11px] ${
                      active ? 'font-semibold' : 'text-gray-600'
                    } max-w-16 truncate`}
                  >
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* PRODUCTS */}
      <section className="grid grid-cols-2 gap-0.5 md:grid-cols-2">
        {filtered.map((p, idx) => (
          <article key={p.id} className="bg-white">
            <button
              onClick={() => setOpen(p)}
              className="block w-full text-left"
              aria-label={`Open ${p.title}`}
            >
              <div className="relative aspect-square bg-gray-100">
                {p.thumb_url ? (
                  <Image
                    src={p.thumb_url}
                    alt={p.title}
                    width={800}
                    height={800}
                    className="object-cover w-full h-full"
                    unoptimized
                    priority={idx === 0}
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-xs text-gray-500">
                    No Image
                  </div>
                )}
                {p.price && (
                  <span className="absolute top-2 left-2 text-[11px] px-2 py-1 rounded-full bg-white/90 border">
                    {p.price}
                  </span>
                )}
              </div>
            </button>
            <div className="p-3">
              <h3 className="font-medium text-sm line-clamp-2 leading-snug">{p.title}</h3>
            </div>
            <div className="p-3 pt-0 grid grid-cols-2 gap-2">
              <a
                href={`instagram://user?username=${encodeURIComponent(p.ig_user || '')}`}
                className="border rounded-lg py-2 text-center text-sm"
              >
                DM
              </a>
              <a
                href={`https://wa.me/${profile.wa_e164}?text=${encodeURIComponent(
                  `Hi ${profile.display_name}, I'm interested in ${p.title}${
                    p.instagram_permalink ? ` (${p.instagram_permalink})` : ''
                  }`
                )}`}
                className="bg-green-600 text-white rounded-lg py-2 text-center text-sm"
              >
                WhatsApp
              </a>
            </div>
          </article>
        ))}
      </section>

      {/* PRODUCT MODAL */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(null)} />
          <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 pt-4">
              <div className="font-semibold">{open.title}</div>
              <button className="text-sm px-3 py-1 rounded border" onClick={() => setOpen(null)}>
                Close
              </button>
            </div>
            <div className="mt-3">
              <div className="relative aspect-square bg-gray-100">
                {open.thumb_url ? (
                  <Image
                    src={open.thumb_url}
                    alt={open.title}
                    width={1200}
                    height={1200}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-xs text-gray-500">
                    No Image
                  </div>
                )}
                {open.price && (
                  <span className="absolute top-2 left-2 text-xs px-2 py-1 rounded-full bg-white/90 border">
                    {open.price}
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 space-y-3">
              {open.price && <div className="text-base font-semibold">{open.price}</div>}
              {open.caption && <p className="text-sm text-gray-700 whitespace-pre-line">{open.caption}</p>}

              <div className="grid grid-cols-2 gap-2 pt-2">
                {open.instagram_permalink && (
                  <a
                    href={open.instagram_permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="col-span-2 border rounded-lg py-2 text-center text-sm"
                  >
                    View on Instagram
                  </a>
                )}
                <a
                  href={`instagram://user?username=${encodeURIComponent(open.ig_user || '')}`}
                  className="border rounded-lg py-2 text-center text-sm"
                >
                  DM
                </a>
                {profile.wa_e164 && (
                  <a
                    href={`https://wa.me/${profile.wa_e164}?text=${encodeURIComponent(
                      `Hi ${profile.display_name}, I'm interested in ${open.title}${
                        open.instagram_permalink ? ` (${open.instagram_permalink})` : ''
                      }`
                    )}`}
                    className="bg-green-600 text-white rounded-lg py-2 text-center text-sm"
                  >
                    WhatsApp
                  </a>
                )}
                {open.cta_label && open.cta_url && (
                  <a
                    href={open.cta_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="col-span-2 border rounded-lg py-2 text-center text-sm"
                  >
                    {open.cta_label}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-10 mb-16 px-4">
        <div className="border-t pt-6 text-center text-sm text-gray-600 space-y-3">
          <div>
            Built with <strong>Instore</strong> — your micro-storefront from socials.
          </div>
          <div className="flex items-center justify-center gap-3">
            <a href="/admin/login" className="px-3 py-1.5 rounded border hover:bg-gray-50">
              Create your storefront
            </a>
            <a href="/admin/login" className="px-3 py-1.5 rounded bg-gray-900 text-white">
              Join Instore
            </a>
          </div>
          <div className="text-xs text-gray-500">
            © {new Date().getFullYear()} Instore • Terms • Privacy • Contact
          </div>
        </div>
      </footer>
    </>
  );
}
