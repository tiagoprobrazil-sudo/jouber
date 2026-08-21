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
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          overlay
            ? "border-b border-transparent bg-transparent py-5 sm:py-6 lg:py-7"
            : "border-b border-stone-dark/60 bg-ivory/95 py-3 backdrop-blur-[6px]",
        )}
      >
        {overlay && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-36 bg-gradient-to-b from-charcoal/50 via-charcoal/15 to-transparent"
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
                    "link-underline whitespace-nowrap font-sans text-[11px] font-medium uppercase tracking-[0.16em] transition-colors duration-300",
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
              className={cn("hidden p-1 transition-colors duration-300 sm:block", toolColor)}
            >
              <SearchIcon size={18} strokeWidth={1.5} />
            </button>
            <NavLink
              to="/admin/login"
              aria-label="Account"
              className={cn("hidden p-1 transition-colors duration-300 sm:block", toolColor)}
            >
              <User size={18} strokeWidth={1.5} />
            </NavLink>
            <button
              type="button"
              onClick={openDrawer}
              aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
              className={cn("relative p-1 transition-colors duration-300", toolColor)}
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
              className={cn("p-1 transition-colors duration-300 lg:hidden", toolColor)}
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
