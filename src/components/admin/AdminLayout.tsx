import { NavLink, Outlet, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  Newspaper,
  Image as ImageIcon,
  Users,
  Settings as SettingsIcon,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Products", to: "/admin/products", icon: Package },
  { label: "Orders", to: "/admin/orders", icon: ShoppingCart },
  { label: "Categories", to: "/admin/categories", icon: FolderTree },
  { label: "Posts", to: "/admin/posts", icon: Newspaper },
  { label: "Media", to: "/admin/media", icon: ImageIcon },
  { label: "Customers", to: "/admin/orders", icon: Users },
  { label: "Settings", to: "/admin/settings", icon: SettingsIcon },
];

export function AdminLayout() {
  const { adminEmail, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-ivory-dim font-sans text-charcoal">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-stone-dark bg-cream md:flex">
        <div className="border-b border-stone-dark px-6 py-6">
          <Link to="/" className="font-serif text-lg leading-tight">
            Atelier
            <br />
            Saint Sebastian
          </Link>
          <p className="mt-1 text-[11px] uppercase tracking-wide text-warmgray">Admin</p>
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
                  isActive ? "bg-olive text-ivory" : "text-charcoal hover:bg-stone",
                )
              }
            >
              <Icon size={16} strokeWidth={1.5} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-stone-dark px-4 py-4">
          <p className="truncate text-xs text-warmgray">{adminEmail}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-2 flex items-center gap-2 text-xs uppercase tracking-wide text-warmgray hover:text-charcoal"
          >
            <LogOut size={13} strokeWidth={1.5} />
            Log out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-stone-dark bg-cream px-4 py-3 md:px-8">
          <p className="text-sm text-warmgray md:hidden">Admin</p>
          <div className="ml-auto">
            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-warmgray hover:text-charcoal"
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
