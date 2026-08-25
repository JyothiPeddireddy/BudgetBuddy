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

  // --------------------------------------------------
  // Empty state
  // --------------------------------------------------

  if (!budgets.length) {
    return (
      <div className="py-10 text-center">

        <div className="text-4xl mb-3">
          🐷
        </div>

        <p className="text-sm font-semibold text-ink">
          No budgets set
        </p>

        <p className="text-xs text-slate mt-1">
          Create a budget to start tracking your spending.
        </p>

      </div>
    );
  }

  return (
    <ul className="space-y-5">

      {budgets.map((budget) => {

        const {
          icon: Icon,
          bg,
          text,
        } = getCategoryMeta(budget.category);

        const spent =
          spentByCategory[budget.category] || 0;

        const limit = budget.monthly_limit || 0;

        const pct =
          limit > 0
            ? Math.min((spent / limit) * 100, 100)
            : 0;

        const over =
          limit > 0 && spent > limit;

        const remaining =
          Math.max(limit - spent, 0);

        return (
          <li
            key={budget.id}
            className="
              group
              rounded-xl
              border border-slate-100
              p-4
              hover:border-slate-200
              hover:shadow-sm
              transition-all
            "
          >

            {/* -------------------------------------- */}
            {/* Header */}
            {/* -------------------------------------- */}

            <div className="flex items-center justify-between mb-3">

              <div className="flex items-center gap-3">

                {/* Category Icon */}
                <div
                  className={`
                    w-10 h-10
                    rounded-xl
                    ${bg}
                    flex items-center justify-center
                    shrink-0
                  `}
                >
                  <Icon
                    size={17}
                    className={text}
                    strokeWidth={2.2}
                  />
                </div>

                {/* Category Information */}
                <div>

                  <p className="text-sm font-semibold text-ink">
                    {budget.category}
                  </p>

                  <p className="text-xs text-slate mt-0.5">
                    ₹{spent.toFixed(0)} spent
                    {" / "}
                    ₹{limit.toFixed(0)}
                  </p>

                </div>

              </div>

              {/* Percentage + Actions */}
              <div className="flex items-center gap-3">

                <span
                  className={`
                    text-sm
                    font-bold
                    ${
                      over
                        ? "text-coral"
                        : "text-ink"
                    }
                  `}
                >
                  {pct.toFixed(0)}%
                </span>

                {/* Actions */}
                <div
                  className="
                    opacity-0
                    group-hover:opacity-100
                    transition-opacity
                    flex items-center gap-2
                  "
                >

                  {confirmingId === budget.id ? (
                    <>
                      <button
                        onClick={() =>
                          handleDelete(budget.id)
                        }
                        className="
                          text-[10px]
                          text-coral
                          font-semibold
                          hover:underline
                        "
                      >
                        Confirm
                      </button>

                      <button
                        onClick={() =>
                          setConfirmingId(null)
                        }
                        className="
                          text-[10px]
                          text-slate
                          hover:underline
                        "
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          onEdit(budget)
                        }
                        className="
                          text-[10px]
                          text-slate
                          hover:text-ink
                          font-semibold
                        "
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          setConfirmingId(budget.id)
                        }
                        className="
                          text-[10px]
                          text-coral
                          hover:underline
                          font-semibold
                        "
                      >
                        Delete
                      </button>
                    </>
                  )}

                </div>
              </div>
            </div>

            {/* -------------------------------------- */}
            {/* Progress Bar */}
            {/* -------------------------------------- */}

            <div className="w-full">

              <div
                className="
                  w-full
                  h-2
                  bg-slate-100
                  rounded-full
                  overflow-hidden
                "
              >
                <div
                  className={`
                    h-full
                    rounded-full
                    transition-all
                    duration-500
                    ${over ? "bg-coral" : ""}
                  `}
                  style={{
                    width: `${pct}%`,
                    background: over
                      ? undefined
                      : getCategoryMeta(
                          budget.category
                        ).color,
                  }}
                />
              </div>

            </div>

            {/* -------------------------------------- */}
            {/* Bottom Information */}
            {/* -------------------------------------- */}

            <div className="flex items-center justify-between mt-2">

              <span
                className={`
                  text-[11px]
                  ${
                    over
                      ? "text-coral font-semibold"
                      : "text-slate"
                  }
                `}
              >
                {over
                  ? `₹${(
                      spent - limit
                    ).toFixed(
                      0
                    )} over budget`
                  : `₹${remaining.toFixed(
                      0
                    )} remaining`}
              </span>

              <span className="text-[10px] text-slate">
                Monthly limit
              </span>

            </div>

          </li>
        );
      })}

    </ul>
  );
}