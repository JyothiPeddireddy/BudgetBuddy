import { useState } from "react";
import { deleteGoal, contributeToGoal } from "../../api/goals";

export default function SavingsGoalList({ goals, onChanged }) {
  const [contributingId, setContributingId] = useState(null);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  const handleContribute = async (id) => {
    if (!amount || parseFloat(amount) <= 0) return;
    setBusy(true);
    try {
      await contributeToGoal(id, parseFloat(amount));
      setAmount("");
      setContributingId(null);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteGoal(id);
    onChanged();
  };

  if (!goals.length) {
    return <p className="text-sm text-slate">No savings goals yet — add one above.</p>;
  }

  return (
    <ul className="space-y-5">
      {goals.map((g) => {
        const pct = Math.min(100, (g.current_amount / g.target_amount) * 100);
        return (
          <li key={g.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-ink font-medium">{g.title}</span>
                {g.status === "completed" && (
                  <span className="ml-2 text-xs text-emerald font-medium">Completed</span>
                )}
              </div>
              <span className="font-mono text-sm text-slate">
                {g.current_amount.toFixed(2)} / {g.target_amount.toFixed(2)}
              </span>
            </div>

            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${g.status === "completed" ? "bg-emerald" : "bg-indigo"}`}
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="flex items-center gap-2.5">
              {contributingId === g.id ? (
                <>
                  <input
                    type="number" step="0.01" min="0.01" autoFocus
                    value={amount} onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount" className="field text-sm py-1.5 w-32"
                  />
                  <button
                    onClick={() => handleContribute(g.id)}
                    disabled={busy}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {busy ? "Saving…" : "Confirm"}
                  </button>
                  <button
                    onClick={() => { setContributingId(null); setAmount(""); }}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border border-slate-300 text-slate hover:text-ink"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  {g.status !== "completed" && (
                    <button
                      onClick={() => setContributingId(g.id)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-slate-300 text-slate hover:border-slate-400 hover:text-ink transition-colors"
                    >
                      Contribute
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-coral/40 text-coral hover:border-coral hover:bg-coral-soft transition-colors"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}