import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import {
  listCommissionRequests,
  updateCommissionRequestStatus,
  type CommissionRequestRow,
  type CommissionRequestStatus,
} from "@/lib/commissions/adminRequests";
import { formatDate } from "@/lib/utils/format";
import { formatBRL } from "@/lib/commissions/format";

const STATUS_OPTIONS: CommissionRequestStatus[] = ["new", "contacted", "in_progress", "completed", "cancelled"];

const STATUS_STYLES: Record<CommissionRequestStatus, string> = {
  new: "bg-gold-soft/20 text-gold",
  contacted: "bg-admin-border-soft text-admin-ink-muted",
  in_progress: "bg-admin-border-soft text-admin-ink-muted",
  completed: "bg-olive/15 text-olive-dark",
  cancelled: "bg-red-100 text-red-700",
};

export default function Commissions() {
  const [requests, setRequests] = useState<CommissionRequestRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  function reload() {
    listCommissionRequests()
      .then(setRequests)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load commission requests."));
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleStatusChange(id: string, status: CommissionRequestStatus) {
    setPendingId(id);
    try {
      await updateCommissionRequestStatus(id, status);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update this request.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-admin-ink">Commissions</h1>
      <p className="mt-1 font-sans text-sm text-admin-muted">
        Requests from the public "Commissions" page — customers asking to have a partner-catalog piece
        hand-printed and finished. The STL file itself is bought on the source site, not here.
      </p>

      {error && <p className="mt-4 font-sans text-sm text-red-700">{error}</p>}

      <div className="mt-8 overflow-x-auto border border-admin-border bg-admin-surface">
        <table className="w-full min-w-[900px] text-left font-sans text-sm">
          <thead className="border-b border-admin-border text-xs uppercase tracking-wide text-admin-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Piece</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Notes</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">STL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border-soft">
            {requests?.map((r) => (
              <tr key={r.id}>
                <td className="px-5 py-3.5 text-admin-ink">
                  <div className="flex items-center gap-3">
                    {r.source_product_image && (
                      <img src={r.source_product_image} alt="" className="h-10 w-10 rounded-sm object-cover" />
                    )}
                    <div>
                      <p>{r.source_product_name}</p>
                      <p className="text-xs text-admin-muted">
                        {r.source_product_category}
                        {r.source_product_price != null ? ` · ${formatBRL(r.source_product_price)}` : ""}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-admin-ink-muted">
                  <p>{r.customer_name}</p>
                  <p className="text-xs">{r.customer_email}</p>
                  {r.customer_phone && <p className="text-xs">{r.customer_phone}</p>}
                </td>
                <td className="max-w-[220px] px-5 py-3.5 text-xs text-admin-ink-muted">{r.message || "—"}</td>
                <td className="px-5 py-3.5 text-admin-ink-muted">{formatDate(r.created_at)}</td>
                <td className="px-5 py-3.5">
                  <select
                    value={r.status}
                    disabled={pendingId === r.id}
                    onChange={(e) => handleStatusChange(r.id, e.target.value as CommissionRequestStatus)}
                    className={`border-0 px-2.5 py-1 text-xs uppercase tracking-wide ${STATUS_STYLES[r.status]}`}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <a
                    href={r.source_product_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-sans text-xs uppercase tracking-wide text-olive hover:text-olive-dark"
                  >
                    Buy link
                    <ExternalLink size={12} strokeWidth={1.5} />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {requests && requests.length === 0 && (
          <p className="px-5 py-10 text-center font-sans text-sm text-admin-muted">No commission requests yet.</p>
        )}
      </div>
    </div>
  );
}
