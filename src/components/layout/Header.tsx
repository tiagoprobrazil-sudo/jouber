import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, Search as SearchIcon, ShoppingBag, User } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { PageContainer } from "@/components/ui/PageContainer";
import { useCart } from "@/context/CartContext";
import { useScrolled } from "@/lib/hooks/useScrolled";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Commissions", to: "/commissions" },
  { label: "The Artist", to: "/artist" },
  { label: "Journal", to: "/journal" },
  { label: "Contact", to: "/contact" },
];

function startsOnDarkArtwork(pathname: string) {
  return pathname === "/" || pathname === "/artist" || /^\/journal\/[^/]+$/.test(pathname);
}

export function Header() {
  const scrolled = useScrolled(72);
  const { pathname } = useLocation();
  const overlay = startsOnDarkArtwork(pathname) && !scrolled;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount, openDrawer } = useCart();

  const toolColor = overlay ? "text-ivory hover:text-gold-soft" : "text-charcoal hover:text-olive";

  return (
    <>
      <header
        data-header-state={overlay ? "overlay" : "solid"}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow,padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          overlay
            ? "border-b border-white/10 bg-charcoal/10 py-4 backdrop-blur-[2px] sm:py-5"
            : "border-b border-stone-dark/50 bg-ivory/90 py-3 shadow-[0_8px_30px_rgba(28,27,25,0.045)] backdrop-blur-xl",
        )}
      >
        {overlay && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-charcoal/55 via-charcoal/20 to-transparent"
            aria-hidden="true"
          />
        )}

        <PageContainer className="editorial-grid items-center">
          <BrandLogo
            tone={overlay ? "light" : "dark"}
            size="header"
            className="col-span-3 transition-colors duration-500 sm:col-span-6 lg:col-span-3"
          />

          <nav
            className="hidden items-center justify-center gap-6 lg:col-span-7 lg:flex xl:gap-9"
            aria-label="Primary navigation"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "nav-link whitespace-nowrap font-sans text-[10px] font-medium uppercase tracking-[0.2em] transition-colors duration-300",
                    overlay ? "text-ivory" : "text-charcoal",
                    isActive && (overlay ? "text-gold-soft" : "text-olive"),
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="col-span-1 flex items-center justify-end gap-4 sm:col-span-2 sm:gap-5 lg:col-span-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className={cn("hidden rounded-full p-2 transition-[background-color,color] duration-300 hover:bg-white/10 sm:block", toolColor)}
            >
              <SearchIcon size={18} strokeWidth={1.5} />
            </button>
            <NavLink
              to="/admin/login"
              aria-label="Account"
              className={cn("hidden rounded-full p-2 transition-[background-color,color] duration-300 hover:bg-white/10 sm:block", toolColor)}
            >
              <User size={18} strokeWidth={1.5} />
            </NavLink>
            <button
              type="button"
              onClick={openDrawer}
              aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
              className={cn("relative rounded-full p-2 transition-[background-color,color] duration-300 hover:bg-white/10", toolColor)}
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-olive px-1 font-sans text-[9px] font-medium text-ivory">
                  {itemCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className={cn("rounded-full p-2 transition-[background-color,color] duration-300 hover:bg-white/10 lg:hidden", toolColor)}
            >
              <Menu size={21} strokeWidth={1.5} />
            </button>
          </div>
        </PageContainer>
      </header>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} onOpenSearch={() => setSearchOpen(true)} />
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
