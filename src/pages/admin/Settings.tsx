import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getStoreSetting, updateStoreSetting } from "@/lib/data/repository";
import { checkShippoStatus, type ShippoStatus } from "@/lib/shipping/shippo";
import type { ShippingAddress } from "@/lib/shipping/types";
import { listPrintifyProducts } from "@/lib/printify";
import { Button } from "@/components/ui/Button";

interface StoreProfile {
  name: string;
  currency: string;
}

const EMPTY_ADDRESS: ShippingAddress = {
  name: "",
  street1: "",
  street2: "",
  city: "",
  state: "",
  zip: "",
  country: "US",
  phone: "",
  email: "",
};

function Field({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-admin-muted">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-admin-border bg-admin-surface px-4 py-2.5 font-sans text-sm focus:border-olive focus:outline-none"
      />
    </div>
  );
}

function StatusBadge({ ok, label }: { ok: boolean | null; label: string }) {
  if (ok === null) return <span className="flex items-center gap-1.5 text-admin-muted"><AlertCircle size={14} strokeWidth={1.5} /> {label}</span>;
  return ok ? (
    <span className="flex items-center gap-1.5 text-olive-dark"><CheckCircle2 size={14} strokeWidth={1.5} /> {label}</span>
  ) : (
    <span className="flex items-center gap-1.5 text-red-700"><XCircle size={14} strokeWidth={1.5} /> {label}</span>
  );
}

export default function Settings() {
  const { adminEmail } = useAuth();

  const [profile, setProfile] = useState<StoreProfile>({ name: "Atelier Saint Sebastian", currency: "USD" });
  const [savingProfile, setSavingProfile] = useState(false);

  const [shippoStatus, setShippoStatus] = useState<ShippoStatus | null | undefined>(undefined);
  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);
  const [savingAddress, setSavingAddress] = useState(false);

  const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
  const stripeMode = stripePublishableKey?.startsWith("pk_live_") ? "live" : stripePublishableKey?.startsWith("pk_test_") ? "test" : null;

  const [printifyStatus, setPrintifyStatus] = useState<boolean | null | undefined>(undefined);
  const [printifyProductCount, setPrintifyProductCount] = useState<number | null>(null);

  useEffect(() => {
    getStoreSetting<StoreProfile>("store_profile").then((v) => v && setProfile(v));
    getStoreSetting<ShippingAddress>("shippo_address_from").then((v) => v && setAddress(v));
    checkShippoStatus().then(setShippoStatus);
    listPrintifyProducts()
      .then((products) => {
        setPrintifyStatus(true);
        setPrintifyProductCount(products.length);
      })
      .catch(() => setPrintifyStatus(false));
  }, []);

  async function saveProfile() {
    setSavingProfile(true);
    await updateStoreSetting("store_profile", profile);
    setSavingProfile(false);
  }

  async function saveAddress() {
    setSavingAddress(true);
    await updateStoreSetting("shippo_address_from", address);
    setShippoStatus(await checkShippoStatus());
    setSavingAddress(false);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-3xl text-admin-ink">Settings</h1>

      <div className="mt-8 space-y-8">
        <div className="border border-admin-border bg-admin-surface p-6">
          <h2 className="font-serif text-lg">Account</h2>
          <p className="mt-2 font-sans text-sm text-admin-ink-muted">Signed in as {adminEmail}</p>
        </div>

        <div className="border border-admin-border bg-admin-surface p-6">
          <h2 className="font-serif text-lg">Data source</h2>
          <p className="mt-2 font-sans text-sm text-admin-ink-muted">
            {isSupabaseConfigured
              ? "Connected to a Supabase project."
              : "Running on local mock data (browser storage). Connect a Supabase project by setting VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY — see /supabase/README.md for the schema and setup steps."}
          </p>
        </div>

        <div className="border border-admin-border bg-admin-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg">Store</h2>
            <Button size="sm" disabled={savingProfile} onClick={saveProfile}>
              {savingProfile ? "Saving…" : "Save"}
            </Button>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Store name" value={profile.name} onChange={(v) => setProfile((p) => ({ ...p, name: v }))} />
            <Field label="Currency" value={profile.currency} onChange={(v) => setProfile((p) => ({ ...p, currency: v.toUpperCase() }))} />
          </div>
        </div>

        <div className="border border-admin-border bg-admin-surface p-6">
          <h2 className="font-serif text-lg">Shipping — Shippo</h2>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 font-sans text-sm">
            <StatusBadge ok={shippoStatus === undefined ? null : Boolean(shippoStatus?.ok)} label={shippoStatus?.ok ? "Connected" : "Not connected"} />
            <span className="text-admin-muted">
              Mode: <span className="text-admin-ink">{shippoStatus?.keyMode ?? "unknown"}</span>
            </span>
          </div>
          {shippoStatus?.keyMode === "test" && (
            <p className="mt-2 font-sans text-xs text-admin-muted">
              Using a Shippo test token — quotes are realistic but no real carrier is called and nothing is
              charged. Switch to a shippo_live_ token (via <code>supabase secrets set SHIPPO_API_KEY=...</code>)
              and connect carrier accounts in the Shippo dashboard to go live.
            </p>
          )}

          <div className="mt-6 flex items-center justify-between">
            <p className="font-sans text-xs uppercase tracking-wide text-admin-muted">Ship-from address</p>
            <Button size="sm" disabled={savingAddress} onClick={saveAddress}>
              {savingAddress ? "Saving…" : "Save"}
            </Button>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Name" value={address.name} onChange={(v) => setAddress((a) => ({ ...a, name: v }))} className="sm:col-span-2" />
            <Field label="Street" value={address.street1} onChange={(v) => setAddress((a) => ({ ...a, street1: v }))} className="sm:col-span-2" />
            <Field label="City" value={address.city} onChange={(v) => setAddress((a) => ({ ...a, city: v }))} />
            <Field label="State" value={address.state} onChange={(v) => setAddress((a) => ({ ...a, state: v }))} />
            <Field label="Postal code" value={address.zip} onChange={(v) => setAddress((a) => ({ ...a, zip: v }))} />
            <Field label="Country" value={address.country} onChange={(v) => setAddress((a) => ({ ...a, country: v.toUpperCase() }))} />
            <Field label="Phone" value={address.phone ?? ""} onChange={(v) => setAddress((a) => ({ ...a, phone: v }))} />
            <Field label="Email" value={address.email ?? ""} onChange={(v) => setAddress((a) => ({ ...a, email: v }))} />
          </div>
        </div>

        <div className="border border-admin-border bg-admin-surface p-6">
          <h2 className="font-serif text-lg">Payments — Stripe</h2>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 font-sans text-sm">
            <StatusBadge ok={stripeMode !== null} label={stripeMode ? "Key saved" : "Not connected"} />
            {stripeMode && (
              <span className="text-admin-muted">
                Mode: <span className="text-admin-ink">{stripeMode}</span>
              </span>
            )}
          </div>
          <p className="mt-2 font-sans text-xs text-admin-muted">
            {stripeMode
              ? "Checkout collects payment via Stripe Elements. Orders are only recorded after Stripe confirms the charge server-side."
              : "No Stripe keys saved yet."}
          </p>
        </div>

        <div className="border border-admin-border bg-admin-surface p-6">
          <h2 className="font-serif text-lg">Fulfillment — Printify</h2>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 font-sans text-sm">
            <StatusBadge ok={printifyStatus === undefined ? null : printifyStatus} label={printifyStatus ? "Connected" : "Not connected"} />
            {printifyStatus && (
              <span className="text-admin-muted">
                Shop catalog: <span className="text-admin-ink">{printifyProductCount} product{printifyProductCount === 1 ? "" : "s"}</span>
              </span>
            )}
          </div>
          <p className="mt-2 font-sans text-xs text-admin-muted">
            Products linked to Printify are automatically submitted for printing and shipping once paid for, and
            get tracking info back automatically once shipped. Import products from the{" "}
            <Link to="/admin/printify" className="underline hover:text-admin-ink">
              Printify Catalog
            </Link>{" "}
            page.
          </p>
        </div>
      </div>
    </div>
  );
}
