import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Product } from "@/lib/data/types";
import { getProducts, deleteProduct, updateProduct } from "@/lib/data/repository";
import { ButtonLink } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils/format";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[] | null>(null);

  function reload() {
    getProducts({}).then(setProducts);
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleDelete(product: Product) {
    if (!window.confirm(`Delete “${product.title}”? This cannot be undone.`)) return;
    await deleteProduct(product.id);
    reload();
  }

  async function toggleActive(product: Product) {
    await updateProduct(product.id, { active: !product.active });
    reload();
  }

  async function toggleFeatured(product: Product) {
    await updateProduct(product.id, { featured: !product.featured });
    reload();
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-charcoal">Products</h1>
          <p className="mt-1 font-sans text-sm text-warmgray">The atelier's shop.</p>
        </div>
        <ButtonLink to="/admin/products/new" icon={<Plus size={15} strokeWidth={1.5} />} size="sm">
          New Product
        </ButtonLink>
      </div>

      <div className="overflow-x-auto border border-stone-dark bg-cream">
        <table className="w-full min-w-[760px] text-left font-sans text-sm">
          <thead className="border-b border-stone-dark text-xs uppercase tracking-wide text-warmgray">
            <tr>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Price</th>
              <th className="px-5 py-3 font-medium">Stock</th>
              <th className="px-5 py-3 font-medium">Active</th>
              <th className="px-5 py-3 font-medium">Featured</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone">
            {products?.map((p) => (
              <tr key={p.id}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-10 shrink-0 overflow-hidden bg-stone">
                      <img src={p.images[0]?.url} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <p className="text-charcoal">{p.title}</p>
                      <p className="font-mono text-xs text-warmgray">{p.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-charcoal">{formatPrice(p.price)}</td>
                <td className="px-5 py-3 text-warmgray-dark">{p.stock}</td>
                <td className="px-5 py-3">
                  <button
                    type="button"
                    onClick={() => toggleActive(p)}
                    className={`px-2.5 py-1 text-xs uppercase tracking-wide ${p.active ? "bg-olive/15 text-olive-dark" : "bg-stone text-warmgray-dark"}`}
                  >
                    {p.active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-5 py-3">
                  <button
                    type="button"
                    onClick={() => toggleFeatured(p)}
                    className={`px-2.5 py-1 text-xs uppercase tracking-wide ${p.featured ? "bg-gold-soft/20 text-gold" : "bg-stone text-warmgray-dark"}`}
                  >
                    {p.featured ? "Featured" : "—"}
                  </button>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link to={`/admin/products/${p.id}`} aria-label={`Edit ${p.title}`} className="text-warmgray hover:text-charcoal">
                      <Pencil size={15} strokeWidth={1.5} />
                    </Link>
                    <button type="button" onClick={() => handleDelete(p)} aria-label={`Delete ${p.title}`} className="text-warmgray hover:text-red-700">
                      <Trash2 size={15} strokeWidth={1.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-warmgray">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
