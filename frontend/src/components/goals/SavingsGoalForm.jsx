import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { addGoal } from "../../api/goals";
import { ICON_OPTIONS } from "./goalIcons";

export default function SavingsGoalForm({ onAdded, onCancel }) {
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [icon, setIcon] = useState(ICON_OPTIONS[0].key);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!targetDate) {
      setError("Target date is required.");
      return;
    }

    setSubmitting(true);
    try {
      await addGoal({
        title,
        target_amount: parseFloat(targetAmount),
        target_date: targetDate,
        icon,
      });
      setTitle("");
      setTargetAmount("");
      setTargetDate("");
      setIcon(ICON_OPTIONS[0].key);
      onAdded();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not add goal.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        {onCancel && (
          <button onClick={onCancel} className="text-slate hover:text-ink">
            <ArrowLeft size={18} />
          </button>
        )}
        <h2 className="font-display text-lg text-ink">Add New Goal</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate mb-1.5">Goal Name</label>
          <input
            type="text" required value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., New Laptop" className="field"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate mb-1.5">Target Amount</label>
          <input
            type="number" step="0.01" min="0.01" required
            value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="0" className="field"
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

        <div>
          <label className="block text-xs font-semibold text-slate mb-2">Icon</label>
          <div className="flex items-center gap-2.5">
            {ICON_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const selected = icon === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setIcon(opt.key)}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center border-2 transition-colors ${
                    selected ? `border-emerald ${opt.bg}` : "border-slate-100 bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={18} className={selected ? opt.text : "text-slate"} strokeWidth={2} />
                </button>
              );
            })}
          </div>
        </div>

        {error && <p className="text-sm text-coral">{error}</p>}

        <button
          type="submit" disabled={submitting}
          className="w-full bg-emerald text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create Goal"}
        </button>
      </form>
    </div>
  );
}