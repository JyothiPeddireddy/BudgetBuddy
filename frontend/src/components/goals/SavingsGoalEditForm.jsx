import { useState } from "react";
import { updateGoal } from "../../api/goals";

export default function SavingsGoalEditForm({ goal, onSaved, onCancel }) {
  const [title, setTitle] = useState(goal.title || "");
  const [targetAmount, setTargetAmount] = useState(String(goal.target_amount));
  const [currentAmount, setCurrentAmount] = useState(String(goal.current_amount));
  const [targetDate, setTargetDate] = useState(goal.target_date || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Goal name is required.");
      return;
    }
    if (!targetDate) {
      setError("Target date is required.");
      return;
    }

    setSaving(true);
    try {
      await updateGoal(goal.id, {
        title: title.trim(),
        target_amount: parseFloat(targetAmount),
        current_amount: parseFloat(currentAmount),
        target_date: targetDate,
      });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not update goal.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-slate bg-slate-50 rounded-lg p-3">
        This corrects the numbers directly — it does <strong>not</strong> move money to or from any account.
      </p>

      <div>
        <label className="block text-xs font-semibold text-slate mb-1.5">Goal Name</label>
        <input
          type="text" required value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. New Laptop"
          className="field"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate mb-1.5">Target Amount</label>
        <input
          type="number" step="0.01" min="0.01" required
          value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)}
          className="field"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate mb-1.5">Current Amount Saved</label>
        <input
          type="number" step="0.01" min="0" required
          value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)}
          className="field"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate mb-1.5">Target Date</label>
        <input
          type="date" required value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="field"
        />
      </div>

      {error && <p className="text-sm text-coral">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button" onClick={onCancel}
          className="flex-1 px-5 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 text-slate hover:text-ink transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit" disabled={saving}
          className="flex-1 bg-emerald text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}