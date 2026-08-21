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
