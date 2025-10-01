-- =========================
-- ENUMS (no IF NOT EXISTS)
-- =========================
DO $$ BEGIN
  CREATE TYPE source_enum AS ENUM ('instagram');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE cta_enum AS ENUM ('dm','whatsapp');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

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
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='categories') THEN
    CREATE TABLE public.categories (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
      name text NOT NULL,
      position int DEFAULT 0
    );
  END IF;
END $$;

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
      price text,
      thumb_url text,
      ig_user text,
      visible boolean DEFAULT true,
      position int DEFAULT 0,
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

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

-- =========================
-- RLS (safe to run repeatedly)
-- =========================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_clicks ENABLE ROW LEVEL SECURITY;

-- =========================
-- POLICIES (no IF NOT EXISTS)
-- =========================
DO $$ BEGIN
  CREATE POLICY public_read_profiles
    ON public.profiles FOR SELECT
    USING (true);
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

-- =========================
-- STORAGE (bucket + policies)
-- Create bucket 'product-images' in Dashboard > Storage first.
-- Then run policies below (safe if re-run).
-- =========================
-- Public read:
DO $$ BEGIN
  CREATE POLICY public_read_product_images
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-images');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Public upload (MVP). Tighten later for auth-only writes.
DO $$ BEGIN
  CREATE POLICY public_upload_product_images
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'product-images');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
