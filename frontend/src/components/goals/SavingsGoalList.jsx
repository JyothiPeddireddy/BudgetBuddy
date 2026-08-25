import { ChevronRight } from "lucide-react";
import { getGoalIcon } from "./goalIcons";

export default function SavingsGoalList({ goals, onSelect }) {
  if (!goals.length) {
    return <p className="text-sm text-slate">No savings goals yet — add one to get started.</p>;
  }

  return (
    <ul className="divide-y divide-slate-50">
      {goals.map((g) => {
        const pct = Math.min(100, (g.current_amount / g.target_amount) * 100);
        const { icon: Icon, bg, text, bar } = getGoalIcon(g.icon);
        const remaining = Math.max(0, g.target_amount - g.current_amount);
        return (
          <li key={g.id}>
            <button
              onClick={() => onSelect(g)}
              className="w-full flex items-center gap-4 py-4 hover:bg-slate-50/60 rounded-lg px-2 -mx-2 transition-colors text-left"
            >
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon size={20} className={text} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-ink">{g.title}</span>
                  <span className="text-sm font-bold text-ink">{pct.toFixed(0)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                  <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs text-slate">
                  <span>₹{g.current_amount.toFixed(0)} / ₹{g.target_amount.toFixed(0)}</span>
                  <span>Remaining: ₹{remaining.toFixed(0)}</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate shrink-0" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}