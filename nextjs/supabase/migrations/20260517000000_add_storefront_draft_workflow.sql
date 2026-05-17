alter table public.profiles
add column if not exists storefront_config_draft jsonb default null;

alter table public.profiles
add column if not exists storefront_published_at timestamptz default null;

alter table public.profiles
add column if not exists storefront_draft_updated_at timestamptz default null;

notify pgrst, 'reload schema';
