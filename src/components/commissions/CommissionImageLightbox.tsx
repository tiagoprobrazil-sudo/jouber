import { useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useDialogFocus } from "@/lib/hooks/useDialogFocus";
import { useLockBodyScroll } from "@/lib/hooks/useLockBodyScroll";
import type { CatalogItem } from "@/lib/commissions/types";

interface CommissionImageLightboxProps {
  item: CatalogItem | null;
  onClose: () => void;
}

export function CommissionImageLightbox({ item, onClose }: CommissionImageLightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const isOpen = item !== null;
  useLockBodyScroll(isOpen);
  useDialogFocus(isOpen, dialogRef, onClose);

  if (!item) return null;

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-charcoal/95 px-4 pb-6 pt-20 sm:px-10"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close enlarged image"
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-cream/10 text-ivory transition-colors hover:bg-cream/20 focus-visible:outline-ivory sm:right-6 sm:top-6"
      >
        <X size={24} strokeWidth={1.5} />
      </button>

      <figure className="flex max-h-full min-h-0 min-w-0 max-w-6xl flex-col items-center gap-4">
        <img
          src={item.imagem}
          alt={item.nome}
          decoding="async"
          className="block min-h-0 max-h-[calc(100dvh-12rem)] w-auto max-w-full rounded-sm object-contain"
        />
        <p className="max-w-6xl text-center font-sans text-[12px] leading-relaxed text-stone-light">
          As imagens são meramente ilustrativas, servem apenas para visualização e não refletem exatamente como será a pintura.
        </p>
        <figcaption
          id={titleId}
          className="max-h-20 shrink-0 overflow-y-auto text-center font-serif text-xl text-ivory sm:text-2xl"
        >
          {item.nome}
        </figcaption>
      </figure>
    </div>,
    document.body,
  );
}
