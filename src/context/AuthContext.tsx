import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * Admin authentication.
 *
 * When a real Supabase project is configured (VITE_SUPABASE_URL/ANON_KEY),
 * this uses real Supabase Auth (`signInWithPassword` + `onAuthStateChange`),
 * gated on the signed-in user's `profiles.role === 'admin'` — RLS already
 * enforces this server-side (see supabase/migrations/0002_rls.sql), this
 * context just reflects it in the UI and signs out any non-admin account
 * that manages to authenticate.
 *
 * Without a configured Supabase project (e.g. local `npm run dev` with no
 * `.env`), it falls back to a localStorage-backed demo login so the admin
 * area keeps working with zero setup — see DEMO_ADMIN_CREDENTIALS.
 */

const STORAGE_KEY = "ass:admin-session:v1";
const DEMO_EMAIL = "jouber@ateliersaintsebastian.com";
const DEMO_PASSWORD = "atelier-admin";

interface AuthContextValue {
  isAuthenticated: boolean;
  adminEmail: string | null;
  /** True until the initial session check resolves — avoids a false "not authenticated" redirect on page load/refresh. */
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function isAdminProfile(userId: string): Promise<boolean> {
  const { data, error } = await supabase!.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (error || !data) return false;
  return data.role === "admin";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setAdminEmail(stored);
      return;
    }

    let cancelled = false;

    async function syncSession(userId: string | undefined, email: string | undefined) {
      if (!userId || !email) {
        if (!cancelled) setAdminEmail(null);
        return;
      }
      const admin = await isAdminProfile(userId);
      if (cancelled) return;
      setAdminEmail(admin ? email : null);
    }

    supabase!.auth.getSession().then(({ data }) => {
      syncSession(data.session?.user.id, data.session?.user.email).finally(() => {
        if (!cancelled) setLoading(false);
      });
    });

    const { data: subscription } = supabase!.auth.onAuthStateChange((_event, session) => {
      syncSession(session?.user.id, session?.user.email);
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  async function login(email: string, password: string) {
    if (!isSupabaseConfigured) {
      await new Promise((r) => setTimeout(r, 300));
      if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
        window.localStorage.setItem(STORAGE_KEY, email);
        setAdminEmail(email);
        return { ok: true };
      }
      return { ok: false, error: "Invalid email or password." };
    }

    const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      return { ok: false, error: error?.message ?? "Invalid email or password." };
    }
    const admin = await isAdminProfile(data.user.id);
    if (!admin) {
      await supabase!.auth.signOut();
      return { ok: false, error: "This account does not have admin access." };
    }
    setAdminEmail(data.user.email ?? email);
    return { ok: true };
  }

  function logout() {
    if (isSupabaseConfigured) {
      supabase!.auth.signOut();
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setAdminEmail(null);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: Boolean(adminEmail), adminEmail, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const DEMO_ADMIN_CREDENTIALS = { email: DEMO_EMAIL, password: DEMO_PASSWORD };
