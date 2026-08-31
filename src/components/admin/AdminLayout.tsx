import { useEffect, useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  Newspaper,
  Image as ImageIcon,
  Users,
  FileText,
  Shirt,
  Settings as SettingsIcon,
  LogOut,
  ExternalLink,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils/cn";
import { BrandMark } from "@/components/brand/BrandMark";

const NAV = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Products", to: "/admin/products", icon: Package },
  { label: "Orders", to: "/admin/orders", icon: ShoppingCart },
  { label: "Categories", to: "/admin/categories", icon: FolderTree },
  { label: "Posts", to: "/admin/posts", icon: Newspaper },
  { label: "Media", to: "/admin/media", icon: ImageIcon },
  { label: "Customers", to: "/admin/orders", icon: Users },
  { label: "Site Content", to: "/admin/content", icon: FileText },
  { label: "Printify", to: "/admin/printify", icon: Shirt },
  { label: "Settings", to: "/admin/settings", icon: SettingsIcon },
];

type Theme = "light" | "dark";
const THEME_STORAGE_KEY = "ass:admin-theme:v1";

function useAdminTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (window.localStorage.getItem(THEME_STORAGE_KEY) as Theme | null) ?? "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore storage errors (private browsing, etc.)
    }
  }, [theme]);

  return [theme, () => setTheme((t) => (t === "light" ? "dark" : "light"))];
}

export function AdminLayout() {
  const { adminEmail, logout } = useAuth();
  const [theme, toggleTheme] = useAdminTheme();

  return (
    <div data-admin-theme={theme} className="flex min-h-screen bg-admin-bg font-sans text-admin-ink">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-admin-border bg-admin-surface md:flex">
        <div className="border-b border-admin-border px-6 py-6">
          <Link to="/" className="flex items-center gap-3">
            <BrandMark decorative={false} size="sm" />
            <span className="font-serif text-lg leading-tight">
              Atelier
              <br />
              Saint Sebastian
            </span>
          </Link>
          <p className="mt-2 text-[11px] uppercase tracking-wide text-admin-muted">Admin</p>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {NAV.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={label}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors",
                  isActive ? "bg-olive text-ivory" : "text-admin-ink hover:bg-admin-border-soft",
                )
              }
            >
              <Icon size={16} strokeWidth={1.5} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-admin-border px-4 py-4">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            className="flex items-center gap-2 text-xs uppercase tracking-wide text-admin-muted hover:text-admin-ink"
          >
            {theme === "light" ? <Moon size={13} strokeWidth={1.5} /> : <Sun size={13} strokeWidth={1.5} />}
            {theme === "light" ? "Dark mode" : "Light mode"}
          </button>
          <p className="mt-3 truncate text-xs text-admin-muted">{adminEmail}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-2 flex items-center gap-2 text-xs uppercase tracking-wide text-admin-muted hover:text-admin-ink"
          >
            <LogOut size={13} strokeWidth={1.5} />
            Log out
          </button>
          <p className="mt-4 border-t border-admin-border pt-3 text-[10px] uppercase tracking-wide text-admin-muted">
            Powered by{" "}
            <a
              href="https://www.tiagobrazil.com.br"
              target="_blank"
              rel="noreferrer"
              className="text-admin-ink-muted hover:text-admin-ink hover:underline"
            >
              Tiago Brazil
            </a>
          </p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-admin-border bg-admin-surface px-4 py-3 md:px-8">
          <p className="text-sm text-admin-muted md:hidden">Admin</p>
          <div className="ml-auto">
            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-admin-muted hover:text-admin-ink"
            >
              View site
              <ExternalLink size={12} strokeWidth={1.5} />
            </Link>
          </div>
        </header>
        <main className="flex-1 px-4 py-8 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
