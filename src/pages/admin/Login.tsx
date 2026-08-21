import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth, DEMO_ADMIN_CREDENTIALS } from "@/context/AuthContext";
import { SeoHead } from "@/components/layout/SeoHead";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) navigate("/admin", { replace: true });
    else setError(result.error ?? "Something went wrong.");
  }

  return (
    <>
      <SeoHead title="Admin Login" description="Sign in to the Atelier Saint Sebastian admin." path="/admin/login" />
      <div className="flex min-h-screen items-center justify-center bg-ivory-dim px-6">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex justify-center">
            <Logo />
          </div>
          <form onSubmit={handleSubmit} className="border border-stone-dark bg-cream p-8">
            <h1 className="font-serif text-2xl text-charcoal">Admin Sign In</h1>
            <p className="mt-1 mb-6 font-sans text-xs text-warmgray">
              Demo credentials: {DEMO_ADMIN_CREDENTIALS.email} / {DEMO_ADMIN_CREDENTIALS.password}
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="login-email" className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-warmgray">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-stone-dark bg-transparent px-4 py-2.5 font-sans text-sm focus:border-olive focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="mb-1.5 block font-sans text-xs uppercase tracking-wide text-warmgray">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-stone-dark bg-transparent px-4 py-2.5 font-sans text-sm focus:border-olive focus:outline-none"
                />
              </div>
            </div>

            {error && <p className="mt-4 font-sans text-xs text-red-700">{error}</p>}

            <Button type="submit" disabled={loading} className="mt-7 w-full">
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
