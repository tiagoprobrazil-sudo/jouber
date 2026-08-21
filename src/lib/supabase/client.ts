import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Whether a real Supabase project is configured. The app runs entirely
 * on the mock/localStorage repository (see lib/data/repository.ts)
 * until this is true — nothing here is required for `npm run dev`.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.info(
    "[Atelier Saint Sebastian] Supabase is not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). " +
      "Running on local mock data — see supabase/README.md to connect a real project.",
  );
}

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!)
  : null;
