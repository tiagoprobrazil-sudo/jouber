-- Atelier Saint Sebastian — initial schema
-- Run this after 0002_rls.sql and 0003_storage.sql exist, or all three
-- together in order, in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

create type post_status as enum ('draft', 'published', 'scheduled');
create type order_status as enum ('pending', 'processing', 'fulfilled', 'cancelled', 'refunded');

-- ---------------------------------------------------------------------------
-- profiles (extends auth.users; role drives admin access in RLS policies)
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Journal
-- ---------------------------------------------------------------------------
create table post_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null
);

create table posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  excerpt text not null,
  content text not null default '',
  cover_image_url text,
  cover_image_alt text,
  gallery jsonb not null default '[]'::jsonb,
  category text references post_categories (slug),
  status post_status not null default 'draft',
  published_at timestamptz,
  scheduled_for timestamptz,
  author_id uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_status_published_idx on posts (status, published_at desc);
create index posts_category_idx on posts (category);

-- ---------------------------------------------------------------------------
-- Shop
-- ---------------------------------------------------------------------------
create table product_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text
);

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  description text not null default '',
  price numeric(10, 2) not null,
  compare_at_price numeric(10, 2),
  currency text not null default 'USD',
  dimensions text,
  material text,
  finish text,
  weight text,
  -- Structured shipping parcel data used to request live Shippo rates at
  -- checkout (see src/lib/shipping). Distinct from the freeform
  -- weight/dimensions display strings above.
  shipping_weight_oz numeric(10, 2),
  shipping_length_in numeric(10, 2),
  shipping_width_in numeric(10, 2),
  shipping_height_in numeric(10, 2),
  sku text unique,
  stock integer not null default 0,
  active boolean not null default true,
  featured boolean not null default false,
  customizable boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_active_featured_idx on products (active, featured);

create table product_category_map (
  product_id uuid not null references products (id) on delete cascade,
  category_slug text not null references product_categories (slug) on delete cascade,
  primary key (product_id, category_slug)
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  url text not null,
  alt text not null default '',
  position integer not null default 0
);

create index product_images_product_idx on product_images (product_id, position);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  name text not null,
  option_label text not null,
  price_modifier numeric(10, 2) default 0,
  in_stock boolean not null default true
);

-- ---------------------------------------------------------------------------
-- Reviews
-- ---------------------------------------------------------------------------
create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products (id) on delete set null,
  author text not null,
  location text,
  rating smallint not null check (rating between 1 and 5),
  body text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Customers & orders
-- ---------------------------------------------------------------------------
create table customers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles (id) on delete set null,
  full_name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers (id) on delete set null,
  customer_email text not null,
  status order_status not null default 'pending',
  subtotal numeric(10, 2) not null,
  shipping_address jsonb,
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid references products (id) on delete set null,
  product_title text not null,
  variant text,
  quantity integer not null default 1,
  unit_price numeric(10, 2) not null
);

-- ---------------------------------------------------------------------------
-- Media library (metadata only — actual bytes live in Storage buckets,
-- see 0003_storage.sql; this table tracks what's been uploaded and where
-- it's used so the admin Media screen can list/filter it).
-- ---------------------------------------------------------------------------
create table media (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  name text not null,
  used_in text not null default 'unassigned' check (used_in in ('posts', 'products', 'unassigned')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Newsletter
-- ---------------------------------------------------------------------------
create table newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

-- keep updated_at fresh
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger posts_set_updated_at before update on posts
  for each row execute function set_updated_at();
create trigger products_set_updated_at before update on products
  for each row execute function set_updated_at();
