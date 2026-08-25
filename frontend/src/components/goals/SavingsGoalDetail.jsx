import { useState, useEffect } from "react";
import { ArrowLeft, Clock, Calendar, CalendarDays, Pencil } from "lucide-react";
import { contributeToGoal } from "../../api/goals";
import { getAccounts } from "../../api/accounts";
import { getGoalIcon } from "./goalIcons";
import RadialProgress from "../charts/RadialProgress";
import SavingsGoalEditForm from "./SavingsGoalEditForm";

export default function SavingsGoalDetail({ goal, onBack, onChanged }) {
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    getAccounts().then((res) => {
      setAccounts(res.data);
      if (res.data.length > 0) setAccountId(res.data[0].id);
    });
  }, []);

  const pct = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
  const remaining = Math.max(0, goal.target_amount - goal.current_amount);
  const { icon: Icon, bg, text } = getGoalIcon(goal.icon);
  const isCompleted = goal.status === "completed";

  const selectedAccount = accounts.find((a) => a.id === Number(accountId));

  const handleAddMoney = async () => {
    setError("");
    if (!accountId) { setError("Please add an account first."); return; }
    if (!amount || parseFloat(amount) <= 0) { setError("Enter a valid amount."); return; }
    if (selectedAccount && parseFloat(amount) > selectedAccount.balance) {
      setError(`Insufficient funds — only ₹${selectedAccount.balance.toFixed(2)} available in this account.`);
      return;
    }
    setAdding(true);
    try {
      await contributeToGoal(goal.id, Number(accountId), parseFloat(amount));
      setAmount("");
      onChanged();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not add money.");
    } finally {
      setAdding(false);
    }
  };

  if (editing) {
    return (
      <div>
        <button onClick={() => setEditing(false)} className="flex items-center gap-2 text-slate hover:text-ink text-sm mb-6">
          <ArrowLeft size={16} /> Back to goal
        </button>
        <h2 className="font-display text-lg text-ink mb-6">Edit "{goal.title}"</h2>
        <SavingsGoalEditForm
          goal={goal}
          onSaved={() => { setEditing(false); onChanged(); }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="text-center py-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate hover:text-ink text-sm mb-6">
          <ArrowLeft size={16} /> Back to goals
        </button>
        <div className="w-20 h-20 rounded-full bg-emerald-soft flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🎉</span>
        </div>
        <h2 className="font-display text-xl text-emerald font-bold mb-1">Goal Completed!</h2>
        <p className="text-sm text-slate mb-6">Congratulations! You've achieved your goal.</p>

        <div className="card p-5 max-w-sm mx-auto text-left">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon size={18} className={text} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink">{goal.title}</p>
              <p className="text-xs text-slate">₹{goal.current_amount.toFixed(0)} / ₹{goal.target_amount.toFixed(0)}</p>
            </div>
            <span className="text-sm font-bold text-emerald">{pct.toFixed(0)}%</span>
          </div>
          <div className="w-full h-2 bg-emerald-soft rounded-full overflow-hidden">
            <div className="h-full bg-emerald rounded-full" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setEditing(true)}
            className="border border-slate-200 text-ink px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onBack}
            className="border border-emerald text-emerald px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-soft transition-colors"
          >
            Back to Goals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate hover:text-ink text-sm">
          <ArrowLeft size={16} /> Back to goals
        </button>
        <button onClick={() => setEditing(true)} className="text-slate hover:text-emerald transition-colors">
          <Pencil size={16} />
        </button>
      </div>

      <h2 className="font-display text-lg text-ink mb-6">{goal.title}</h2>

      <div className="flex flex-col items-center mb-6">
        <RadialProgress
          value={goal.current_amount}
          max={goal.target_amount}
          size={140}
          thickness={13}
          color="#10b981"
          label="Saved"
          sublabel={`₹${goal.current_amount.toFixed(0)}`}
        />
        <p className="text-xs text-slate mt-2">Target Amount ₹{goal.target_amount.toFixed(0)}</p>
      </div>

      <div className="space-y-1 mb-6">
        <div className="flex items-center justify-between py-2.5 border-b border-slate-50">
          <span className="flex items-center gap-2 text-sm text-slate">
            <Clock size={15} /> Remaining Amount
          </span>
          <span className="text-sm font-semibold text-ink">₹{remaining.toFixed(0)}</span>
        </div>
        {goal.target_date && (
          <div className="flex items-center justify-between py-2.5 border-b border-slate-50">
            <span className="flex items-center gap-2 text-sm text-slate">
              <Calendar size={15} /> Target Date
            </span>
            <span className="text-sm font-semibold text-ink">
              {new Date(goal.target_date).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between py-2.5">
          <span className="flex items-center gap-2 text-sm text-slate">
            <CalendarDays size={15} /> Started On
          </span>
          <span className="text-sm font-semibold text-ink">
            {new Date(goal.created_at).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate mb-1.5">Deduct from account</label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="field"
          >
            {accounts.length === 0 && <option value="">No accounts — add one first</option>}
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.account_name} — ₹{a.balance.toFixed(2)} available
              </option>
            ))}
          </select>
        </div>

        <input
          type="number" step="0.01" min="0.01"
          value={amount} onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount to add" className="field"
        />

        {error && <p className="text-sm text-coral">{error}</p>}

        <button
          onClick={handleAddMoney}
          disabled={adding || !accountId}
          className="w-full bg-emerald text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {adding ? "Adding…" : "Add Money"}
        </button>
      </div>
    </div>
  );
}