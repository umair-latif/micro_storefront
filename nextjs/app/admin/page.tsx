'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabaseClient } from '@/lib/supabase-client';
import Image from 'next/image';

// ---------- Types ----------
type Profile = {
  id: string;
  slug: string;
  display_name: string;
  bio?: string;
  ig_handle?: string;
  tt_handle?: string;
  wa_e164?: string;
  profile_img?: string;
  header_img?: string;
  owner_uid?: string | null;
};

type Category = {
  id: string;
  profile_id: string;
  name: string;
  position?: number | null;
};

type Product = {
  id: string;
  profile_id: string;
  title: string;
  caption?: string | null;
  price?: string | null;
  thumb_url?: string | null;
  instagram_permalink?: string | null;
  ig_user?: string | null;
  visible?: boolean | null;
  category_id?: string | null;
  created_at?: string;
  position?: number | null;
  cta_label?: string | null;
  cta_url?: string | null;
};

// ---------- Component ----------
export default function Admin() {
  // auth gate
  const [authed, setAuthed] = useState<boolean | null>(null);

  // store switcher
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profileId, setProfileId] = useState<string>('');
  const selectedProfile = useMemo(
    () => profiles.find((p) => p.id === profileId) || null,
    [profiles, profileId]
  );

  // loaded data
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [toast, setToast] = useState<string>('');
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // new / edit product (same modal)
  const blankProduct: Partial<Product> = {
    title: '',
    instagram_permalink: '',
    price: '',
    caption: '',
    category_id: '',
    visible: true,
    cta_label: '',
    cta_url: '',
  };
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>(blankProduct);
  const [editingFile, setEditingFile] = useState<File | null>(null);

  // create store modal
  const [newStoreOpen, setNewStoreOpen] = useState(false);
  const [newSlug, setNewSlug] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');

  // --------------- Auth ---------------
  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => {
      const has = !!data.session;
      setAuthed(has);
      if (!has) window.location.href = '/admin/login';
    });
  }, []);

  // --------------- Load stores for current user ---------------
  useEffect(() => {
    (async () => {
      const { data: u } = await supabaseClient.auth.getUser();
      const uid = u.user?.id;
      if (!uid) return;

      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('owner_uid', uid)
        .order('created_at', { ascending: true });

      if (!error) {
        setProfiles(data as Profile[]);
        if (data?.length && !profileId) setProfileId(data[0].id);
      }
    })();
  }, []); // once

  // --------------- Load data for selected store ---------------
  useEffect(() => {
    if (!profileId) return;
    (async () => {
      setLoading(true);
      try {
        const prof = profiles.find((p) => p.id === profileId);
        if (!prof) return;

        const { data: cats } = await supabaseClient
          .from('categories')
          .select('*')
          .eq('profile_id', prof.id)
          .order('position', { ascending: true });

        setCategories((cats as Category[]) || []);

        const { data: prods } = await supabaseClient
          .from('products')
          .select('*')
          .eq('profile_id', prof.id)
          .order('created_at', { ascending: false });

        setProducts((prods as Product[]) || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [profileId, profiles]);

  // --------------- Helpers ---------------
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 1400);
  }

  async function logout() {
    await supabaseClient.auth.signOut();
    window.location.href = '/admin/login';
  }

  async function copyStoreUrl() {
    const prof = selectedProfile;
    if (!prof) return;
    const url = `${window.location.origin}/${prof.slug}`;
    await navigator.clipboard.writeText(url);
    showToast('Store link copied');
  }

  // --------------- Store CRUD ---------------
  async function createStore() {
    const slug = newSlug.trim().toLowerCase();
    const display = newDisplayName.trim() || 'New Shop';
    if (!slug) return showToast('Slug required');

    const { data: u } = await supabaseClient.auth.getUser();
    const uid = u.user?.id || null;

    const { data, error } = await supabaseClient
      .from('profiles')
      .insert({ slug, display_name: display, owner_uid: uid })
      .select('*')
      .single();

    if (error) return showToast(error.message);
    setProfiles((prev) => [...prev, data as Profile]);
    setProfileId((data as Profile).id);
    setNewStoreOpen(false);
    setNewSlug('');
    setNewDisplayName('');
    showToast('Store created');
  }

  // --------------- Profile save ---------------
  async function saveProfile(p: Profile) {
    const upd = {
      display_name: p.display_name ?? '',
      bio: p.bio ?? '',
      ig_handle: p.ig_handle ?? '',
      tt_handle: p.tt_handle ?? '',
      wa_e164: p.wa_e164 ?? '',
      profile_img: p.profile_img ?? '',
      header_img: p.header_img ?? '',
    };
    const { data, error } = await supabaseClient
      .from('profiles')
      .update(upd)
      .eq('id', p.id)
      .select('*')
      .single();

    if (error) return showToast(error.message);
    setProfiles((prev) => prev.map((x) => (x.id === p.id ? (data as Profile) : x)));
    showToast('Profile saved');
  }

  // --------------- Category CRUD ---------------
  async function saveNewCategory() {
    if (!selectedProfile?.id) return showToast('No store loaded');
    const name = newCategoryName.trim();
    if (!name) return showToast('Category name required');

    const { data, error } = await supabaseClient
      .from('categories')
      .insert({ profile_id: selectedProfile.id, name })
      .select('*')
      .single();

    if (error) return showToast(error.message);
    setCategories((prev) => [...prev, data as Category]);
    setCategoryModalOpen(false);
    setNewCategoryName('');
    showToast('Category added');
  }

  async function removeCategory(id: string) {
    if (!confirm('Remove category?')) return;
    const { error } = await supabaseClient.from('categories').delete().eq('id', id);
    if (error) return showToast(error.message);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  // --------------- Product CRUD ---------------
  function openCreateProduct() {
    setEditingProduct({ ...blankProduct, profile_id: selectedProfile?.id });
    setEditingFile(null);
    setProductModalOpen(true);
  }

  function openEditProduct(p: Product) {
    setEditingProduct({ ...p });
    setEditingFile(null);
    setProductModalOpen(true);
  }

  async function saveProduct() {
    if (!selectedProfile?.id) return showToast('No store loaded');
    if (!editingProduct.title?.trim()) return showToast('Title required');

    // Create or update
    let row: Product | null = null;
    if (editingProduct.id) {
      const { data, error } = await supabaseClient
        .from('products')
        .update({
          title: editingProduct.title,
          instagram_permalink: editingProduct.instagram_permalink || null,
          price: editingProduct.price || null,
          caption: editingProduct.caption || null,
          category_id: editingProduct.category_id || null,
          ig_user: selectedProfile.ig_handle || null,
          visible: editingProduct.visible ?? true,
          cta_label: editingProduct.cta_label || null,
          cta_url: editingProduct.cta_url || null,
        })
        .eq('id', editingProduct.id as string)
        .select('*')
        .single();

      if (error) return showToast(error.message);
      row = data as Product;
    } else {
      const { data, error } = await supabaseClient
        .from('products')
        .insert({
          profile_id: selectedProfile.id,
          title: editingProduct.title,
          instagram_permalink: editingProduct.instagram_permalink || null,
          price: editingProduct.price || null,
          caption: editingProduct.caption || null,
          category_id: editingProduct.category_id || null,
          ig_user: selectedProfile.ig_handle || null,
          visible: editingProduct.visible ?? true,
          cta_label: editingProduct.cta_label || null,
          cta_url: editingProduct.cta_url || null,
        })
        .select('*')
        .single();

      if (error) return showToast(error.message);
      row = data as Product;
    }

    // Upload image if any
    if (editingFile && row?.id) {
      const url = await uploadImage(editingFile, row.id, selectedProfile.slug);
      if (url) {
        const { data: patched, error: upErr } = await supabaseClient
          .from('products')
          .update({ thumb_url: url })
          .eq('id', row.id)
          .select('*')
          .single();
        if (!upErr) row = patched as Product;
      }
    }

    // Upsert in UI
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === row!.id);
      return exists ? prev.map((p) => (p.id === row!.id ? row! : p)) : [row!, ...prev];
    });

    setProductModalOpen(false);
    setEditingProduct(blankProduct);
    setEditingFile(null);
    showToast('Product saved');
  }

  async function deleteProductImage(p: Product) {
    if (!p.thumb_url || !p.id) return;
    // We won't delete the object from storage (keeps MVP simple),
    // just clear the DB field:
    const { data, error } = await supabaseClient
      .from('products')
      .update({ thumb_url: null })
      .eq('id', p.id)
      .select('*')
      .single();
    if (error) return showToast(error.message);
    setProducts((prev) => prev.map((x) => (x.id === p.id ? (data as Product) : x)));
    // If we're editing it, update local state too:
    if (editingProduct.id === p.id) {
      setEditingProduct((prev) => ({ ...prev, thumb_url: null }));
    }
    showToast('Image removed');
  }

  async function uploadImage(file: File, productId: string, slug: string) {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${slug}/${productId}.${Date.now()}.${ext}`;

    const { error } = await supabaseClient.storage
      .from('product-images')
      .upload(path, file, {
        upsert: false,
        cacheControl: '3600',
        contentType: file.type || 'image/jpeg',
      });
    if (error) {
      showToast(error.message);
      return null;
    }
    const { data: pub } = supabaseClient.storage.from('product-images').getPublicUrl(path);
    return pub.publicUrl as string;
  }
// after all useEffects and useStates are declared:
if (authed === false) return null;
if (authed === null) return <div className="p-6">Loading…</div>;

  // --------------- Rendering ---------------
  return (
    <>
      {/* BRAND BAR (sticky) */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b">
        <div className="mx-auto w-full max-w-5xl px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Brand logo placeholder */}
            <div className="w-7 h-7 rounded bg-gray-900" aria-hidden />
            <div className="min-w-0">
              {/* Selected store link + copy */}
              {selectedProfile ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 truncate">
                    {window.location.origin}/{selectedProfile.slug}
                  </span>
                  <button
                    className="text-xs px-2 py-1 rounded border"
                    onClick={copyStoreUrl}
                    title="Copy link"
                  >
                    Copy
                  </button>
                </div>
              ) : (
                <span className="text-sm text-gray-500">No store selected</span>
              )}
            </div>
          </div>
          <div>
            <button onClick={logout} className="px-3 py-1.5 rounded border">
              Log out
            </button>
          </div>
        </div>
      </div>

      {/* ADMIN BAR (responsive, non-sticky) */}
      <section className="w-full">
        <div className="mx-auto max-w-5xl px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Store</label>
              <select
                className="border rounded px-3 py-2 min-w-[200px]"
                value={profileId}
                onChange={(e) => setProfileId(e.target.value)}
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.display_name} ({p.slug})
                  </option>
                ))}
              </select>
              <button
                className="px-3 py-2 rounded border"
                onClick={() => setNewStoreOpen(true)}
              >
                New
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 rounded border"
              onClick={() => {
                if (!selectedProfile) return;
                setEditProfileOpen(true);
              }}
              disabled={!selectedProfile}
            >
              Edit profile
            </button>
            {selectedProfile && (
              <button
                className="px-3 py-2 rounded bg-purple-600 text-white"
                onClick={openCreateProduct}
              >
                Add product
              </button>
            )}
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="mx-auto max-w-5xl px-4 pb-16 space-y-8">
        {/* TABS */}
        <nav className="flex gap-2">
          <button
            className={`px-3 py-1.5 rounded-full text-sm ${
              activeTab === 'products' ? 'bg-gray-900 text-white' : 'bg-gray-100'
            }`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button
            className={`px-3 py-1.5 rounded-full text-sm ${
              activeTab === 'categories' ? 'bg-gray-900 text-white' : 'bg-gray-100'
            }`}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </button>
        </nav>

        {/* CONTENT */}
        {loading && <div className="p-4">Loading…</div>}

        {!loading && activeTab === 'products' && (
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <article key={p.id} className="border rounded-lg overflow-hidden bg-white">
                <div className="relative aspect-square bg-gray-100">
                  {p.thumb_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.thumb_url} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-xs text-gray-500">
                      No image
                    </div>
                  )}
                  {p.price && (
                    <span className="absolute top-2 left-2 text-[11px] px-2 py-1 rounded-full bg-white/90 border">
                      {p.price}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <div className="font-medium line-clamp-2">{p.title}</div>
                  <div className="mt-3">
                    <button
                      className="px-3 py-2 rounded border w-full"
                      onClick={() => openEditProduct(p)}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        {!loading && activeTab === 'categories' && (
          <section className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-semibold">Categories</h2>
              <button
                className="px-3 py-2 rounded bg-purple-600 text-white"
                onClick={() => setCategoryModalOpen(true)}
                disabled={!selectedProfile}
              >
                Add category
              </button>
            </div>
            <ul className="mt-3 space-y-2">
              {categories.map((c) => (
                <li key={c.id} className="flex items-center justify-between border rounded p-2">
                  <div className="font-medium">{c.name}</div>
                  <button className="text-red-600" onClick={() => removeCategory(c.id)}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      {/* PROFILE EDIT MODAL */}
      {editProfileOpen && selectedProfile && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditProfileOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg">Edit profile</h2>
              <button className="p-2 rounded bg-gray-100" onClick={() => setEditProfileOpen(false)}>
                Close
              </button>
            </div>

            <ProfileForm
              profile={selectedProfile}
              onChange={(p) =>
                setProfiles((prev) => prev.map((x) => (x.id === p.id ? p : x)))
              }
              onSave={async (p) => {
                await saveProfile(p);
                setEditProfileOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* PRODUCT CREATE/EDIT MODAL */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setProductModalOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg">{editingProduct.id ? 'Edit product' : 'Add product'}</h2>
              <button className="p-2 rounded bg-gray-100" onClick={() => setProductModalOpen(false)}>
                Close
              </button>
            </div>

            <div className="grid gap-3">
              {/* Image preview + small actions */}
              <div className="grid gap-2">
                <div className="aspect-square bg-gray-100 rounded overflow-hidden">
                  {editingProduct.thumb_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={editingProduct.thumb_url}
                      alt={editingProduct.title || 'product'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-xs text-gray-500">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm border rounded px-3 py-2 cursor-pointer">
                    Upload image
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => setEditingFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  {editingProduct.id && editingProduct.thumb_url && (
                    <button
                      className="text-sm underline text-red-600"
                      onClick={async () => {
                        await deleteProductImage(editingProduct as Product);
                      }}
                    >
                      Delete image
                    </button>
                  )}
                </div>
              </div>

              <label className="text-sm">
                Title
                <input
                  className="border px-3 py-2 rounded w-full"
                  value={editingProduct.title || ''}
                  onChange={(e) => setEditingProduct((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Crochet Tulip Bouquet"
                />
              </label>

              <label className="text-sm">
                Instagram Post URL (optional)
                <input
                  className="border px-3 py-2 rounded w-full"
                  value={editingProduct.instagram_permalink || ''}
                  onChange={(e) =>
                    setEditingProduct((prev) => ({ ...prev, instagram_permalink: e.target.value }))
                  }
                  placeholder="https://www.instagram.com/p/…"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="text-sm">
                  Price (optional)
                  <input
                    className="border px-3 py-2 rounded w-full"
                    value={editingProduct.price || ''}
                    onChange={(e) => setEditingProduct((prev) => ({ ...prev, price: e.target.value }))}
                    placeholder="€25"
                  />
                </label>

                <label className="text-sm">
                  Category (optional)
                  <select
                    className="border px-3 py-2 rounded w-full"
                    value={editingProduct.category_id || ''}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({ ...prev, category_id: e.target.value || '' }))
                    }
                  >
                    <option value="">(no category)</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="text-sm">
                Caption / Description (optional)
                <textarea
                  className="border px-3 py-2 rounded w-full"
                  rows={3}
                  value={editingProduct.caption || ''}
                  onChange={(e) => setEditingProduct((prev) => ({ ...prev, caption: e.target.value }))}
                />
              </label>

              {/* Custom CTA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="text-sm">
                  Custom CTA Text (optional)
                  <input
                    className="border px-3 py-2 rounded w-full"
                    value={editingProduct.cta_label || ''}
                    onChange={(e) => setEditingProduct((prev) => ({ ...prev, cta_label: e.target.value }))}
                    placeholder='e.g., "Shop on Etsy"'
                  />
                </label>
                <label className="text-sm">
                  Custom CTA Link (optional)
                  <input
                    className="border px-3 py-2 rounded w-full"
                    value={editingProduct.cta_url || ''}
                    onChange={(e) => setEditingProduct((prev) => ({ ...prev, cta_url: e.target.value }))}
                    placeholder="https://…"
                  />
                </label>
              </div>

              <label className="text-sm inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!editingProduct.visible}
                  onChange={(e) => setEditingProduct((prev) => ({ ...prev, visible: e.target.checked }))}
                />
                Visible
              </label>

              <div className="flex gap-2 pt-2">
                <button onClick={saveProduct} className="px-3 py-2 rounded bg-purple-600 text-white flex-1">
                  Save
                </button>
                <button onClick={() => setProductModalOpen(false)} className="px-3 py-2 rounded border flex-1">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY CREATE MODAL */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCategoryModalOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg">Add category</h2>
              <button className="p-2 rounded bg-gray-100" onClick={() => setCategoryModalOpen(false)}>
                Close
              </button>
            </div>

            <div className="grid gap-3">
              <label className="text-sm">
                Name
                <input
                  className="border px-3 py-2 rounded w-full"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Flowers"
                />
              </label>

              <div className="flex gap-2 pt-2">
                <button onClick={saveNewCategory} className="px-3 py-2 rounded bg-purple-600 text-white flex-1">
                  Save category
                </button>
                <button onClick={() => setCategoryModalOpen(false)} className="px-3 py-2 rounded border flex-1">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW STORE MODAL */}
      {newStoreOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setNewStoreOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg">Create new store</h2>
              <button className="p-2 rounded bg-gray-100" onClick={() => setNewStoreOpen(false)}>
                Close
              </button>
            </div>
            <div className="grid gap-3">
              <label className="text-sm">
                Slug
                <input
                  className="border px-3 py-2 rounded w-full"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value.trim().toLowerCase())}
                  placeholder="e.g., diyart"
                />
              </label>
              <label className="text-sm">
                Display name
                <input
                  className="border px-3 py-2 rounded w-full"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="DIY Art Studio"
                />
              </label>

              <div className="flex gap-2 pt-2">
                <button onClick={createStore} className="px-3 py-2 rounded bg-purple-600 text-white flex-1">
                  Create
                </button>
                <button onClick={() => setNewStoreOpen(false)} className="px-3 py-2 rounded border flex-1">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed inset-x-0 bottom-4 flex justify-center z-50">
          <div className="bg-black text-white text-sm px-3 py-2 rounded-full">{toast}</div>
        </div>
      )}
    </>
  );
}

// ---------- Profile Form ----------
function ProfileForm({
  profile,
  onChange,
  onSave,
}: {
  profile: Profile;
  onChange: (p: Profile) => void;
  onSave: (p: Profile) => Promise<void>;
}) {
  const [local, setLocal] = useState<Profile>(profile);
  useEffect(() => setLocal(profile), [profile]);

  async function uploadAsset(file: File, kind: 'profile' | 'header') {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${profile.slug}/${kind}.${Date.now()}.${ext}`;

    const { error } = await supabaseClient.storage
      .from('product-images')
      .upload(path, file, {
        upsert: false,
        cacheControl: '3600',
        contentType: file.type || 'image/jpeg',
      });

    if (error) {
      alert(error.message);
      return null;
    }
    const { data: pub } = supabaseClient.storage.from('product-images').getPublicUrl(path);
    return pub.publicUrl as string;
  }

  return (
    <div className="grid gap-4">
      {/* Images row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Profile avatar uploader */}
        <div>
          <div className="text-sm font-medium mb-2">Profile image</div>
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 ring-1 ring-gray-200 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {local.profile_img ? (
                <img src={local.profile_img} alt="profile" className="w-20 h-20 object-cover" />
              ) : (
                <div className="w-full h-full grid place-items-center text-xs text-gray-400">
                  No image
                </div>
              )}
            </div>
            <label className="text-sm border rounded px-3 py-2 cursor-pointer">
              Upload
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0] || null;
                  if (!file) return;
                  if (file.size > 2 * 1024 * 1024) {
                    alert('Please upload an image smaller than 2 MB.');
                    return;
                  }
                  const url = await uploadAsset(file, 'profile');
                  if (url) {
                    const updated = { ...local, profile_img: url };
                    setLocal(updated);
                    onChange(updated);
                  }
                }}
              />
            </label>
            {local.profile_img && (
              <button
                className="text-sm underline text-red-600"
                onClick={() => {
                  const updated = { ...local, profile_img: '' };
                  setLocal(updated);
                  onChange(updated);
                }}
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Header banner uploader */}
        <div>
          <div className="text-sm font-medium mb-2">Header image</div>
          <div className="flex items-center gap-3">
            <div className="w-40 h-16 rounded overflow-hidden bg-gray-100 ring-1 ring-gray-200 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {local.header_img ? (
                <img src={local.header_img} alt="header" className="w-40 h-16 object-cover" />
              ) : (
                <div className="w-full h-full grid place-items-center text-xs text-gray-400">
                  No image
                </div>
              )}
            </div>
            <label className="text-sm border rounded px-3 py-2 cursor-pointer">
              Upload
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0] || null;
                  if (!file) return;
                  if (file.size > 3 * 1024 * 1024) {
                    alert('Please upload a header smaller than 3 MB.');
                    return;
                  }
                  const url = await uploadAsset(file, 'header');
                  if (url) {
                    const updated = { ...local, header_img: url };
                    setLocal(updated);
                    onChange(updated);
                  }
                }}
              />
            </label>
            {local.header_img && (
              <button
                className="text-sm underline text-red-600"
                onClick={() => {
                  const updated = { ...local, header_img: '' };
                  setLocal(updated);
                  onChange(updated);
                }}
              >
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Tip: ~1600×600px, WebP/JPEG, &lt; 1–2 MB.
          </p>
        </div>
      </div>

      {/* Basic fields */}
      <label className="text-sm">
        Display name
        <input
          className="border px-3 py-2 rounded w-full"
          value={local.display_name || ''}
          onChange={(e) => setLocal({ ...local, display_name: e.target.value })}
        />
      </label>

      <label className="text-sm">
        WhatsApp (E.164)
        <input
          className="border px-3 py-2 rounded w-full"
          value={local.wa_e164 || ''}
          onChange={(e) => setLocal({ ...local, wa_e164: e.target.value.replace(/\D/g, '') })}
          placeholder="491234567890"
        />
      </label>

      <label className="text-sm">
        Instagram handle
        <input
          className="border px-3 py-2 rounded w-full"
          value={local.ig_handle || ''}
          onChange={(e) => setLocal({ ...local, ig_handle: e.target.value })}
        />
      </label>

      <label className="text-sm">
        Bio
        <textarea
          className="border px-3 py-2 rounded w-full"
          rows={3}
          value={local.bio || ''}
          onChange={(e) => setLocal({ ...local, bio: e.target.value })}
        />
      </label>

      <div className="flex gap-2 pt-2">
        <button
          onClick={async () => {
            await onSave(local);
          }}
          className="px-3 py-2 rounded bg-purple-600 text-white flex-1"
        >
          Save
        </button>
        <button
          onClick={() => setLocal(profile)}
          className="px-3 py-2 rounded border flex-1"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

