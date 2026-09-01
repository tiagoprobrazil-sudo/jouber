import { useEffect, useState } from "react";
import type { Order } from "@/lib/data/types";
import { getOrders } from "@/lib/data/repository";
import { resendOrderToPrintify, cancelPrintifyOrder } from "@/lib/printify";
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
  const [pendingAction, setPendingAction] = useState<{ id: string; action: "resend" | "cancel" } | null>(null);
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({});

  function reload() {
    getOrders().then(setOrders);
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleResend(order: Order) {
    setPendingAction({ id: order.id, action: "resend" });
    setActionErrors((e) => ({ ...e, [order.id]: "" }));
    try {
      await resendOrderToPrintify(order.id);
      reload();
    } catch (err) {
      setActionErrors((e) => ({ ...e, [order.id]: err instanceof Error ? err.message : "Could not resend this order to Printify." }));
    } finally {
      setPendingAction(null);
    }
  }

  async function handleCancel(order: Order) {
    if (!window.confirm("Cancel this order's Printify submission? This only works if it hasn't entered production yet.")) return;
    setPendingAction({ id: order.id, action: "cancel" });
    setActionErrors((e) => ({ ...e, [order.id]: "" }));
    try {
      await cancelPrintifyOrder(order.id);
      reload();
    } catch (err) {
      setActionErrors((e) => ({ ...e, [order.id]: err instanceof Error ? err.message : "Could not cancel this order." }));
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-admin-ink">Orders</h1>
      <p className="mt-1 font-sans text-sm text-admin-muted">Orders placed and paid for through checkout.</p>

      <div className="mt-8 overflow-x-auto border border-admin-border bg-admin-surface">
        <table className="w-full min-w-[820px] text-left font-sans text-sm">
          <thead className="border-b border-admin-border text-xs uppercase tracking-wide text-admin-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Tracking</th>
              <th className="px-5 py-3 font-medium text-right">Total</th>
              <th className="px-5 py-3 font-medium text-right">Printify</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border-soft">
            {orders?.map((o) => {
              const busy = pendingAction?.id === o.id ? pendingAction.action : null;
              const cancellable = o.printifyOrderId && o.status !== "cancelled" && o.status !== "refunded";
              return (
                <tr key={o.id}>
                  <td className="px-5 py-3.5 text-admin-ink">#{o.id.slice(0, 8)}</td>
                  <td className="px-5 py-3.5 text-admin-ink-muted">{o.customerEmail}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 text-xs uppercase tracking-wide ${STATUS_STYLES[o.status]}`}>{o.status}</span>
                  </td>
                  <td className="px-5 py-3.5 text-admin-ink-muted">{formatDate(o.createdAt)}</td>
                  <td className="px-5 py-3.5 text-admin-ink-muted">
                    {o.trackingNumber ? (
                      o.trackingUrl ? (
                        <a href={o.trackingUrl} target="_blank" rel="noreferrer" className="text-olive-dark underline-offset-2 hover:underline">
                          {o.carrier ? `${o.carrier} · ` : ""}
                          {o.trackingNumber}
                        </a>
                      ) : (
                        <span>{o.trackingNumber}</span>
                      )
                    ) : o.printifyOrderId ? (
                      "Printing…"
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right text-admin-ink">{formatPrice(o.subtotal)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex flex-col items-end gap-1">
                      {!o.printifyOrderId ? (
                        <button
                          type="button"
                          onClick={() => handleResend(o)}
                          disabled={busy === "resend"}
                          className="font-sans text-xs uppercase tracking-wide text-olive hover:text-olive-dark disabled:opacity-50"
                        >
                          {busy === "resend" ? "Sending…" : "Resend to Printify"}
                        </button>
                      ) : cancellable ? (
                        <div className="flex items-center gap-3">
                          <span className="font-sans text-xs text-admin-muted">Sent</span>
                          <button
                            type="button"
                            onClick={() => handleCancel(o)}
                            disabled={busy === "cancel"}
                            className="font-sans text-xs uppercase tracking-wide text-red-700 hover:text-red-800 disabled:opacity-50"
                          >
                            {busy === "cancel" ? "Cancelling…" : "Cancel"}
                          </button>
                        </div>
                      ) : (
                        <span className="font-sans text-xs text-admin-muted">Sent</span>
                      )}
                      {actionErrors[o.id] && <span className="max-w-[220px] text-right font-sans text-[11px] text-red-700">{actionErrors[o.id]}</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
