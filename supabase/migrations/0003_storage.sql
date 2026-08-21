-- Storage buckets for the atelier's media (product photos, journal
-- images, the general media library). Buckets are public for reading
-- (photography is meant to be shown on the site); only admins can
-- upload, replace or delete files.

insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('post-images', 'post-images', true),
  ('media', 'media', true)
on conflict (id) do nothing;

create policy "product-images: public read"
  on storage.objects for select
  using (bucket_id = 'product-images');
create policy "product-images: admin write"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and is_admin());
create policy "product-images: admin update"
  on storage.objects for update
  using (bucket_id = 'product-images' and is_admin());
create policy "product-images: admin delete"
  on storage.objects for delete
  using (bucket_id = 'product-images' and is_admin());

create policy "post-images: public read"
  on storage.objects for select
  using (bucket_id = 'post-images');
create policy "post-images: admin write"
  on storage.objects for insert
  with check (bucket_id = 'post-images' and is_admin());
create policy "post-images: admin update"
  on storage.objects for update
  using (bucket_id = 'post-images' and is_admin());
create policy "post-images: admin delete"
  on storage.objects for delete
  using (bucket_id = 'post-images' and is_admin());

create policy "media: public read"
  on storage.objects for select
  using (bucket_id = 'media');
create policy "media: admin write"
  on storage.objects for insert
  with check (bucket_id = 'media' and is_admin());
create policy "media: admin update"
  on storage.objects for update
  using (bucket_id = 'media' and is_admin());
create policy "media: admin delete"
  on storage.objects for delete
  using (bucket_id = 'media' and is_admin());
