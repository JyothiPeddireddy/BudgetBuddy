import { useState } from "react";
import { getCategoryMeta } from "../../utils/categoryIcons";
import { deleteBudget } from "../../api/transactions";

export default function BudgetList({
  budgets,
  spentByCategory,
  onDeleted,
  onEdit,
}) {
  const [confirmingId, setConfirmingId] = useState(null);

  const handleDelete = async (id) => {
    try {
      await deleteBudget(id);
      setConfirmingId(null);
      onDeleted();
    } catch (error) {
      console.error("Failed to delete budget:", error);
    }
  };

  // Empty state
  if (!budgets.length) {
    return (
      <div className="py-10 text-center">
        <div className="text-4xl mb-3">🐷</div>

        <p className="text-sm font-semibold text-ink">No budgets set</p>

        <p className="text-xs text-slate mt-1">
          Create a budget to start tracking your spending.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-4 sm:space-y-5">
      {budgets.map((budget) => {
        const meta = getCategoryMeta(budget.category);
        const { icon: Icon, bg, text } = meta;

        const spent = spentByCategory[budget.category] || 0;
        const limit = budget.monthly_limit || 0;
        const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
        const over = limit > 0 && spent > limit;
        const remaining = Math.max(limit - spent, 0);

        return (
          <li
            key={budget.id}
            className="group rounded-xl border border-slate-100 p-3.5 sm:p-4 hover:border-slate-200 hover:shadow-sm transition-all"
          >
            {/* Header */}
            <div className="flex items-start sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon size={17} className={text} strokeWidth={2.2} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">
                    {budget.category}
                  </p>
                  <p className="text-xs text-slate mt-0.5">
                    ₹{spent.toFixed(0)} spent / ₹{limit.toFixed(0)}
                  </p>
                </div>
              </div>

              {/* Percentage + actions
                  Phone: actions sit under the percentage and are ALWAYS visible.
                  Laptop: actions appear when you hover the card. */}
              <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3 shrink-0">
                <span className={`text-sm font-bold ${over ? "text-coral" : "text-ink"}`}>
                  {pct.toFixed(0)}%
                </span>

                <div className="flex items-center gap-3 sm:gap-2 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100">
                  {confirmingId === budget.id ? (
                    <>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        className="text-xs sm:text-[10px] text-coral font-semibold hover:underline py-1"
                      >
                        Confirm
                      </button>

                      <button
                        onClick={() => setConfirmingId(null)}
                        className="text-xs sm:text-[10px] text-slate hover:underline py-1"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => onEdit(budget)}
                        className="text-xs sm:text-[10px] text-slate hover:text-ink font-semibold py-1"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => setConfirmingId(budget.id)}
                        className="text-xs sm:text-[10px] text-coral hover:underline font-semibold py-1"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${over ? "bg-coral" : ""}`}
                style={{
                  width: `${pct}%`,
                  background: over ? undefined : meta.color,
                }}
              />
            </div>

            {/* Bottom Information */}
            <div className="flex items-center justify-between gap-2 mt-2">
              <span className={`text-[11px] ${over ? "text-coral font-semibold" : "text-slate"}`}>
                {over
                  ? `₹${(spent - limit).toFixed(0)} over budget`
                  : `₹${remaining.toFixed(0)} remaining`}
              </span>

              <span className="text-[10px] text-slate shrink-0">Monthly limit</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}