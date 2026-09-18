import type { ReactNode } from "react";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "stack", label: "Tech Stack" },
  { id: "architecture", label: "Architecture" },
  { id: "database", label: "Database" },
  { id: "functions", label: "Edge Functions" },
  { id: "integrations", label: "Integrations" },
  { id: "admin-guide", label: "Admin Dashboard Guide" },
  { id: "deployment", label: "Deployment" },
  { id: "env-vars", label: "Environment Variables" },
  { id: "gaps", label: "Known Gaps" },
];

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border border-admin-border bg-admin-surface p-6 md:p-8">
      <h2 className="font-serif text-2xl text-admin-ink">{title}</h2>
      <div className="mt-4 space-y-4 font-sans text-sm leading-relaxed text-admin-ink">{children}</div>
    </section>
  );
}

function Table({ head, rows }: { head: string[]; rows: (string | ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto border border-admin-border-soft">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="bg-admin-border-soft/40">
            {head.map((h) => (
              <th key={h} className="border-b border-admin-border px-3 py-2 font-sans text-xs uppercase tracking-wide text-admin-muted">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-admin-border-soft">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 align-top text-admin-ink">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Code({ children }: { children: ReactNode }) {
  return <code className="rounded-sm bg-admin-border-soft px-1.5 py-0.5 font-mono text-[0.85em] text-admin-ink">{children}</code>;
}

export default function Docs() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-admin-ink">Documentation</h1>
      <p className="mt-1 font-sans text-sm text-admin-muted">
        A complete technical reference for how this site is built, what's connected to it, and how to change or deploy it.
      </p>

      <nav className="mt-6 flex flex-wrap gap-2 border border-admin-border bg-admin-surface p-3">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-sm px-3 py-1.5 font-sans text-xs uppercase tracking-wide text-admin-muted transition-colors hover:bg-admin-border-soft hover:text-admin-ink"
          >
            {s.label}
          </a>
        ))}
      </nav>

      <div className="mt-6 space-y-6">
        <Section id="overview" title="Overview">
          <p>
            This site is the online shop and public presence for <strong>Atelier Saint Sebastian</strong> (
            <a href="https://ateliersaintsebastian.com" target="_blank" rel="noreferrer" className="text-olive underline">
              ateliersaintsebastian.com
            </a>
            ), an atelier that hand-paints and hand-finishes devotional statues and sacred art. The site is a custom-built
            e-commerce application &mdash; not a Shopify, WooCommerce, or other off-the-shelf platform &mdash; written from
            scratch as a React web app with a Supabase backend.
          </p>
          <p>It covers four connected things:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>A <strong>product catalog and checkout</strong> (browse, add to cart, pay with card via Stripe).</li>
            <li>
              A <strong>Commissions</strong> flow, where customers request a hand-painted piece from a partner's 3D-sculpture
              catalog, and the atelier quotes a labor price on top of the source file's price.
            </li>
            <li>
              A <strong>Journal</strong> (blog) and editable homepage/site copy, so content can be updated without touching
              code.
            </li>
            <li>
              A full <strong>admin dashboard</strong> (this area) for managing all of the above, plus orders, coupons,
              reviews, and print-on-demand fulfillment.
            </li>
          </ul>
        </Section>

        <Section id="stack" title="Tech Stack">
          <Table
            head={["Layer", "Technology"]}
            rows={[
              ["Frontend framework", <>React 19 + TypeScript, built with Vite 8</>],
              ["Routing", <>react-router-dom v7 (all pages lazy-loaded)</>],
              ["Styling", <>Tailwind CSS v4 (via the Vite plugin &mdash; there is no <Code>tailwind.config</Code> file)</>],
              ["Rich text editing", <>Tiptap (used for Journal posts)</>],
              ["Icons", <>lucide-react</>],
              ["Backend / database", <>Supabase (hosted Postgres + Auth + Storage + Edge Functions)</>],
              ["Edge Functions runtime", <>Deno, deployed individually via the Supabase CLI</>],
              ["Payments", <>Stripe (PaymentElement, PaymentIntents)</>],
              ["Transactional email", <>Resend</>],
              ["Shipping rates", <>Shippo (for pieces the atelier ships itself)</>],
              ["Print-on-demand fulfillment", <>Printful (for any products fulfilled by a print-on-demand partner instead of the atelier)</>],
              ["Hosting", <>Cloudflare Pages / Workers</>],
            ]}
          />
        </Section>

        <Section id="architecture" title="Architecture">
          <p>The system has three moving parts that each deploy separately:</p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              <strong>The frontend</strong> (everything in <Code>src/</Code>) &mdash; a static single-page app built by Vite
              and served by Cloudflare. It talks directly to Supabase for reading data (products, posts, site content) and
              calls Supabase Edge Functions for anything that needs a secret key or server-side logic (payments, shipping
              quotes, sending email).
            </li>
            <li>
              <strong>The database</strong> (Supabase Postgres) &mdash; holds every table (products, orders, coupons,
              commission requests, site content, etc.). Row-Level Security (RLS) policies control who can read/write each
              table: the public can read published/active content, and an <Code>is_admin()</Code> database function gates
              every admin-only write.
            </li>
            <li>
              <strong>Edge Functions</strong> (<Code>supabase/functions/</Code>) &mdash; small server-side scripts that run
              on Supabase's own infrastructure (not Cloudflare). These are the only place secret API keys for Stripe,
              Resend, Shippo, and Printful are ever used &mdash; the browser never sees them.
            </li>
          </ol>
          <p>
            When you (as admin) edit something in this dashboard, you're writing directly to the Supabase database (for
            simple content) or calling an Edge Function (for anything involving money, email, or a third-party API).
          </p>
        </Section>

        <Section id="database" title="Database">
          <p>All tables live in Supabase Postgres. Grouped by purpose:</p>
          <Table
            head={["Group", "Tables", "What they hold"]}
            rows={[
              [
                "Product catalog",
                <><Code>products</Code>, <Code>product_categories</Code>, <Code>product_category_map</Code>, <Code>product_images</Code>, <Code>product_variants</Code></>,
                "Every product, its categories, photos, and size/finish variants. Includes the Quote-Only flag (see Admin Guide).",
              ],
              [
                "Reviews",
                <><Code>reviews</Code>, <Code>review_requests</Code></>,
                "Customer reviews (pending/approved/rejected) and the auto-generated request emails sent after a purchase.",
              ],
              [
                "Orders & checkout",
                <><Code>customers</Code>, <Code>orders</Code>, <Code>order_items</Code>, <Code>checkout_drafts</Code></>,
                "Completed orders and a temporary snapshot of the cart while a payment is in progress (deleted once the order is finalized).",
              ],
              [
                "Coupons",
                <><Code>coupons</Code>, <Code>coupon_usage</Code></>,
                "Discount codes (percent/fixed, with all the usual restrictions: min/max, per-product, per-email, usage limits) and a log of every redemption.",
              ],
              [
                "Commissions",
                <><Code>commission_requests</Code>, <Code>commission_pricing</Code></>,
                "Requests from the Commissions page (see below), and the atelier's labor price for each partner-catalog piece.",
              ],
              [
                "Quote requests",
                <><Code>product_quote_requests</Code></>,
                "Requests submitted from a Quote-Only product's page (name, contact info, desired size/finish, message).",
              ],
              [
                "Content",
                <><Code>posts</Code>, <Code>post_categories</Code>, <Code>site_content</Code>, <Code>store_settings</Code>, <Code>media</Code>, <Code>newsletter_subscribers</Code></>,
                "Journal posts, editable homepage/policy copy (see Site Content in the Admin Guide), store settings (ship-from address, review delay), and the media library.",
              ],
              [
                "Auth",
                <><Code>profiles</Code></>,
                "Extends Supabase's built-in user accounts with a role (admin/customer). This is what decides who can use this dashboard.",
              ],
            ]}
          />
          <p>
            Two scheduled jobs run inside the database itself: one publishes scheduled Journal posts every 5 minutes, and
            one triggers the daily review-request email at 15:00 UTC.
          </p>
        </Section>

        <Section id="functions" title="Edge Functions">
          <p>
            These run on Supabase, not on the website server. Each one is deployed individually and can be updated without
            touching the frontend.
          </p>
          <Table
            head={["Function", "What it does"]}
            rows={[
              ["create-payment-intent", "Starts a Stripe payment, re-checks any coupon code, and saves a snapshot of the cart."],
              ["create-order", "Turns a successful payment into a real order, right after checkout finishes."],
              ["stripe-webhook", "Backup path that also turns successful payments into orders, in case the customer's browser closes before create-order runs. This is what makes checkout reliable."],
              ["shipping-rates", "Gets live shipping cost quotes from Shippo for pieces the atelier ships itself."],
              ["printful-catalog / printful-shipping / printful-orders / printful-cancel-order / printful-resend / printful-webhook", "Everything related to Printful: importing products, quoting shipping, and keeping order status in sync."],
              ["validate-coupon", "Checks a coupon code live as the customer types it into the cart."],
              ["submit-review / get-review-request", "Handles a customer submitting a review, including reviews from the auto-sent request email."],
              ["send-review-requests", "Runs once a day; emails customers asking for a review a set number of days after their order."],
              ["create-commission-request", "Saves a Commissions request and emails the admin notification address."],
              ["create-product-quote-request", "Saves a Quote-Only product request and emails the admin notification address."],
            ]}
          />
        </Section>

        <Section id="integrations" title="Integrations">
          <Table
            head={["Service", "Used for", "Where"]}
            rows={[
              ["Stripe", "Card payments at checkout.", "Checkout page + create-payment-intent / create-order / stripe-webhook functions."],
              ["Resend", "Sending emails (review requests, Commission and Quote request notifications).", "Edge Functions only &mdash; the browser never sends email directly."],
              ["Shippo", "Live shipping rate quotes for atelier-fulfilled pieces.", "Checkout page + shipping-rates function. Ship-from address is set in Settings, not a secret key."],
              ["Printful", "Print-on-demand fulfillment for any product marked as Printful-fulfilled &mdash; Printful prints, packs, and ships it directly.", "Printful tab in this dashboard + the printful-* functions."],
              ["Exú Caveira (partner catalog)", "Supplies the live catalog of 3D-sculpted pieces shown on the Commissions page. This is a separate business, not a payment or shipping provider &mdash; it's called directly from the browser.", "Commissions page."],
            ]}
          />
        </Section>

        <Section id="admin-guide" title="Admin Dashboard Guide">
          <Table
            head={["Tab", "What you do there"]}
            rows={[
              ["Dashboard", "Quick totals: products, orders, published/draft posts, and the most recent orders and posts."],
              ["Products", "Add/edit products: photos, price, variants, stock, and the Quote-Only checkbox (hides price and shows a “Request a Quote” button instead of Add to Cart &mdash; used for made-to-order or highly custom pieces where a fixed price doesn't make sense)."],
              ["Orders", "Every completed order, its status, and (for Printful-fulfilled items) tracking info and a resend/cancel action if Printful didn't receive it automatically."],
              ["Commissions", "Requests submitted from the Commissions page, and the Pricing panel where you set your labor price (a default for everything, or an override per piece)."],
              ["Coupons", "Discount codes &mdash; percent or fixed amount off, with optional restrictions (specific products/categories, minimum spend, one-time use, allowed emails, etc.)."],
              ["Categories", "Product categories used for filtering the shop."],
              ["Posts", "Journal (blog) articles &mdash; draft, published, or scheduled for a future date/time."],
              ["Media", "Uploaded images library, shared by products and posts."],
              ["Reviews", "Moderation queue for customer reviews &mdash; approve or reject before they show publicly."],
              ["Site Content", "Editable copy for the homepage, artist page, and policy pages (Shipping, Returns, Privacy, Terms, FAQ) &mdash; no code changes needed to update this text."],
              ["Printful", "Import products from your Printful catalog, or re-sync an already-imported one."],
              ["Settings", "Store profile, Shippo ship-from address, review-request timing, and connection status for Stripe/Shippo/Printful."],
              ["Documentation", "This page."],
            ]}
          />
        </Section>

        <Section id="deployment" title="Deployment">
          <p>The frontend and the backend deploy separately, and neither one deploys automatically when the other changes:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Frontend (this website):</strong> hosted on Cloudflare Pages, connected to this project's GitHub
              repository. Pushing to the <Code>master</Code> branch (<Code>git push origin master</Code>) triggers an
              automatic build and publish &mdash; nothing else needs to be done. Frontend environment variables (the
              public Stripe key, Supabase URL, etc.) are set in the Cloudflare dashboard, under this project's
              Settings &rarr; Environment variables; changing one requires a new deployment to take effect.
            </li>
            <li>
              <strong>Database changes (migrations):</strong> new or changed tables are written as SQL migration files and
              applied to the live database with the Supabase CLI (<Code>supabase db push</Code>). This is a separate,
              manual step &mdash; it does not happen when you push code to GitHub.
            </li>
            <li>
              <strong>Edge Functions:</strong> each function is deployed individually with the Supabase CLI (
              <Code>supabase functions deploy &lt;name&gt;</Code>). Like migrations, this is manual and separate from the
              frontend deploy.
            </li>
          </ul>
          <p>
            In short: a code change that only touches <Code>src/</Code> just needs a git push. A change that adds a
            database column, a new table, or a new/updated Edge Function needs those extra manual steps too, or it won't
            actually take effect on the live site even after the frontend is deployed.
          </p>
        </Section>

        <Section id="env-vars" title="Environment Variables & Secrets">
          <p>Frontend (public, set in Cloudflare &mdash; these are visible in the browser, so none of them are secret keys):</p>
          <Table
            head={["Variable", "Purpose"]}
            rows={[
              ["VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY", "Connects the browser to the Supabase database (read access only, governed by RLS)."],
              ["VITE_STRIPE_PUBLISHABLE_KEY", "Renders the Stripe payment form."],
              ["VITE_EXUCAVEIRA_PARTNER_KEY", "Authenticates the Commissions page's request to the partner catalog."],
            ]}
          />
          <p className="mt-4">Backend (secret, set in the Supabase project's Edge Function secrets &mdash; never in the frontend):</p>
          <Table
            head={["Secret", "Used by"]}
            rows={[
              ["STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET", "create-payment-intent, create-order, stripe-webhook"],
              ["RESEND_API_KEY / FROM_EMAIL", "send-review-requests, create-commission-request, create-product-quote-request"],
              ["SHIPPO_API_KEY", "shipping-rates (ship-from address itself is not a secret &mdash; it's set in Settings)"],
              ["PRINTFUL_API_TOKEN / PRINTFUL_STORE_ID", "every printful-* function"],
              ["ADMIN_NOTIFICATION_EMAIL", "Where Commission and Quote request emails get sent"],
              ["CRON_SECRET", "Authenticates the daily scheduled job that triggers send-review-requests"],
            ]}
          />
        </Section>

        <Section id="gaps" title="Known Gaps">
          <p>Things that work today but are worth knowing about:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Quote-Only requests have no dashboard list yet.</strong> When a customer submits a quote request, you
              get an email, and the request is saved in the database &mdash; but there isn't yet a page in this dashboard
              to browse/manage them the way Commissions requests can be. Worth adding if this feature gets used often.
            </li>
            <li>
              <strong>Printful hasn't been tested against a live Printful account yet.</strong> The integration was built
              from Printful's documentation; it should work, but the first real product import/order is worth watching
              closely.
            </li>
          </ul>
        </Section>
      </div>
    </div>
  );
}
