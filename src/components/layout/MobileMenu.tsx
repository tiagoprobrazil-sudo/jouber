import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { X, Search as SearchIcon, ShoppingBag } from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { useLockBodyScroll } from "@/lib/hooks/useLockBodyScroll";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils/cn";
import { BrandMark } from "@/components/brand/BrandMark";

const NAV_ITEMS = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "The Artist", to: "/artist" },
  { label: "Journal", to: "/journal" },
  { label: "Contact", to: "/contact" },
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
}

export function MobileMenu({ isOpen, onClose, onOpenSearch }: MobileMenuProps) {
  useLockBodyScroll(isOpen);
  const { itemCount, openDrawer } = useCart();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => { document.removeEventListener("keydown", handleKeyDown); previouslyFocused?.focus(); };
  }, [isOpen, onClose]);

  return (
    <div
      ref={dialogRef}
      className={cn(
        "fixed inset-0 z-[100] flex flex-col bg-charcoal text-ivory transition-opacity duration-500 lg:hidden",
        isOpen ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Main menu"
      aria-hidden={!isOpen}
    >
      <div className="flex items-center justify-between px-6 py-6">
        <BrandMark decorative={false} size="sm" />
        <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close menu" className="p-2 transition-transform hover:rotate-90 motion-reduce:transition-none">
          <X size={24} strokeWidth={1.5} />
        </button>
      </div>

      <nav className="flex flex-1 flex-col justify-center gap-1 px-6 py-6 sm:px-10">
        {NAV_ITEMS.map((item, i) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "font-serif text-[2.35rem] leading-[1.08] transition-all duration-500 sm:text-5xl",
                isActive ? "text-gold-soft" : "text-ivory hover:text-stone",
              )
            }
            style={{ transitionDelay: isOpen ? `${i * 60}ms` : "0ms" }}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center justify-between border-t border-white/10 px-8 py-6">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSearch();
            }}
            className="flex items-center gap-2 text-sm uppercase tracking-wide text-stone"
            aria-label="Search"
          >
            <SearchIcon size={18} strokeWidth={1.5} />
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              openDrawer();
            }}
            className="flex items-center gap-2 text-sm uppercase tracking-wide text-stone"
            aria-label={`Cart, ${itemCount} items`}
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
            Cart ({itemCount})
          </button>
        </div>
        <a
          href="https://www.instagram.com/ateliersaintsebastian"
          target="_blank"
          rel="noreferrer"
          aria-label="Atelier Saint Sebastian on Instagram"
          className="text-stone transition-colors hover:text-ivory"
        >
          <InstagramIcon size={20} strokeWidth={1.5} />
        </a>
      </div>
    </div>
  );
}
