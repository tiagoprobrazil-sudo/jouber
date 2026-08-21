import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * Mock admin authentication.
 *
 * This is a placeholder so the /admin area can be demoed without a
 * backend. Replace with real Supabase Auth (supabase.auth.signInWithPassword,
 * onAuthStateChange, and a `profiles.role = 'admin'` check) once a
 * Supabase project is connected — see supabase/README.md.
 */

const STORAGE_KEY = "ass:admin-session:v1";
const DEMO_EMAIL = "jouber@ateliersaintsebastian.com";
const DEMO_PASSWORD = "atelier-admin";

interface AuthContextValue {
  isAuthenticated: boolean;
  adminEmail: string | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) setAdminEmail(stored);
  }, []);

  async function login(email: string, password: string) {
    await new Promise((r) => setTimeout(r, 300));
    if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
      window.localStorage.setItem(STORAGE_KEY, email);
      setAdminEmail(email);
      return { ok: true };
    }
    return { ok: false, error: "Invalid email or password." };
  }

  function logout() {
    window.localStorage.removeItem(STORAGE_KEY);
    setAdminEmail(null);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: Boolean(adminEmail), adminEmail, login, logout }}>
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
