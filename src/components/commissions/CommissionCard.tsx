import type { CatalogItem } from "@/lib/commissions/types";
import { formatBRL } from "@/lib/commissions/format";
import { Button } from "@/components/ui/Button";

interface CommissionCardProps {
  item: CatalogItem;
  onCommission: (item: CatalogItem) => void;
}

/** Card for the "Commissions" catalog — visually related to ProductCard but
 * intentionally its own component: these aren't the atelier's own products
 * (no internal slug/cart), they're sourced from a partner's feed and the
 * only action is opening the commission-request form. */
export function CommissionCard({ item, onCommission }: CommissionCardProps) {
  return (
    <div className="group">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-stone">
        <img
          src={item.imagem}
          alt={item.nome}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
        />
      </div>

      <div className="mt-3.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-1 font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-warmgray">
            {item.categoria}
          </p>
          <p className="truncate font-serif text-[1.05rem] leading-snug text-charcoal">{item.nome}</p>
        </div>
        <span className="shrink-0 pt-[1.55rem] font-sans text-sm text-charcoal">{formatBRL(item.preco)}</span>
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
