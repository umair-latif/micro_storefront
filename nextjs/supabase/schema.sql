-- =========================
-- ENUMS (no IF NOT EXISTS)
-- =========================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE source_enum AS ENUM ('instagram');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE cta_enum AS ENUM ('dm','whatsapp','instagram','custom');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TYPE cta_enum ADD VALUE IF NOT EXISTS 'instagram';
ALTER TYPE cta_enum ADD VALUE IF NOT EXISTS 'custom';

DO $$ BEGIN
  CREATE TYPE src_enum AS ENUM ('instagram','tiktok','other','unknown');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================
-- TABLES (guarded without IF NOT EXISTS)
-- =========================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='profiles') THEN
    CREATE TABLE public.profiles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      display_name text NOT NULL,
      bio text DEFAULT '',
      ig_handle text,
      tt_handle text,
      wa_e164 text,
      slug text UNIQUE NOT NULL,
      profile_img text,
      header_img text,
      is_public boolean DEFAULT true,
      socials_config jsonb DEFAULT '{}'::jsonb,
      storefront_config jsonb DEFAULT '{}'::jsonb,
      owner_uid uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS header_img text,
  ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS socials_config jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS storefront_config jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS owner_uid uuid REFERENCES auth.users(id) ON DELETE CASCADE;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='categories') THEN
    CREATE TABLE public.categories (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
      name text NOT NULL,
      cover_img text,
      position int DEFAULT 0
    );
  END IF;
END $$;

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS cover_img text;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='products') THEN
    CREATE TABLE public.products (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
      category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
      source source_enum DEFAULT 'instagram',
      instagram_permalink text,
      title text NOT NULL,
      caption text DEFAULT '',
      price numeric,
      thumb_url text,
      ig_user text,
      cta_label text,
      cta_url text,
      visible boolean DEFAULT true,
      position int DEFAULT 0,
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

ALTER TABLE public.products
  ALTER COLUMN price TYPE numeric
    USING NULLIF(regexp_replace(price::text, '[^0-9.\-]', '', 'g'), '')::numeric,
  ADD COLUMN IF NOT EXISTS cta_label text,
  ADD COLUMN IF NOT EXISTS cta_url text;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='analytics_clicks') THEN
    CREATE TABLE public.analytics_clicks (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
      product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
      cta cta_enum NOT NULL,
      source src_enum NOT NULL,
      ua text,
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='analytics_views') THEN
    CREATE TABLE public.analytics_views (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
      ua text,
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='analytics_cta_clicks') THEN
    CREATE TABLE public.analytics_cta_clicks (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
      product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
      label text,
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- =========================
-- RLS (safe to run repeatedly)
-- =========================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_cta_clicks ENABLE ROW LEVEL SECURITY;

-- =========================
-- POLICIES (no IF NOT EXISTS)
-- =========================
DO $$ BEGIN
  CREATE POLICY public_read_profiles
    ON public.profiles FOR SELECT
    USING (is_public = true OR owner_uid = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY public_read_categories
    ON public.categories FOR SELECT
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY public_read_products
    ON public.products FOR SELECT
    USING (visible = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY owner_insert_profiles
    ON public.profiles FOR INSERT
    WITH CHECK (owner_uid = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY owner_update_profiles
    ON public.profiles FOR UPDATE
    USING (owner_uid = auth.uid())
    WITH CHECK (owner_uid = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY owner_write_categories
    ON public.categories FOR ALL
    USING (EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = categories.profile_id AND p.owner_uid = auth.uid()
    ))
    WITH CHECK (EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = categories.profile_id AND p.owner_uid = auth.uid()
    ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY owner_write_products
    ON public.products FOR ALL
    USING (EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = products.profile_id AND p.owner_uid = auth.uid()
    ))
    WITH CHECK (EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = products.profile_id AND p.owner_uid = auth.uid()
    ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY public_insert_analytics_clicks
    ON public.analytics_clicks FOR INSERT
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY public_insert_analytics_views
    ON public.analytics_views FOR INSERT
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY public_insert_analytics_cta_clicks
    ON public.analytics_cta_clicks FOR INSERT
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================
-- STORAGE (bucket + policies)
-- Create buckets 'product-images', 'profile-images', and 'category-images'
-- in Dashboard > Storage first.
-- Then run policies below (safe if re-run).
-- =========================
-- Public read:
DO $$ BEGIN
  CREATE POLICY public_read_storefront_images
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('product-images', 'profile-images', 'category-images'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Authenticated upload/update/delete for admin-owned storefront assets.
DO $$ BEGIN
  CREATE POLICY authenticated_upload_storefront_images
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id IN ('product-images', 'profile-images', 'category-images')
      AND auth.role() = 'authenticated'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY authenticated_update_storefront_images
    ON storage.objects FOR UPDATE
    USING (
      bucket_id IN ('product-images', 'profile-images', 'category-images')
      AND auth.role() = 'authenticated'
    )
    WITH CHECK (
      bucket_id IN ('product-images', 'profile-images', 'category-images')
      AND auth.role() = 'authenticated'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY authenticated_delete_storefront_images
    ON storage.objects FOR DELETE
    USING (
      bucket_id IN ('product-images', 'profile-images', 'category-images')
      AND auth.role() = 'authenticated'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
