-- RPC helper para leitura de configuracoes globais via POST.
-- Objetivo: reduzir risco de cache intermediario agressivo em GET por User-Agent.
-- Execute no Supabase SQL Editor apos site_settings_rls.sql.

create or replace function public.get_site_settings()
returns table (
  id integer,
  whatsapp_number text,
  contact_phone text,
  contact_email text,
  instagram_url text,
  facebook_url text,
  linkedin_url text,
  youtube_url text,
  website_url text,
  support_link text,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    s.id,
    s.whatsapp_number,
    s.contact_phone,
    s.contact_email,
    s.instagram_url,
    s.facebook_url,
    s.linkedin_url,
    s.youtube_url,
    s.website_url,
    s.support_link,
    s.updated_at
  from public.site_settings as s
  where s.id = 1;
$$;

revoke all on function public.get_site_settings() from public;
grant execute on function public.get_site_settings() to anon, authenticated;
