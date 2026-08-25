import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { deleteIncome } from "../../api/transactions";
import { getSourceMeta } from "../../utils/sourceIcons";

export default function IncomeList({ incomes, onDeleted, onEdit }) {
  const [confirmingId, setConfirmingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteIncome(id);
      onDeleted();
    } finally {
      setDeleting(false);
      setConfirmingId(null);
    }
  };

  if (!incomes.length) {
    return <p className="text-sm text-slate">No income entries found.</p>;
  }

  return (
    <ul className="space-y-1">
      {incomes.map((i) => {
        const { icon: Icon, bg, text } = getSourceMeta(i.source);
        const isConfirming = confirmingId === i.id;
        return (
          <li key={i.id} className="group flex items-center justify-between py-2.5 rounded-lg hover:bg-slate-50/60 px-1 -mx-1 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                <Icon size={16} className={text} strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink truncate">
                  {i.source}{i.notes ? ` — ${i.notes}` : ""}
                </p>
                <p className="text-xs text-slate">
                  {new Date(i.date).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                </p>
              </div>
            </div>

            {isConfirming ? (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDelete(i.id)}
                  disabled={deleting}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold bg-coral text-white hover:opacity-90 disabled:opacity-50"
                >
                  {deleting ? "…" : "Delete"}
                </button>
                <button
                  onClick={() => setConfirmingId(null)}
                  disabled={deleting}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold border border-slate-300 text-slate"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-sm font-semibold text-emerald">+₹{i.amount.toFixed(0)}</span>
                <button
                  onClick={() => setConfirmingId(i.id)}
                  className="opacity-0 group-hover:opacity-100 text-[10px] text-coral hover:underline transition-opacity"
                >
                  Delete
                </button>
                <button onClick={() => onEdit(i)} className="text-slate hover:text-emerald transition-colors">
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}