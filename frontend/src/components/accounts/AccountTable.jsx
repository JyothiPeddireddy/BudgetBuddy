import { useState } from "react";
import { deleteAccount } from "../../api/accounts";

export default function AccountTable({ accounts, onDeleted, onEdit }) {
  const [confirmingId, setConfirmingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteAccount(id);
      onDeleted();
    } finally {
      setDeleting(false);
      setConfirmingId(null);
    }
  };

  if (!accounts.length) {
    return <p className="text-sm text-slate">No accounts yet — add one above.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs font-semibold text-slate border-b border-slate-100">
            <th className="pb-3 pr-4">Account</th>
            <th className="pb-3 pr-4">Type</th>
            <th className="pb-3 pr-4">Bank</th>
            <th className="pb-3 pr-4 text-right">Balance</th>
            <th className="pb-3 pr-4">Status</th>
            <th className="pb-3"></th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((a) => (
            <tr key={a.id} className="border-b border-slate-50 last:border-0">
              <td className="py-3.5 pr-4 font-semibold text-ink">{a.account_name}</td>
              <td className="py-3.5 pr-4 text-slate">{a.account_type}</td>
              <td className="py-3.5 pr-4 text-slate">{a.bank_name || "—"}</td>
              <td className="py-3.5 pr-4 text-right font-mono font-semibold text-emerald">
                ₹{a.balance.toFixed(2)}
              </td>
              <td className="py-3.5 pr-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
                  Active
                </span>
              </td>
              <td className="py-3.5">
                {confirmingId === a.id ? (
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => handleDelete(a.id)}
                      disabled={deleting}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-coral text-white hover:opacity-90 disabled:opacity-50"
                    >
                      {deleting ? "…" : "Confirm"}
                    </button>
                    <button
                      onClick={() => setConfirmingId(null)}
                      disabled={deleting}
                      className="px-3 py-1 rounded-full text-xs font-semibold border border-slate-300 text-slate"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => onEdit(a)}
                      className="px-3 py-1 rounded-full text-xs font-semibold border border-slate-300 text-slate hover:border-slate-400 hover:text-ink transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmingId(a.id)}
                      className="px-3 py-1 rounded-full text-xs font-semibold border border-coral/40 text-coral hover:border-coral hover:bg-coral-soft transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}