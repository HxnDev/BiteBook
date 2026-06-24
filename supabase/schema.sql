-- BiteBook — Supabase schema, RLS and storage setup.
-- A shared, no-login family recipe book: anyone with the app can read/write.
-- Paste this whole file into the Supabase SQL Editor and click "Run".
-- Safe to run more than once.

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Recipes
-- Ingredients are stored as JSONB on the recipe (matches the app's data model:
-- display-only lines with manual macros). Keeps reads/writes to a single row.
-- ---------------------------------------------------------------------------
create table if not exists public.recipes (
  id                     uuid primary key default gen_random_uuid(),
  title                  text not null,
  description            text not null default '',
  category               text not null default 'Other',
  tags                   text[] not null default '{}',
  image_url              text,
  ingredients            jsonb not null default '[]'::jsonb,
  instructions           text[] not null default '{}',
  notes                  text not null default '',
  -- Macros are stored per 100g.
  calories               numeric,
  protein                numeric,
  carbs                  numeric,
  fat                    numeric,
  is_favorite            boolean not null default false,
  times_cooked           integer not null default 0,
  last_cooked_at         timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- Drop legacy columns if an older table already exists (macros are per 100g now).
alter table public.recipes drop column if exists servings;
alter table public.recipes drop column if exists total_cooked_weight_g;
alter table public.recipes drop column if exists prep_time_min;
alter table public.recipes drop column if exists cook_time_min;

create index if not exists recipes_created_at_idx on public.recipes (created_at desc);

-- Keep updated_at fresh on every update.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists recipes_set_updated_at on public.recipes;
create trigger recipes_set_updated_at
  before update on public.recipes
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Open access: shared family book, anyone with the app can read/write.
-- ---------------------------------------------------------------------------
alter table public.recipes enable row level security;

drop policy if exists "Anyone can use recipes" on public.recipes;
create policy "Anyone can use recipes"
  on public.recipes
  for all
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- Storage bucket for recipe photos (public read + write).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read recipe images" on storage.objects;
create policy "Public read recipe images"
  on storage.objects for select
  using (bucket_id = 'recipe-images');

drop policy if exists "Anyone manage recipe images" on storage.objects;
create policy "Anyone manage recipe images"
  on storage.objects for all
  using (bucket_id = 'recipe-images')
  with check (bucket_id = 'recipe-images');
