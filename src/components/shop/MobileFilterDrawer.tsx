import { useRef } from "react";
import { X } from "lucide-react";
import type { ProductCategory, ProductFilters } from "@/lib/data/types";
import { FiltersPanel } from "@/components/shop/FiltersPanel";
import { useLockBodyScroll } from "@/lib/hooks/useLockBodyScroll";
import { Button } from "@/components/ui/Button";
import { useDialogFocus } from "@/lib/hooks/useDialogFocus";

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ProductCategory[];
  filters: ProductFilters;
  onChange: (next: ProductFilters) => void;
  resultCount: number;
}

export function MobileFilterDrawer({ isOpen, onClose, categories, filters, onChange, resultCount }: MobileFilterDrawerProps) {
  useLockBodyScroll(isOpen);
  const dialogRef = useRef<HTMLElement>(null);
  useDialogFocus(isOpen, dialogRef, onClose);

  return (
    <>
      <div
        className={`fixed inset-0 z-[110] bg-charcoal/40 transition-opacity duration-500 md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Filter and sort"
        aria-hidden={!isOpen}
        className={`fixed left-0 top-0 z-[120] flex h-full w-full max-w-xs flex-col bg-cream transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-stone-dark px-6 py-5">
          <h2 className="font-serif text-lg">Filter</h2>
          <button type="button" onClick={onClose} aria-label="Close filters" className="p-1">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <FiltersPanel categories={categories} filters={filters} onChange={onChange} />
        </div>
        <div className="border-t border-stone-dark px-6 py-5">
          <Button variant="primary" className="w-full" onClick={onClose}>
            Show {resultCount} {resultCount === 1 ? "Work" : "Works"}
          </Button>
        </div>
      </aside>
    </>
  );
}
