-- Create analytics tables used by the Next.js route handlers.
-- Safe to run repeatedly.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.analytics_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  ua text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.analytics_cta_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  label text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.analytics_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_cta_clicks ENABLE ROW LEVEL SECURITY;

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

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON public.analytics_views TO anon, authenticated;
GRANT INSERT ON public.analytics_cta_clicks TO anon, authenticated;

-- Refresh PostgREST's schema cache so the app can see new tables immediately.
NOTIFY pgrst, 'reload schema';
