-- Auto-publish posts saved with status = 'scheduled' once their
-- scheduled_for time arrives. Runs entirely in Postgres via pg_cron —
-- no Edge Function needed, since this is a pure data mutation.

create extension if not exists pg_cron with schema extensions;

select cron.schedule(
  'publish-scheduled-posts',
  '*/5 * * * *', -- every 5 minutes
  $$
  update posts
  set status = 'published',
      published_at = coalesce(published_at, scheduled_for, now())
  where status = 'scheduled' and scheduled_for is not null and scheduled_for <= now();
  $$
);
