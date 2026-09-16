-- Commission pricing: the admin's own hand-printing/painting labor price,
-- shown to customers as labor + the source file's reference price. Public
-- SELECT is required (the catalog page computes the displayed price before
-- any login/request exists); writes stay admin-only.
--
-- product_id IS NULL means "default price for every piece"; a row with a
-- specific product_id (matching CatalogItem.id from the partner feed)
-- overrides the default for just that piece.

create table commission_pricing (
  id uuid primary key default gen_random_uuid(),
  product_id text,
  service_price numeric(10, 2) not null check (service_price >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- At most one default row, and at most one override per product.
create unique index commission_pricing_default_idx on commission_pricing ((product_id IS NULL)) where product_id is null;
create unique index commission_pricing_product_idx on commission_pricing (product_id) where product_id is not null;

alter table commission_pricing enable row level security;

create policy "commission_pricing: public read" on commission_pricing for select using (true);
create policy "commission_pricing: admin write" on commission_pricing for all using (is_admin()) with check (is_admin());

create trigger commission_pricing_set_updated_at before update on commission_pricing
  for each row execute function set_updated_at();

-- Also record what the customer actually saw as the total quoted price at
-- request time (service price + file price on that day) - pricing may
-- change later, this keeps the request's own history accurate.
alter table commission_requests add column if not exists quoted_service_price numeric(10, 2);
alter table commission_requests add column if not exists quoted_total_price numeric(10, 2);
