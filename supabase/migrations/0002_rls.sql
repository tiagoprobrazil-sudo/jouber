-- Row Level Security for Atelier Saint Sebastian.
-- Public visitors can read published content and browsable shop data.
-- Only profiles with role = 'admin' can write, and only owners (or
-- admins) can read their own orders/customer records.

create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer;

-- profiles -------------------------------------------------------------
alter table profiles enable row level security;

create policy "profiles: self read" on profiles
  for select using (auth.uid() = id or is_admin());
create policy "profiles: self update" on profiles
  for update using (auth.uid() = id);

-- post_categories / product_categories ---------------------------------
alter table post_categories enable row level security;
alter table product_categories enable row level security;

create policy "post_categories: public read" on post_categories for select using (true);
create policy "post_categories: admin write" on post_categories for all using (is_admin()) with check (is_admin());

create policy "product_categories: public read" on product_categories for select using (true);
create policy "product_categories: admin write" on product_categories for all using (is_admin()) with check (is_admin());

-- posts ------------------------------------------------------------------
alter table posts enable row level security;

create policy "posts: public read published" on posts
  for select using (status = 'published' or is_admin());
create policy "posts: admin write" on posts
  for all using (is_admin()) with check (is_admin());

-- products / images / variants -------------------------------------------
alter table products enable row level security;
alter table product_category_map enable row level security;
alter table product_images enable row level security;
alter table product_variants enable row level security;

create policy "products: public read active" on products
  for select using (active or is_admin());
create policy "products: admin write" on products
  for all using (is_admin()) with check (is_admin());

create policy "product_category_map: public read" on product_category_map for select using (true);
create policy "product_category_map: admin write" on product_category_map for all using (is_admin()) with check (is_admin());

create policy "product_images: public read" on product_images for select using (true);
create policy "product_images: admin write" on product_images for all using (is_admin()) with check (is_admin());

create policy "product_variants: public read" on product_variants for select using (true);
create policy "product_variants: admin write" on product_variants for all using (is_admin()) with check (is_admin());

-- reviews ------------------------------------------------------------------
alter table reviews enable row level security;

create policy "reviews: public read" on reviews for select using (true);
create policy "reviews: admin write" on reviews for all using (is_admin()) with check (is_admin());

-- customers / orders / order_items -----------------------------------------
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "customers: owner or admin read" on customers
  for select using (profile_id = auth.uid() or is_admin());
create policy "customers: admin write" on customers
  for all using (is_admin()) with check (is_admin());

create policy "orders: owner or admin read" on orders
  for select using (
    is_admin() or customer_id in (select id from customers where profile_id = auth.uid())
  );
create policy "orders: admin write" on orders
  for all using (is_admin()) with check (is_admin());

create policy "order_items: owner or admin read" on order_items
  for select using (
    is_admin() or order_id in (
      select o.id from orders o
      join customers c on c.id = o.customer_id
      where c.profile_id = auth.uid()
    )
  );
create policy "order_items: admin write" on order_items
  for all using (is_admin()) with check (is_admin());

-- media -----------------------------------------------------------------
alter table media enable row level security;

create policy "media: admin read" on media for select using (is_admin());
create policy "media: admin write" on media for all using (is_admin()) with check (is_admin());

-- newsletter_subscribers ----------------------------------------------------
alter table newsletter_subscribers enable row level security;

create policy "newsletter: anyone can subscribe" on newsletter_subscribers
  for insert with check (true);
create policy "newsletter: admin read" on newsletter_subscribers
  for select using (is_admin());
