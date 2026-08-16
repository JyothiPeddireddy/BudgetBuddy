import { deleteBudget } from "../../api/transactions";

export default function BudgetList({ budgets, onDeleted, onEdit }) {
  const handleDelete = async (id) => {
    await deleteBudget(id);
    onDeleted();
  };

  if (!budgets.length) {
    return <p className="text-sm text-slate">No budgets set yet.</p>;
  }

  return (
    <ul className="font-mono text-sm">
      {budgets.map((b) => (
        <li key={b.id} className="flex justify-between items-center py-3">
          <div>
            <span className="text-ink">{b.category}</span>
            <span className="block text-xs text-slate/60">
              {b.month_year}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-coral font-medium">
                -{b.monthly_limit.toFixed(2)}
            </span>

            <button
                onClick={() => onEdit(b)}
                className="text-xs px-2.5 py-1 rounded-md border border-slate/30 text-slate hover:border-ink hover:text-ink transition-colors"
            >
                Edit
            </button>

            <button
                onClick={() => handleDelete(b.id)}
                className="text-xs px-2.5 py-1 rounded-md border border-coral/30 text-coral hover:bg-coral hover:text-white transition-colors"
            >
                Delete
            </button>
            </div>
        </li>
      ))}
    </ul>
  );
}