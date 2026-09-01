import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, RefreshCw, ExternalLink } from "lucide-react";
import { listPrintifyProducts, importPrintifyProduct, listPrintifyOrders, type PrintifyCatalogProduct, type PrintifyOrderSummary } from "@/lib/printify";
import { formatDate, formatPrice } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";

export default function Printify() {
  const [products, setProducts] = useState<PrintifyCatalogProduct[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [importedSlug, setImportedSlug] = useState<Record<string, string>>({});

  const [orders, setOrders] = useState<PrintifyOrderSummary[] | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  function reload() {
    setError(null);
    listPrintifyProducts()
      .then(setProducts)
      .catch(() => setError("Could not load the Printify catalog — check the connection in Settings."));
  }

  function reloadOrders() {
    setOrdersError(null);
    listPrintifyOrders()
      .then(setOrders)
      .catch(() => setOrdersError("Could not load Printify orders."));
  }

  useEffect(() => {
    reload();
    reloadOrders();
  }, []);

  async function handleImport(product: PrintifyCatalogProduct) {
    setImportingId(product.id);
    try {
      const { slug } = await importPrintifyProduct(product.id);
      setImportedSlug((s) => ({ ...s, [product.id]: slug }));
      reload();
    } catch {
      setError(`Could not import "${product.title}". Try again in a moment.`);
    } finally {
      setImportingId(null);
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-admin-ink">Printify Catalog</h1>
          <p className="mt-1 font-sans text-sm text-admin-muted">
            Products set up in your Printify shop. Import brings one in as a draft — pick categories and review the
            copy before publishing it.
          </p>
        </div>
        <button
          type="button"
          onClick={reload}
          className="flex items-center gap-1.5 font-sans text-xs uppercase tracking-wide text-admin-muted hover:text-admin-ink"
        >
          <RefreshCw size={13} strokeWidth={1.5} />
          Refresh
        </button>
      </div>

      {error && <p className="mb-4 font-sans text-sm text-red-700">{error}</p>}

      {products === null ? (
        <p className="font-sans text-sm text-admin-muted">Loading…</p>
      ) : products.length === 0 ? (
        <div className="border border-admin-border bg-admin-surface p-8 text-center">
          <p className="font-sans text-sm text-admin-ink">No products in your Printify shop yet.</p>
          <p className="mt-2 font-sans text-xs text-admin-muted">
            Create one at{" "}
            <a href="https://printify.com/app/products" target="_blank" rel="noreferrer" className="underline hover:text-admin-ink">
              printify.com
            </a>{" "}
            (pick a blueprint, print provider and upload your art), then refresh this page.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => {
            const slug = importedSlug[p.id];
            return (
              <div key={p.id} className="border border-admin-border bg-admin-surface p-3">
                <div className="aspect-square overflow-hidden bg-admin-border-soft">
                  {p.image && <img src={p.image} alt="" className="h-full w-full object-cover" />}
                </div>
                <p className="mt-2 font-sans text-sm text-admin-ink">{p.title}</p>
                <p className="font-sans text-xs text-admin-muted">
                  {p.variantCount} variant{p.variantCount === 1 ? "" : "s"}
                </p>
                {slug ? (
                  <Link
                    to={`/admin/products`}
                    className="mt-3 flex items-center justify-center gap-1.5 border border-olive px-3 py-2 font-sans text-xs uppercase tracking-wide text-olive hover:bg-olive hover:text-ivory"
                  >
                    <CheckCircle2 size={13} strokeWidth={1.5} />
                    Imported — edit
                  </Link>
                ) : (
                  <Button size="sm" className="mt-3 w-full" disabled={importingId === p.id} onClick={() => handleImport(p)}>
                    {importingId === p.id ? "Importing…" : p.imported ? "Re-sync" : "Import"}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <a
        href="https://printify.com/app/products"
        target="_blank"
        rel="noreferrer"
        className="mt-8 flex items-center gap-1.5 font-sans text-xs uppercase tracking-wide text-admin-muted hover:text-admin-ink"
      >
        Manage products on Printify
        <ExternalLink size={12} strokeWidth={1.5} />
      </a>

      <div className="mt-12 border-t border-admin-border pt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl text-admin-ink">All Printify Orders</h2>
            <p className="mt-1 font-sans text-xs text-admin-muted">
              Every order in the shop, for reconciliation — not just ones placed through Jouber's checkout.
            </p>
          </div>
          <button
            type="button"
            onClick={reloadOrders}
            className="flex items-center gap-1.5 font-sans text-xs uppercase tracking-wide text-admin-muted hover:text-admin-ink"
          >
            <RefreshCw size={13} strokeWidth={1.5} />
            Refresh
          </button>
        </div>

        {ordersError && <p className="mb-4 font-sans text-sm text-red-700">{ordersError}</p>}

        {orders === null ? (
          <p className="font-sans text-sm text-admin-muted">Loading…</p>
        ) : orders.length === 0 ? (
          <p className="font-sans text-sm text-admin-muted">No orders in the Printify shop yet.</p>
        ) : (
          <div className="overflow-x-auto border border-admin-border bg-admin-surface">
            <table className="w-full min-w-[640px] text-left font-sans text-sm">
              <thead className="border-b border-admin-border text-xs uppercase tracking-wide text-admin-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium text-right">Items</th>
                  <th className="px-5 py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border-soft">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-5 py-3.5 text-admin-ink">
                      {o.trackingUrl ? (
                        <a href={o.trackingUrl} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
                          #{o.id.slice(0, 8)}
                        </a>
                      ) : (
                        `#${o.id.slice(0, 8)}`
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-admin-ink-muted">{o.customerName ?? "—"}</td>
                    <td className="px-5 py-3.5 text-admin-ink-muted">{o.status}</td>
                    <td className="px-5 py-3.5 text-admin-ink-muted">{formatDate(o.createdAt)}</td>
                    <td className="px-5 py-3.5 text-right text-admin-ink-muted">{o.itemCount}</td>
                    <td className="px-5 py-3.5 text-right text-admin-ink">{formatPrice(o.totalCents / 100)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
