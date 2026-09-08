-- Discount coupon system, modeled on WooCommerce's coupon feature set
-- (General / Usage restriction / Usage limits tabs) so the admin
-- experience matches what a WordPress/WooCommerce store owner already
-- knows — see src/pages/admin/CouponEditor.tsx.

create type coupon_discount_type as enum ('percent', 'fixed_cart', 'fixed_product');

create table coupons (
  id uuid primary key default gen_random_uuid(),
  -- Stored upper-cased/trimmed (see couponColumns in the repository) so
  -- lookups are case-insensitive without needing citext.
  code text not null unique,
  description text,

  -- General
  discount_type coupon_discount_type not null default 'percent',
  amount numeric(10, 2) not null default 0,
  -- "Allow free shipping" — there's no separate Free Shipping shipping
  -- method here (rates are live Shippo/Printful quotes, not flat
  -- methods), so this waives the computed shipping cost at checkout
  -- instead, the closest equivalent.
  free_shipping boolean not null default false,
  expiry_date date,

  -- Usage restriction
  minimum_amount numeric(10, 2),
  maximum_amount numeric(10, 2),
  individual_use_only boolean not null default false,
  exclude_sale_items boolean not null default false,
  product_ids uuid[] not null default '{}',
  excluded_product_ids uuid[] not null default '{}',
  product_categories text[] not null default '{}',
  excluded_product_categories text[] not null default '{}',
  -- Comma-separated in the admin UI; each entry may be a full address or
  -- a wildcard like "*@ateliersaintsebastian.com", same as WooCommerce.
  allowed_emails text[] not null default '{}',

  -- Usage limits
  usage_limit integer,
  usage_limit_per_user integer,
  limit_usage_to_x_items integer,
  usage_count integer not null default 0,

  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index coupons_code_idx on coupons (code);

create trigger coupons_set_updated_at before update on coupons
  for each row execute function set_updated_at();

-- One row per redemption, written by finalizeOrder once an order is
-- created — lets usage_limit_per_user be enforced (count rows for this
-- coupon + email) and gives the admin a redemption history.
create table coupon_usage (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references coupons (id) on delete cascade,
  order_id uuid references orders (id) on delete set null,
  email text not null,
  discount_amount numeric(10, 2) not null,
  created_at timestamptz not null default now()
);

create index coupon_usage_coupon_idx on coupon_usage (coupon_id);
create index coupon_usage_email_idx on coupon_usage (coupon_id, email);

-- Applied coupon(s) carried from checkout through to the finished order.
-- Array because — like WooCommerce — more than one non-individual-use
-- coupon can be stacked in the same cart.
alter table checkout_drafts add column coupon_codes text[] not null default '{}';
alter table checkout_drafts add column discount_amount numeric(10, 2) not null default 0;
-- Per-coupon breakdown ([{ code, discountAmount }, ...]) computed by
-- create-payment-intent — finalizeOrder replays this into coupon_usage
-- rows (and bumps each coupon's usage_count) once the order is written.
alter table checkout_drafts add column coupon_discounts jsonb not null default '[]'::jsonb;

alter table orders add column coupon_codes text[] not null default '{}';
alter table orders add column discount_amount numeric(10, 2) not null default 0;

-- RLS ------------------------------------------------------------------
-- Coupons are never read directly by public clients — the storefront
-- only ever reaches them through the validate-coupon Edge Function
-- (service role), so a shopper can't list active codes or inspect their
-- rules by querying the table. Admins manage them at /admin/coupons.
alter table coupons enable row level security;
create policy "coupons: admin read" on coupons for select using (is_admin());
create policy "coupons: admin write" on coupons for all using (is_admin()) with check (is_admin());

alter table coupon_usage enable row level security;
create policy "coupon_usage: admin read" on coupon_usage for select using (is_admin());
-- Inserts only ever happen via finalizeOrder (service role) — no insert
-- policy needed for any client role.
