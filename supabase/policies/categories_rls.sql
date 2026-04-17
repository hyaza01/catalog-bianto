-- Categories RLS policies for Admin Panel
-- Execute this in Supabase SQL Editor.

alter table if exists public.categories enable row level security;

-- Public read (site needs to list categories)
drop policy if exists "categories_select_public" on public.categories;
create policy "categories_select_public"
on public.categories
for select
to anon, authenticated
using (true);

-- Admin panel writes (logged-in users)
drop policy if exists "categories_insert_authenticated" on public.categories;
create policy "categories_insert_authenticated"
on public.categories
for insert
to authenticated
with check (true);

drop policy if exists "categories_update_authenticated" on public.categories;
create policy "categories_update_authenticated"
on public.categories
for update
to authenticated
using (true)
with check (true);

drop policy if exists "categories_delete_authenticated" on public.categories;
create policy "categories_delete_authenticated"
on public.categories
for delete
to authenticated
using (true);

-- Optional hardening by admin email (uncomment and replace with your email):
-- drop policy if exists "categories_manage_by_email" on public.categories;
-- create policy "categories_manage_by_email"
-- on public.categories
-- for all
-- to authenticated
-- using ((auth.jwt() ->> 'email') = 'you@example.com')
-- with check ((auth.jwt() ->> 'email') = 'you@example.com');
