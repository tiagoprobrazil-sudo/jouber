-- Product review system: moderation queue + verified-purchase review
-- requests sent automatically a configurable number of days after
-- purchase (see store_settings key 'review_request_delay_days', default
-- 7 — the /admin/settings Reviews panel edits this).

alter table reviews add column status text not null default 'pending' check (status in ('pending', 'approved', 'rejected'));
alter table reviews add column email text;
alter table reviews add column is_verified_purchase boolean not null default false;
alter table reviews add column order_item_id uuid references order_items (id) on delete set null;

-- Public used to be able to read every review regardless of moderation
-- state — restrict to approved (admins still see everything, for the
-- moderation queue).
drop policy "reviews: public read" on reviews;
create policy "reviews: public read approved" on reviews for select using (status = 'approved' or is_admin());
-- Inserts always go through the submit-review Edge Function (service
-- role, bypasses RLS) so both the open and verified-purchase paths can
-- be validated server-side — no public insert policy needed.

-- Tracks the emailed review-request link per purchased line item —
-- one row per order_item, created (and the email sent) by the
-- send-review-requests cron job once enough time has passed since the
-- order. The token is the review page's URL param (/review/:token);
-- reviewed_at is set once that token has produced a review, so it can't
-- be reused. Edge-Function/service-role only, never exposed via RLS to
-- any client role.
create table review_requests (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null unique references order_items (id) on delete cascade,
  product_id uuid references products (id) on delete set null,
  email text not null,
  author_name text,
  token text not null unique,
  sent_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table review_requests enable row level security;

-- pg_net lets a pg_cron job call the send-review-requests Edge Function
-- over HTTP on a schedule (same idea as 0004's scheduled-publishing job,
-- but that one was a pure SQL mutation — this one needs to call Resend,
-- so it has to be an Edge Function).
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'send-review-requests',
  '0 15 * * *', -- once daily
  $$
  select net.http_post(
    url := 'https://njzcaitifymnkjydnqxt.supabase.co/functions/v1/send-review-requests',
    headers := jsonb_build_object('Content-Type', 'application/json', 'X-Cron-Secret', 's9jFHG6YygIeYTUU5aM_WH72Iaxwq7XX'),
    body := '{}'::jsonb
  );
  $$
);

insert into store_settings (key, value) values
  ('review_request_delay_days', '7'::jsonb)
on conflict (key) do nothing;
