# Connecting a real Supabase project

The app runs today on a localStorage-backed mock repository
(`src/lib/data/repository.ts`) so the whole site — including the admin
CMS — works with `npm run dev` and no backend at all. This folder holds
the schema for when you're ready to connect a real Supabase project.

## 1. Create the project

Create a project at [supabase.com](https://supabase.com/dashboard), then
grab the **Project URL** and **anon public key** from Project Settings → API.

## 2. Run the migrations

In the Supabase SQL editor, run the three files in this folder **in
order**:

1. `migrations/0001_schema.sql` — tables, enums, indexes
2. `migrations/0002_rls.sql` — Row Level Security policies (admin-only
   writes, public reads of published/active content)
3. `migrations/0003_storage.sql` — storage buckets (`product-images`,
   `post-images`, `media`) and their policies

(Or, with the Supabase CLI linked to your project: `supabase db push`.)

## 3. Create your first admin

Sign up a user through Supabase Auth (or the app once real auth is
wired in), then in the SQL editor:

```sql
insert into profiles (id, email, role)
values ('<the user''s auth.users id>', 'jouber@ateliersaintsebastian.com', 'admin');
```

## 4. Set the environment variables

Create a `.env` file at the project root (never commit it):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

`src/lib/supabase/client.ts` picks these up automatically and exposes
`isSupabaseConfigured` / `supabase`.

## 5. Swap the data layer

This is the only code change required. Every page and admin screen
calls the functions exported from `src/lib/data/repository.ts` — none
of them import mock data or localStorage directly. Reimplement each
function's body with a Supabase query, keeping the same name and
return type, for example:

```ts
export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const { data, error } = await supabase!
    .from("products")
    .select("*, product_images(*)")
    .eq("active", true)
    .eq("featured", true)
    .limit(limit);
  if (error) throw error;
  return data.map(mapProductRow);
}
```

A small `mapProductRow` (and equivalents for posts/orders/etc.) to
convert snake_case rows into the existing `Product`/`Post`/... types in
`src/lib/data/types.ts` is the only new code needed — the types were
written to mirror the schema in `0001_schema.sql` for exactly this
reason.

## 6. Real admin auth

Replace `src/context/AuthContext.tsx`'s mock login with
`supabase.auth.signInWithPassword`, subscribe to
`supabase.auth.onAuthStateChange`, and check the signed-in user's
`profiles.role === 'admin'` before granting access to `/admin`. RLS
already enforces this server-side — the context just needs to reflect
it in the UI.

## 7. Uploads

`uploadMedia()` in the repository currently reads a `File` into a data
URL. Replace its body with a `supabase.storage.from('media').upload(...)`
call and store the returned public URL instead — the function
signature (`File` in, `MediaItem` out) does not need to change.

## 8. Payments

The `/checkout` page intentionally does not simulate a completed
order — it collects shipping details and stops at a clearly labeled
"payment integration required" step. Connecting Stripe (or another
gateway) means adding a server-side function (Supabase Edge Function is
a good fit) to create a PaymentIntent/Checkout Session, then writing
the resulting order into the `orders`/`order_items` tables from that
same function once payment succeeds — never from the client alone.

## 9. Shipping rates (Shippo)

Live carrier rates at checkout are quoted through
[Shippo](https://goshippo.com/products/api) from a Supabase Edge
Function (`supabase/functions/shipping-rates`) so the Shippo API key
never reaches the browser. The client (`src/lib/shipping/shippo.ts`)
calls it via `supabase.functions.invoke("shipping-rates", ...)`; if
Supabase isn't configured, or the call fails for any reason, checkout
falls back to a flat estimate so it never hard-blocks.

1. Create a free account at [goshippo.com](https://goshippo.com) and
   grab a **test** token from Settings → API (starts `shippo_test_`).
   Go live later with a **live** token (`shippo_live_`) once carrier
   accounts are connected in the Shippo dashboard — Shippo includes
   discounted USPS out of the box; UPS/FedEx/DHL need their own
   accounts connected there.
2. Install the [Supabase CLI](https://supabase.com/docs/guides/cli) and
   link it to this project: `supabase link --project-ref <your-project-ref>`.
3. Deploy the function: `supabase functions deploy shipping-rates`.
4. Set its secrets (never as `VITE_...` — those ship to the browser):
   ```
   supabase secrets set SHIPPO_API_KEY=shippo_test_xxxxxxxx
   supabase secrets set SHIPPO_ADDRESS_FROM='{"name":"Atelier Saint Sebastian","street1":"123 Main St","city":"City","state":"ST","zip":"00000","country":"US","phone":"+15555555555","email":"jouber@ateliersaintsebastian.com"}'
   ```
   `SHIPPO_ADDRESS_FROM` is the atelier's real ship-from address — Shippo
   validates it and needs it to be accurate to quote rates.
5. Test from `/checkout`: fill in a shipping address and click "Get
   shipping rates". With a `shippo_test_` token, Shippo returns
   realistic-looking test rates (no real carrier is called and nothing
   is charged) — switch to a `shippo_live_` token when ready to go live.
6. Per-product parcel data (weight/dimensions used to build the Shippo
   parcel) is set in the admin Product editor under "Shipping parcel".
   Products left blank use a generic fallback box
   (`DEFAULT_PARCEL` in `src/lib/shipping/types.ts`) so rates still work,
   but accuracy improves once real weights/dimensions are filled in.
