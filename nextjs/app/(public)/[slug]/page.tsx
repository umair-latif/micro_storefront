import { getStorefront } from '@/lib/db';
import StorefrontClient from './storefront-client';

export default async function Storefront({ params }:{ params:{ slug:string } }) {
  const data = await getStorefront(params.slug);
  if (!data) return <div className="p-6">Store not found.</div>;

  const { profile, categories, products } = data;

  // Build category objects with a cover (first product image in that category)
  const byCat = new Map<string, any[]>();
  for (const p of products) {
    const key = p.category_id || 'uncategorized';
    if (!byCat.has(key)) byCat.set(key, []);
    byCat.get(key)!.push(p);
  }

  const catList = categories.map((c:any) => {
    const prods = byCat.get(c.id) || [];
    const cover = prods.find(p => p.thumb_url)?.thumb_url || null;
    return { id: c.id, name: c.name, cover };
  });

  // Prepend "All" pseudo-category
  const allCat = { id: 'all', name: 'Show all', cover: products.find(p=>p.thumb_url)?.thumb_url || null };
  const cats = [allCat, ...catList];

  return (
    <main className="max-w-xl mx-auto">
      {/* Header (non-sticky) with optional header image background }
        <section className="relative">
    {profile.header_img && (
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element }
        <img
          src={profile.header_img}
          alt=""
          className="w-full h-40 md:h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black/15" />
      </div>
    )}

    {/* Foreground content }
    <div className="relative z-10 px-4 py-4">
      <div className="flex items-center gap-3">
        {profile.profile_img ? (
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 shrink-0 ring-2 ring-white">
            {/* eslint-disable-next-line @next/next/no-img-element }
            <img src={profile.profile_img} alt="Profile" className="w-14 h-14 object-cover" />
          </div>
        ) : null}

        <div className={`min-w-0 flex-1 ${profile.profile_img ? '' : 'text-center mx-auto'}`}>
          <h1 className="font-semibold text-base">{profile.display_name}</h1>
          {profile.bio && (
            <p className={`text-gray-700 text-sm whitespace-pre-line leading-snug ${profile.profile_img ? '' : 'max-w-[28rem] mx-auto'}`}>
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      <div className={`flex gap-2 mt-3 ${profile.profile_img ? '' : 'justify-center'}`}>
        {profile.ig_handle && (
          <a
            href={`https://instagram.com/${profile.ig_handle}`}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-sm font-medium"
          >
            IG
          </a>
        )}
        {profile.tt_handle && (
          <a
            href={`https://tiktok.com/@${profile.tt_handle}`}
            className="bg-black text-white px-3 py-1.5 rounded-full text-sm font-medium"
          >
            TT
          </a>
        )}
      </div>
    </div>
  </section>


      {/* Hand off to client-side component */}
      <StorefrontClient profile={profile} categories={cats} products={products} />
    </main>
  );
}
