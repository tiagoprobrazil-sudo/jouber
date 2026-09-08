import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Coupon } from "@/lib/data/types";
import { getCoupons, deleteCoupon } from "@/lib/data/repository";
import { ButtonLink } from "@/components/ui/Button";
import { formatPrice, formatDate } from "@/lib/utils/format";

const TYPE_LABELS: Record<Coupon["discountType"], string> = {
  percent: "% Discount",
  fixed_cart: "Fixed cart discount",
  fixed_product: "Fixed product discount",
};

function formatAmount(coupon: Coupon): string {
  return coupon.discountType === "percent" ? `${coupon.amount}%` : formatPrice(coupon.amount);
}

function isExpired(coupon: Coupon): boolean {
  if (!coupon.expiryDate) return false;
  return coupon.expiryDate < new Date().toISOString().slice(0, 10);
}

export default function Coupons() {
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);

  function reload() {
    getCoupons().then(setCoupons);
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleDelete(coupon: Coupon) {
    if (!window.confirm(`Delete coupon “${coupon.code}”? This cannot be undone.`)) return;
    await deleteCoupon(coupon.id);
    reload();
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-admin-ink">Coupons</h1>
          <p className="mt-1 font-sans text-sm text-admin-muted">Discount codes shoppers can apply at cart or checkout.</p>
        </div>
        <ButtonLink to="/admin/coupons/new" icon={<Plus size={15} strokeWidth={1.5} />} size="sm">
          New Coupon
        </ButtonLink>
      </div>

      <div className="overflow-x-auto border border-admin-border bg-admin-surface">
        <table className="w-full min-w-[820px] text-left font-sans text-sm">
          <thead className="border-b border-admin-border text-xs uppercase tracking-wide text-admin-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Code</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Usage / Limit</th>
              <th className="px-5 py-3 font-medium">Expiry</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border-soft">
            {coupons?.map((c) => {
              const expired = isExpired(c);
              return (
                <tr key={c.id}>
                  <td className="px-5 py-3">
                    <p className="font-mono text-sm text-admin-ink">{c.code}</p>
                    {c.description && <p className="mt-0.5 max-w-[240px] truncate text-xs text-admin-muted">{c.description}</p>}
                  </td>
                  <td className="px-5 py-3 text-admin-ink-muted">{TYPE_LABELS[c.discountType]}</td>
                  <td className="px-5 py-3 text-admin-ink">
                    {formatAmount(c)}
                    {c.freeShipping && <span className="ml-1.5 text-xs text-olive-dark">+ free shipping</span>}
                  </td>
                  <td className="px-5 py-3 text-admin-ink-muted">
                    {c.usageCount}
                    {c.usageLimit != null ? ` / ${c.usageLimit}` : ""}
                  </td>
                  <td className="px-5 py-3 text-admin-ink-muted">{c.expiryDate ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2.5 py-1 text-xs uppercase tracking-wide ${
                        !c.active ? "bg-admin-border-soft text-admin-ink-muted" : expired ? "bg-red-100 text-red-700" : "bg-olive/15 text-olive-dark"
                      }`}
                    >
                      {!c.active ? "Disabled" : expired ? "Expired" : "Active"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link to={`/admin/coupons/${c.id}`} aria-label={`Edit ${c.code}`} className="text-admin-muted hover:text-admin-ink">
                        <Pencil size={15} strokeWidth={1.5} />
                      </Link>
                      <button type="button" onClick={() => handleDelete(c)} aria-label={`Delete ${c.code}`} className="text-admin-muted hover:text-red-700">
                        <Trash2 size={15} strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {coupons?.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-admin-muted">
                  No coupons yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {coupons && coupons.length > 0 && (
        <p className="mt-3 font-sans text-xs text-admin-muted">Last updated coupon: {formatDate(coupons[0].updatedAt)}</p>
      )}
    </div>
  );
}
