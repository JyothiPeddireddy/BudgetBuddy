import { useState } from "react";
import { addGoal } from "../../api/goals";

export default function SavingsGoalForm({ onAdded }) {
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await addGoal({
        title,
        target_amount: parseFloat(targetAmount),
        target_date: targetDate || null,
      });
      setTitle("");
      setTargetAmount("");
      setTargetDate("");
      onAdded();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not add goal.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <input
          type="text" required value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Goal title (e.g. Trip to Goa)" className="field"
        />
        <input
          type="number" step="0.01" min="0.01" required
          value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)}
          placeholder="Target amount" className="field"
        />
        <input
          type="date" value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="field"
        />
      </div>
      {error && <p className="text-sm text-coral">{error}</p>}
      <button
        type="submit" disabled={submitting}
        className="bg-indigo text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {submitting ? "Adding…" : "Add goal"}
      </button>
    </form>
  );
}