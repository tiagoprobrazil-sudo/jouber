import { useAuth } from "@/context/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function Settings() {
  const { adminEmail } = useAuth();

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-3xl text-charcoal">Settings</h1>

      <div className="mt-8 space-y-8">
        <div className="border border-stone-dark bg-cream p-6">
          <h2 className="font-serif text-lg">Account</h2>
          <p className="mt-2 font-sans text-sm text-warmgray-dark">Signed in as {adminEmail}</p>
        </div>

        <div className="border border-stone-dark bg-cream p-6">
          <h2 className="font-serif text-lg">Data source</h2>
          <p className="mt-2 font-sans text-sm text-warmgray-dark">
            {isSupabaseConfigured
              ? "Connected to a Supabase project."
              : "Running on local mock data (browser storage). Connect a Supabase project by setting VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY — see /supabase/README.md for the schema and setup steps."}
          </p>
        </div>

        <div className="border border-stone-dark bg-cream p-6">
          <h2 className="font-serif text-lg">Store</h2>
          <dl className="mt-3 space-y-2 font-sans text-sm">
            <div className="flex justify-between">
              <dt className="text-warmgray">Store name</dt>
              <dd className="text-charcoal">Atelier Saint Sebastian</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-warmgray">Currency</dt>
              <dd className="text-charcoal">USD</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-warmgray">Payment gateway</dt>
              <dd className="text-charcoal">Not connected</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
