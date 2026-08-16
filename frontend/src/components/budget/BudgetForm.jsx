import { useState } from "react";
import { addBudget } from "../../api/transactions";

const CATEGORIES = [
  "Food",
  "Travel",
  "Shopping",
  "Education",
  "Entertainment",
  "Miscellaneous",
];

export default function BudgetForm({ onAdded }) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [monthYear, setMonthYear] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await addBudget({
        category,
        monthly_limit: parseFloat(monthlyLimit),
        month_year: monthYear,
      });

      setMonthlyLimit("");
      onAdded();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not add budget.");
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

      <button
        type="submit"
        disabled={submitting}
        className="bg-[#2DD4BF] text-slate-900 font-semibold px-5 py-2.5 rounded-xl hover:bg-[#14B8A6] transition-all"
      >
        {submitting ? "Saving…" : "Set budget"}
      </button>
    </form>
  );
}