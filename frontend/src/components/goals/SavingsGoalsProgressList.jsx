import { useNavigate } from "react-router-dom";
import { getGoalIcon } from "./goalIcons";

export default function SavingsGoalsProgressList({ goals }) {
  const navigate = useNavigate();

  if (!goals || goals.length === 0) {
    return (
      <p className="text-sm text-slate">
        No savings goals set up yet.
      </p>
    );
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center gap-3 pb-3 mb-1 border-b border-slate-200 text-[11px] font-semibold text-slate">
        <span className="flex-1 min-w-0">Goal</span>
        <span className="w-20 text-right shrink-0">Target Amount</span>
        <span className="w-20 text-right shrink-0">Saved Amount</span>
        <span className="w-28 shrink-0">Progress</span>
      </div>

      {/* Goals */}
      <ul>
        {goals.map((g) => {
          const { icon: Icon, bg, text, bar } = getGoalIcon(g.icon);

          const deadline = g.target_date
            ? new Date(g.target_date).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })
            : "No deadline";

          const progress = Math.min(100, Math.max(0, Number(g.progress_percent) || 0));

          return (
            <li
              key={g.id}
              className="flex items-center gap-3 py-4 border-b border-slate-100 last:border-b-0"
            >
              {/* Goal name + icon */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                  <Icon size={17} className={text} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-ink truncate">{g.title}</p>
                  <p className="text-[10px] text-slate mt-0.5">{deadline}</p>
                </div>
              </div>

              {/* Target Amount */}
              <span className="w-20 text-right text-xs font-semibold text-ink shrink-0">
                ₹{Number(g.target_amount).toLocaleString("en-IN")}
              </span>

              {/* Saved Amount */}
              <span className="w-20 text-right text-xs font-semibold text-ink shrink-0">
                ₹{Number(g.current_amount).toLocaleString("en-IN")}
              </span>

              {/* Progress */}
              <div className="w-28 shrink-0 flex items-center gap-2">
                <span className="text-xs font-bold text-ink w-8 shrink-0">{progress}%</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${bar}`} style={{ width: `${progress}%` }} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* View all goals */}
      <button
        type="button"
        onClick={() => navigate("/dashboard/goals")}
        className="mx-auto flex items-center justify-center gap-2 mt-4 pt-1 text-xs font-bold text-emerald hover:opacity-80 transition-opacity"
      >
        View all goals
        <span className="text-base leading-none">→</span>
      </button>
    </div>
  );
}