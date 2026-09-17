import type { CatalogItem } from "@/lib/commissions/types";
import { formatBRL } from "@/lib/commissions/format";
import { Button } from "@/components/ui/Button";
import { ZoomIn } from "lucide-react";

interface CommissionCardProps {
  item: CatalogItem;
  /** Total price (atelier labor + source file), or null if the admin hasn't
   * set a labor price yet — the raw file price alone is never shown here,
   * since the customer is commissioning a finished piece, not the file. */
  totalPrice: number | null;
  onCommission: (item: CatalogItem) => void;
  onPreview: (item: CatalogItem) => void;
}

/** Card for the "Commissions" catalog — visually related to ProductCard but
 * intentionally its own component: these aren't the atelier's own products
 * (no internal slug/cart), they're sourced from a partner's feed. */
export function CommissionCard({ item, totalPrice, onCommission, onPreview }: CommissionCardProps) {
  return (
    <div className="group">
      <button
        type="button"
        onClick={() => onPreview(item)}
        aria-label={`Enlarge image of ${item.nome}`}
        aria-haspopup="dialog"
        className="group/preview relative block aspect-[4/5] w-full cursor-zoom-in overflow-hidden rounded-sm bg-stone"
      >
        <img
          src={item.imagem}
          alt={item.nome}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain"
        />
        <span
          aria-hidden="true"
          className="absolute bottom-3 right-3 rounded-full bg-cream/90 p-2 text-charcoal shadow-sm transition-colors group-hover/preview:bg-cream group-focus-visible/preview:bg-cream"
        >
          <ZoomIn size={18} strokeWidth={1.5} />
        </span>
      </button>

      <p className="mt-2 font-sans text-[11px] leading-relaxed text-warmgray-dark">
        As imagens são meramente ilustrativas, servem apenas para visualização e não refletem exatamente como será a pintura.
      </p>

      <div className="mt-3.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-1 font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-warmgray">
            {item.categoria}
          </p>
          <p className="truncate font-serif text-[1.05rem] leading-snug text-charcoal">{item.nome}</p>
        </div>
        {totalPrice !== null && (
          <span className="shrink-0 pt-[1.55rem] font-sans text-sm text-charcoal">{formatBRL(totalPrice)}</span>
        )}
      </div>

      {item.descricao_curta && (
        <p className="mt-2 line-clamp-2 font-sans text-[13px] leading-relaxed text-warmgray-dark">
          {item.descricao_curta}
        </p>
      )}

      <Button type="button" variant="secondary" size="sm" onClick={() => onCommission(item)} className="mt-3 w-full">
        Commission this piece
      </Button>
    </div>
  );
}
