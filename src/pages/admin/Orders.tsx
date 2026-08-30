import { useEffect, useState } from "react";
import type { Order } from "@/lib/data/types";
import { getOrders } from "@/lib/data/repository";
import { formatDate, formatPrice } from "@/lib/utils/format";

const STATUS_STYLES: Record<Order["status"], string> = {
  pending: "bg-admin-border-soft text-admin-ink-muted",
  processing: "bg-gold-soft/20 text-gold",
  fulfilled: "bg-olive/15 text-olive-dark",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-red-100 text-red-700",
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    getOrders().then(setOrders);
  }, []);

  return (
    <div>
      <h1 className="font-serif text-3xl text-admin-ink">Orders</h1>
      <p className="mt-1 font-sans text-sm text-admin-muted">Orders placed and paid for through checkout.</p>

      <div className="mt-8 overflow-x-auto border border-admin-border bg-admin-surface">
        <table className="w-full min-w-[640px] text-left font-sans text-sm">
          <thead className="border-b border-admin-border text-xs uppercase tracking-wide text-admin-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border-soft">
            {orders?.map((o) => (
              <tr key={o.id}>
                <td className="px-5 py-3.5 text-admin-ink">#{o.id}</td>
                <td className="px-5 py-3.5 text-admin-ink-muted">{o.customerEmail}</td>
                <td className="px-5 py-3.5">
                  <span className={`px-2.5 py-1 text-xs uppercase tracking-wide ${STATUS_STYLES[o.status]}`}>{o.status}</span>
                </td>
                <td className="px-5 py-3.5 text-admin-ink-muted">{formatDate(o.createdAt)}</td>
                <td className="px-5 py-3.5 text-right text-admin-ink">{formatPrice(o.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
