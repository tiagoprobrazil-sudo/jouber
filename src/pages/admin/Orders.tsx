import { useEffect, useState } from "react";
import type { Order } from "@/lib/data/types";
import { getOrders } from "@/lib/data/repository";
import { formatDate, formatPrice } from "@/lib/utils/format";

const STATUS_STYLES: Record<Order["status"], string> = {
  pending: "bg-stone text-warmgray-dark",
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
      <h1 className="font-serif text-3xl text-charcoal">Orders</h1>
      <p className="mt-1 font-sans text-sm text-warmgray">
        Illustrative data — connect a payment gateway and Supabase orders table to receive real orders here.
      </p>

      <div className="mt-8 overflow-x-auto border border-stone-dark bg-cream">
        <table className="w-full min-w-[640px] text-left font-sans text-sm">
          <thead className="border-b border-stone-dark text-xs uppercase tracking-wide text-warmgray">
            <tr>
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone">
            {orders?.map((o) => (
              <tr key={o.id}>
                <td className="px-5 py-3.5 text-charcoal">#{o.id}</td>
                <td className="px-5 py-3.5 text-warmgray-dark">{o.customerEmail}</td>
                <td className="px-5 py-3.5">
                  <span className={`px-2.5 py-1 text-xs uppercase tracking-wide ${STATUS_STYLES[o.status]}`}>{o.status}</span>
                </td>
                <td className="px-5 py-3.5 text-warmgray-dark">{formatDate(o.createdAt)}</td>
                <td className="px-5 py-3.5 text-right text-charcoal">{formatPrice(o.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
