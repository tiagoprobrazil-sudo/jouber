-- Commission requests: customers asking the atelier to hand-print/finish a
-- 3D model sourced from a partner catalog (currently Exú Caveira's public
-- product API — see src/lib/commissions). Distinct from `orders`, which are
-- the atelier's own Printful/shop checkout flow.

create table if not exists commission_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'new'
    check (status in ('new', 'contacted', 'in_progress', 'completed', 'cancelled')),

  -- snapshot of the catalog item at request time (source site may change/remove it later)
  source text not null default 'exucaveira',
  source_product_id text not null,
  source_product_name text not null,
  source_product_category text,
  source_product_price numeric,
  source_product_image text,
  source_product_link text not null,

  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  message text,

  admin_notes text
);

create index if not exists commission_requests_status_idx on commission_requests (status);
create index if not exists commission_requests_created_at_idx on commission_requests (created_at desc);

alter table commission_requests enable row level security;

-- Admin-only: rows are created by the create-commission-request edge
-- function using the service-role key (bypasses RLS), same pattern as
-- create-order. No anon insert policy is needed or wanted here.
create policy "commission_requests: admin read" on commission_requests
  for select using (is_admin());
create policy "commission_requests: admin write" on commission_requests
  for all using (is_admin()) with check (is_admin());
