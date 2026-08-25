import { useState, useEffect } from "react";
import { addBudget, updateBudget } from "../../api/transactions";

const CATEGORIES = [
  "Food",
  "Travel",
  "Shopping",
  "Education",
  "Entertainment",
  "Miscellaneous",
];

export default function BudgetForm({ onAdded, onUpdated, editingBudget, onCancelEdit }) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [monthYear, setMonthYear] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isEditing = Boolean(editingBudget);

  useEffect(() => {
    if (editingBudget) {
      setCategory(editingBudget.category);
      setMonthlyLimit(String(editingBudget.monthly_limit));
      setMonthYear(editingBudget.month_year);
      setError("");
    } else {
      setCategory(CATEGORIES[0]);
      setMonthlyLimit("");
      setMonthYear(new Date().toISOString().slice(0, 7));
      setError("");
    }
  }, [editingBudget]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = {
      category,
      monthly_limit: parseFloat(monthlyLimit),
      month_year: monthYear,
    };

    try {
      if (isEditing) {
        await updateBudget(editingBudget.id, payload);
        onUpdated();
      } else {
        await addBudget(payload);
        setMonthlyLimit("");
        onAdded();
      }
    } catch (err) {
      setError(err.response?.data?.detail || `Could not ${isEditing ? "update" : "add"} budget.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="field"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          type="number"
          step="0.01"
          min="0.01"
          required
          value={monthlyLimit}
          onChange={(e) => setMonthlyLimit(e.target.value)}
          placeholder="Monthly limit"
          className="field"
        />

        <input
          type="month"
          required
          value={monthYear}
          onChange={(e) => setMonthYear(e.target.value)}
          className="field"
        />
      </div>

      {error && <p className="text-sm text-indigo">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="bg-[#2DD4BF] text-slate-900 font-semibold px-5 py-2.5 rounded-xl hover:bg-[#14B8A6] transition-all disabled:opacity-50"
        >
          {submitting ? (isEditing ? "Updating…" : "Saving…") : (isEditing ? "Update budget" : "Set budget")}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-sm text-slate hover:text-ink"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}