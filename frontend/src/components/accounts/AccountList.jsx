import { useState } from "react";
import { deleteAccount } from "../../api/accounts";

export default function AccountList({ accounts, onDeleted, onEdit }) {
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
    <ul className="space-y-3">
      {accounts.map((a) => (
        <li key={a.id} className="flex justify-between items-center">
          <div>
            <span className="text-ink">{a.account_name}</span>
            <span className="text-slate text-sm"> — {a.account_type}{a.bank_name ? ` · ${a.bank_name}` : ""}</span>
          </div>

          {confirmingId === a.id ? (
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-slate">Delete this account?</span>
              <button
                onClick={() => handleDelete(a.id)}
                disabled={deleting}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-coral text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                onClick={() => setConfirmingId(null)}
                disabled={deleting}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-slate-300 text-slate hover:text-ink transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-sm text-indigo mr-1">{a.balance.toFixed(2)}</span>
              <button
                onClick={() => onEdit(a)}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-slate-300 text-slate hover:border-slate-400 hover:text-ink transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setConfirmingId(a.id)}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-coral/40 text-coral hover:border-coral hover:bg-coral-soft transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}