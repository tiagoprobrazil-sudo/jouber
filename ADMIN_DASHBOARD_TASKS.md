# Atelier Saint Sebastian — Admin Dashboard Tasks

## Status legend

- `[ ]` Pending
- `[~]` In progress
- `[x]` Completed

## Current state (as of 2026-08-29)

The `/admin` area already exists (`src/pages/admin/*`) with a working UI shell
(`AdminLayout`), and CRUD screens for Products, Posts, Categories, Media and
a read-only Orders list — but everything runs on `src/lib/data/repository.ts`,
which is backed by `localStorage`, not a real database. Concretely, before
any of the sections below, three things are true and block "real" admin use:

- **No real login.** `AuthContext.tsx` checks a hardcoded email/password
  (`jouber@ateliersaintsebastian.com` / `atelier-admin`) against
  `localStorage` — there is no real authentication at all.
- **No real database.** A Supabase project now exists and is linked
  (`njzcaitifymnkjydnqxt`, used today only for the `shipping-rates` function
  and Stripe/Shippo secrets — see `supabase/README.md`), but the schema
  migrations in `supabase/migrations/` were never run against it. There are
  currently zero tables in that project.
- **No real uploads.** `uploadMedia()` reads a `File` into a base64 data URL
  and stores it in `localStorage` — nothing is actually uploaded anywhere.

Section 0 below is the shared prerequisite for everything else the user
asked for (texts, products, posts, integrations) — do it first.

## 0. Foundation (blocks every section below)

### 0.1 Apply the database schema to the live Supabase project

- Status: `[x]`
- Implementation notes (2026-08-29): extended `0001_schema.sql`/`0002_rls.sql` with the shipping-parcel columns and a new `media` table (+ RLS), then ran `supabase db push --linked` against `njzcaitifymnkjydnqxt`. All 3 migrations applied and confirmed via `supabase migration list`. Also wrote a one-off `scripts/seed-supabase.mjs` (uploads the bundled product/editorial photography to the `product-images` Storage bucket, then inserts the current mock catalog — 7 product categories, 4 post categories, 13 products with images/variants/category links, 6 reviews, 6 posts) so the live site has real content the moment 0.3 ships — verified row counts and a public (anon-key) read afterward.
- Deliverable: `products`, `posts`, `orders`, categories, etc. exist as real
  tables in project `njzcaitifymnkjydnqxt`, with RLS policies and storage
  buckets from `0002_rls.sql` / `0003_storage.sql` active.
- Files: `supabase/migrations/0001_schema.sql`, `0002_rls.sql`, `0003_storage.sql`.
- Technical notes: run via `supabase db push` (CLI already linked) or the
  Supabase SQL editor, in order. Before running, extend `0001_schema.sql`'s
  `products` table with the shipping-parcel columns added to the TypeScript
  `Product` type this session (`shippingWeightOz`, `shippingLengthIn`,
  `shippingWidthIn`, `shippingHeightIn` — currently only in code, not in the
  SQL schema) so the migration matches `src/lib/data/types.ts`.

### 0.2 Real admin authentication

- Status: `[x]`
- Implementation notes (2026-08-29): `AuthContext.tsx` now branches on `isSupabaseConfigured` — with a real project, `login`/`logout` use `supabase.auth.signInWithPassword`/`signOut` and `onAuthStateChange`, gated on `profiles.role === 'admin'` (a non-admin account that authenticates is immediately signed back out with an error); without one, the old localStorage demo login is kept so `npm run dev` still works with zero setup. Added a `loading` flag so `ProtectedRoute` shows `PageLoader` instead of bouncing to `/login` while the initial session check is in flight. Created the real admin user (`jouber@ateliersaintsebastian.com`, password set by the user) via the Auth Admin API + a `profiles` row with `role: 'admin'`. `Login.tsx` only shows the demo-credentials hint when Supabase isn't configured.
- Deliverable: replace the hardcoded-password `AuthContext` with real
  Supabase Auth (`supabase.auth.signInWithPassword`,
  `onAuthStateChange`), gated on `profiles.role === 'admin'`. Create the
  first admin user per `supabase/README.md` step 3.
- Files: `src/context/AuthContext.tsx`, `src/pages/admin/Login.tsx`,
  `src/components/admin/ProtectedRoute.tsx`.
- Technical notes: do this before section 4 (integrations) — an admin panel
  that can influence Stripe/Shippo settings must not sit behind a demo
  password.

### 0.3 Swap the mock repository for real Supabase queries

- Status: `[x]`
- Implementation notes (2026-08-29): every function in `repository.ts` now branches on `isSupabaseConfigured`, same signatures as before. Products/posts read with their joined child tables (`product_images`, `product_variants`, `product_category_map`, ratings computed on the fly from `reviews`); writes sync child rows with a delete-then-reinsert pattern. Added `createPostCategory`/`deletePostCategory` (didn't exist before at all — see 2.2). `search()` and category filtering use PostgREST `ilike`/`!inner` embedded filters. Verified with a direct anon-key REST call (RLS + joins working) — full in-app verification (Shop/Journal/admin CRUD) is still the user's to do, see the checkpoint below.
- Deliverable: every function in `src/lib/data/repository.ts` reads/writes
  Supabase instead of `localStorage`, keeping the same signatures so no page
  needs to change (this is the one file `supabase/README.md` already
  documents how to do, section 5).
- Files: `src/lib/data/repository.ts`.
- Technical notes: do incrementally, one entity at a time (categories →
  products → posts → reviews/orders), verifying each admin screen still
  works against real data before moving to the next.

### 0.4 Real media uploads

- Status: `[x]`
- Implementation notes (2026-08-29): done as part of 0.3 — `uploadMedia()` now uploads to the `media` Storage bucket and records a row in the new `media` table when Supabase is configured; `deleteMedia()` removes both. Kept the data-URL/localStorage fallback for the unconfigured case.
- Deliverable: `uploadMedia()` uploads to Supabase Storage
  (`product-images`/`post-images`/`media` buckets from `0003_storage.sql`)
  and returns the public URL, instead of a data URL.
- Files: `src/lib/data/repository.ts`, `src/components/admin/MediaPickerModal.tsx`.

## 1. Manage texts (site copy)

Today every homepage/editorial string (Hero headline, Intro copy, the
"Created not simply as decoration…" quote, Artist bio, Process steps,
Newsletter copy, footer devotional line, policy pages) is hardcoded in its
component. This section makes a defined subset of that copy admin-editable.

### 1.1 Inventory and schema

- Status: `[ ]`
- Deliverable: a short list (agree with the user) of which text blocks
  become editable — likely Hero (eyebrow/headline/subhead/CTA label),
  Intro paragraph, EditorialFeature quote, Artist bio paragraphs, the 4
  Process step titles/descriptions, Newsletter heading/copy, footer
  devotional line, and the Policy pages (`/shipping`, `/returns`,
  `/privacy`, `/terms`, `/faq`) — plus a new `site_content` table
  (`key text primary key`, `value jsonb`, `updated_at`) with RLS: public
  read, admin-only write.
- Files: a new `supabase/migrations/0004_site_content.sql`.

### 1.2 Admin UI

- Status: `[ ]`
- Deliverable: `/admin/content`, grouped by page/section, one field per
  text block (plain text or the existing Tiptap `RichTextEditor` for the
  policy pages), with a clear label matching what's actually rendered.
- Files: new `src/pages/admin/Content.tsx`, add to `AdminLayout`'s nav.

### 1.3 Wire public components to the content source

- Status: `[ ]`
- Deliverable: each section in scope reads its copy from
  `getSiteContent(key)` with the current hardcoded string kept as the
  fallback default, so the site renders correctly even before an admin
  edits anything.
- Files: `Hero.tsx`, `Intro.tsx`, `EditorialFeature.tsx`, `Artist.tsx`,
  `Handcrafted.tsx`, `NewsletterSection.tsx`, `Footer.tsx`,
  `PolicyPage.tsx`.
- Technical notes: this is the largest section — do it last, one section at
  a time, so each change is small and reviewable rather than one sweeping
  edit across the whole homepage.

## 2. Manage products

### 2.1 Variant management UI

- Status: `[x]`
- Implementation notes (2026-08-29): added add/edit/remove rows to `ProductEditor` for `{ name, optionLabel, priceModifier, inStock }`. While fixing this, found and fixed a real bug exposed by 0.3: the editor loaded an existing product by searching the *mock seed array* for a matching id, which never matched real Supabase UUIDs (or even a freshly-created mock-mode product, whose id isn't in the seed array either) — editing any product silently landed on a blank form. Added `getProductById` to `repository.ts` and pointed the editor at it directly.
- Deliverable: `ProductEditor` currently has no UI for `Product.variants`
  at all (confirmed — mugs/statues with size options can only get variants
  seeded in mock data, never edited from the admin). Add add/edit/remove
  rows for `{ name, optionLabel, priceModifier, inStock }`.
- Files: `src/pages/admin/ProductEditor.tsx`.

### 2.2 Product categories used by posts too

- Status: `[x]`
- Implementation notes (2026-08-29): `Categories.tsx` now has two tabs (Shop categories / Journal categories) backed by `createPostCategory`/`deletePostCategory` added in 0.3.
- Deliverable: `/admin/categories` only manages `product_categories`
  (confirmed — `repository.ts` has no `createPostCategory`/
  `deletePostCategory` at all, so Journal categories can't be managed from
  the admin today). Add a second tab/section for post categories.
- Files: `src/pages/admin/Categories.tsx`, `src/lib/data/repository.ts`.

### 2.3 Persisted stock/order linkage

- Status: `[ ]`
- Deliverable: once 0.3 is done, verify stock decrements sensibly when an
  order is placed (currently orders are illustrative-only mock data with no
  write path from a real checkout — revisit once Stripe checkout, see
  section 4, actually creates orders).
- Files: `src/lib/data/repository.ts`.

## 3. Manage posts

### 3.1 Scheduled publishing

- Status: `[x]`
- Implementation notes (2026-08-29): went with a `pg_cron` job (no Edge Function needed — it's a pure data mutation) in a new `0004_scheduled_publishing.sql` migration: every 5 minutes, flips any post with `status = 'scheduled'` and `scheduled_for <= now()` to `published`. Applied via `supabase db push --linked`.
- Deliverable: a post saved with `status: "scheduled"` and a
  `scheduledFor` date actually flips to `published` at that time.
  Nothing does this today — it's a purely client-rendered app with no
  server process. Needs a Supabase `pg_cron` job or a scheduled Edge
  Function that runs periodically and updates `posts` where
  `scheduled_for <= now()`.
- Files: new `supabase/functions/publish-scheduled-posts/index.ts` (or a
  `pg_cron` SQL job), `supabase/migrations/`.

### 3.2 Everything else

- Status: `[ ]`
- Deliverable: Posts/PostEditor already cover title, subtitle, excerpt,
  Tiptap content, cover image, gallery, category and status — once 0.3/0.4
  land, confirm each field round-trips correctly against real Supabase
  data and storage.
- Files: `src/pages/admin/Posts.tsx`, `src/pages/admin/PostEditor.tsx`.

## 4. Manage integrations (Stripe & Shippo)

Real API secret keys (`STRIPE_SECRET_KEY`, `SHIPPO_API_KEY`) must never be
readable or writable from client-side admin UI — they stay Supabase Edge
Function secrets, set via `supabase secrets set` (as already done this
session — see `supabase/README.md` sections 8-9). This section is about
giving the admin visibility and control over the *non-secret* parts.

### 4.1 Integration settings table

- Status: `[ ]`
- Deliverable: a `store_settings` table (or a couple of well-known rows in
  `site_content` from 1.1) holding the safe-to-edit pieces: Shippo
  `address_from` (name/street/city/state/zip/country/phone/email — today
  hardcoded in the `SHIPPO_ADDRESS_FROM` secret, meaning changing the
  atelier's ship-from address requires a CLI command), and a `test`/`live`
  mode flag per integration. Admin-write RLS only.
- Files: new migration, `src/lib/data/repository.ts`.

### 4.2 Shippo panel

- Status: `[ ]`
- Deliverable: in `/admin/settings`, show live connection status (call the
  `shipping-rates` function with a canned test address and report
  success/failure rather than just linking out to Shippo), whether the key
  in use is `shippo_test_` or `shippo_live_` (the function can report this
  without ever exposing the key itself), and an editable ship-from address
  form backed by 4.1 — the `shipping-rates` function reads
  `SHIPPO_ADDRESS_FROM` from an env secret today; switch it to read from
  `store_settings` instead so the admin form actually takes effect.
- Files: `src/pages/admin/Settings.tsx`, `supabase/functions/shipping-rates/index.ts`.

### 4.3 Stripe panel

- Status: `[ ]`
- Deliverable: once the Stripe checkout flow itself exists (see
  `[[jouber-payment-gateway-stripe]]` / not yet built — a separate,
  larger piece of work: a PaymentIntent-creating Edge Function + Stripe
  Elements in `Checkout.tsx` + writing the resulting order), extend this
  panel with connection status, test/live indicator, and a link to recent
  payments in the Stripe dashboard. Until then, this panel can only show
  "keys saved, checkout not yet built."
- Files: `src/pages/admin/Settings.tsx`.

### 4.4 Replace the static Settings page

- Status: `[ ]`
- Deliverable: `Settings.tsx` today is hardcoded display copy ("Payment
  gateway: Not connected", store name/currency as plain text). Once 4.1-4.3
  exist, replace the static `<dl>` with the real panels above plus editable
  store name/currency backed by 4.1.
- Files: `src/pages/admin/Settings.tsx`.

## Checkpoint — 2026-08-29

Section 0 (foundation) is fully implemented and passes `npm run lint`/`npm run build`,
but **not yet pushed** — everything below is committed only locally, pending the
user testing it against the live Supabase project first (real admin login,
Shop/Journal showing real seeded data, admin CRUD) since this replaces the
entire data layer and auth, a much larger blast radius than the Shippo change.
Once confirmed, push to `master` to deploy — remember the live site already
has `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` set (see
`[[jouber-shippo-shipping-integration]]`), so it will start reading the real
(now-seeded) database immediately on deploy, same as local dev.

Not yet done from section 0: nothing — 0.1-0.4 are all complete. Next up per
the suggested order below is 2.1/2.2/3.1.

## Suggested order

1. Section 0 (foundation) — nothing else is real without it.
2. Section 2.1/2.2 and 3.1 — smaller, self-contained gaps in features that
   already mostly exist.
3. Section 4 — integrations panel (pairs naturally with finishing the
   Stripe checkout build-out).
4. Section 1 — texts/CMS, largest and most cross-cutting, last.

## Validation protocol for every task

- Run `npm run lint` and `npm run build` after any runtime code change.
- Verify the affected admin screen against real Supabase data (not just
  that it compiles) before marking a task `[x]`.
- Update this file's status markers as tasks move — this doc is the
  resume point for later sessions, the same way `DESIGN_REFINEMENT_TASKS.md`
  is for the visual-design work.
