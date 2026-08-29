-- Admin-editable site copy (Hero, Intro, Artist bio, policy pages, etc).
-- Public read (it's rendered on public pages), admin-only write. Distinct
-- from store_settings, which is admin-only to read too.

create table site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table site_content enable row level security;

create policy "site_content: public read" on site_content for select using (true);
create policy "site_content: admin write" on site_content for all using (is_admin()) with check (is_admin());

create trigger site_content_set_updated_at before update on site_content
  for each row execute function set_updated_at();
