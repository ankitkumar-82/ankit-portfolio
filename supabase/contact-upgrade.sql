-- CONTACT ME ADD-ON: safe additive migration. Existing tables/users/data are preserved.
create table if not exists public.contact_settings (
  id int primary key default 1 check (id=1),
  phone text not null default '',
  whatsapp text not null default '',
  location_url text not null default '',
  linkedin_url text not null default '',
  github_url text not null default '',
  instagram_url text not null default '',
  resume_url text not null default '',
  show_phone boolean not null default true,
  show_whatsapp boolean not null default true,
  show_location boolean not null default true,
  show_linkedin boolean not null default true,
  show_github boolean not null default true,
  show_instagram boolean not null default true,
  show_resume boolean not null default true,
  show_contact_form boolean not null default true,
  updated_at timestamptz not null default now()
);
insert into public.contact_settings(id) values (1) on conflict (id) do nothing;
alter table public.contact_messages add column if not exists is_read boolean not null default false;
alter table public.contact_settings enable row level security;
drop policy if exists "public reads contact settings" on public.contact_settings;
create policy "public reads contact settings" on public.contact_settings for select to anon, authenticated using (true);
drop policy if exists "admin manages contact settings" on public.contact_settings;
create policy "admin manages contact settings" on public.contact_settings for all to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());
drop policy if exists "admin updates message read status" on public.contact_messages;
create policy "admin updates message read status" on public.contact_messages for update to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());
grant select on public.contact_settings to anon, authenticated;
grant insert, update, delete on public.contact_settings to authenticated;
grant update on public.contact_messages to authenticated;
