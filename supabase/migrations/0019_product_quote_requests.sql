-- Quote requests submitted from a `quote_only` product's page (the
-- "Request a Quote" form — see src/components/product/ProductQuoteModal.tsx).
-- Distinct from commission_requests (0016), which is for the separate
-- "Commission a Piece" flow sourced from an external catalog (Exú Caveira).

create table if not exists product_quote_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'new'
    check (status in ('new', 'contacted', 'quoted', 'closed')),

  -- snapshot of the product at request time (kept even if the product is
  -- later edited/deleted); product_id is nullable for that reason.
  product_id uuid references products (id) on delete set null,
  product_title text not null,
  product_url text not null,
  product_image text,
  variant_name text,

  customer_name text not null,
  customer_email text not null,
  customer_phone text,

  desired_size text not null,
  finish text not null,
  customization boolean not null default false,
  zip_code text,
  message text,

  admin_notes text
);

create index if not exists product_quote_requests_status_idx on product_quote_requests (status);
create index if not exists product_quote_requests_created_at_idx on product_quote_requests (created_at desc);
create index if not exists product_quote_requests_product_id_idx on product_quote_requests (product_id);

alter table product_quote_requests enable row level security;

-- Admin-only: rows are created by the create-product-quote-request edge
-- function using the service-role key (bypasses RLS), same pattern as
-- create-commission-request / create-order. No anon insert policy needed.
create policy "product_quote_requests: admin read" on product_quote_requests
  for select using (is_admin());
create policy "product_quote_requests: admin write" on product_quote_requests
  for all using (is_admin()) with check (is_admin());
