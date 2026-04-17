-- Add support for featured categories in Admin/Home.
-- Execute this in Supabase SQL Editor.

alter table if exists public.categories
add column if not exists is_featured boolean not null default false;

-- Optional: speed up featured category listings.
create index if not exists idx_categories_is_featured
on public.categories (is_featured);
