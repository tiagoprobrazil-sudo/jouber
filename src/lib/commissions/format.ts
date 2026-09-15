/** Exú Caveira lists prices in Brazilian Reais — kept separate from the
 * atelier's own `formatPrice` (which defaults to USD for the shop's own
 * products) since this catalog is sourced from a different, BRL-priced
 * site. */
export function formatBRL(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(amount);
}
