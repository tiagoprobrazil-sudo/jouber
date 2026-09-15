/**
 * Types for the "Commissions" feature: a public catalog sourced from a
 * partner site's product-feed API (currently Exú Caveira's
 * public-products.php), letting visitors ask the atelier to hand-print
 * and finish one of those 3D-sculpted designs. The digital STL file
 * itself is still sold on the source site — this atelier only fulfills
 * the physical piece.
 */

export interface CatalogItem {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  descricao_curta: string;
  imagem: string;
  /** Where the buyer purchases the STL file itself (not on this site). */
  link_produto: string;
}

export interface CatalogPage {
  items: CatalogItem[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface CommissionRequestInput {
  product: CatalogItem;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  message?: string;
}

export interface CommissionRequestResult {
  requestId: string;
  buyLink: string;
}
