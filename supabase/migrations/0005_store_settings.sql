-- Admin-editable, non-secret store configuration (Shippo ship-from
-- address, store profile). Real API secrets (SHIPPO_API_KEY,
-- STRIPE_SECRET_KEY) stay as Edge Function secrets — never in a
-- client-writable table — see supabase/README.md.

create table store_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table store_settings enable row level security;

create policy "store_settings: admin read" on store_settings for select using (is_admin());
create policy "store_settings: admin write" on store_settings for all using (is_admin()) with check (is_admin());

create trigger store_settings_set_updated_at before update on store_settings
  for each row execute function set_updated_at();

-- Seed the ship-from address already set as the SHIPPO_ADDRESS_FROM
-- secret (see supabase/README.md section 9), so the admin panel starts
-- populated instead of empty. The shipping-rates function is being
-- switched to read this table instead of that secret.
insert into store_settings (key, value) values
  ('shippo_address_from', '{
    "name": "Atelier Saint Sebastian",
    "street1": "9 Johnson St",
    "city": "Worcester",
    "state": "MA",
    "zip": "01604",
    "country": "US",
    "phone": "+17743460950",
    "email": "jouber.costa@icloud.com"
  }'::jsonb),
  ('store_profile', '{"name": "Atelier Saint Sebastian", "currency": "USD"}'::jsonb)
on conflict (key) do nothing;
