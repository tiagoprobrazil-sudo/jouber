-- Lets a product carry one .mp4 video (e.g. a hand-finishing detail or a
-- 360° turn), shown alongside the photo gallery. A dedicated bucket keeps
-- the 20MB cap and mp4-only restriction separate from product-images'
-- rules (Storage enforces both server-side, not just the admin form's own
-- client-side check).

alter table products add column video_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-videos', 'product-videos', true, 20971520, array['video/mp4'])
on conflict (id) do nothing;

create policy "product-videos: public read"
  on storage.objects for select
  using (bucket_id = 'product-videos');
create policy "product-videos: admin write"
  on storage.objects for insert
  with check (bucket_id = 'product-videos' and is_admin());
create policy "product-videos: admin update"
  on storage.objects for update
  using (bucket_id = 'product-videos' and is_admin());
create policy "product-videos: admin delete"
  on storage.objects for delete
  using (bucket_id = 'product-videos' and is_admin());
