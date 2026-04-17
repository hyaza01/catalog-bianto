-- Site settings table + RLS policies
-- Execute this script in Supabase SQL Editor.

create table if not exists public.site_settings (
  id integer primary key check (id = 1),
  whatsapp_number text not null default '',
  contact_phone text not null default '',
  contact_email text not null default '',
  instagram_url text not null default '',
  facebook_url text not null default '',
  linkedin_url text not null default '',
  youtube_url text not null default '',
  website_url text not null default '',
  support_link text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_select_public" on public.site_settings;
create policy "site_settings_select_public"
on public.site_settings
for select
to anon, authenticated
using (true);

drop policy if exists "site_settings_insert_authenticated" on public.site_settings;
create policy "site_settings_insert_authenticated"
on public.site_settings
for insert
to authenticated
with check (true);

drop policy if exists "site_settings_update_authenticated" on public.site_settings;
create policy "site_settings_update_authenticated"
on public.site_settings
for update
to authenticated
using (true)
with check (true);

-- Opcional e recomendado:
-- Execute tambem supabase/policies/site_settings_rpc.sql para expor get_site_settings via RPC (POST).
