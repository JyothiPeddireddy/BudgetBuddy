import { useState, useEffect } from "react";
import { addIncome, updateIncome } from "../../api/transactions";
import { getAccounts } from "../../api/accounts";

export default function IncomeForm({ onAdded, editingIncome, onUpdated, onCancelEdit }) {
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState("");
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isEditing = Boolean(editingIncome);

  useEffect(() => {
    getAccounts().then((res) => {
      setAccounts(res.data);
      if (!editingIncome && res.data.length > 0) setAccountId(res.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (editingIncome) {
      setAccountId(editingIncome.account_id ?? "");
      setSource(editingIncome.source);
      setAmount(String(editingIncome.amount));
      setDate(editingIncome.date);
      setNotes(editingIncome.notes || "");
    } else {
      setSource("");
      setAmount("");
      setNotes("");
      setDate(new Date().toISOString().slice(0, 10));
    }
  }, [editingIncome]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!accountId) {
      setError("Please add an account first.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        account_id: Number(accountId),
        source,
        amount: parseFloat(amount),
        date,
        notes,
      };

      if (isEditing) {
        await updateIncome(editingIncome.id, payload);
        onUpdated();
      } else {
        await addIncome(payload);
        setSource("");
        setAmount("");
        setNotes("");
        onAdded();
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Could not save income.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <input
          type="text" required value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Source (e.g. Salary)" className="field"
        />
        <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="field" required>
          {accounts.length === 0 && <option value="">No accounts — add one first</option>}
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.account_name}</option>
          ))}
        </select>
        <input
          type="number" step="0.01" min="0.01" required
          value={amount} onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount" className="field"
        />
        <input
          type="date" required value={date}
          onChange={(e) => setDate(e.target.value)}
          className="field"
        />
      </div>
      <input
        type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)" className="field"
      />
      {error && <p className="text-sm text-coral">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit" disabled={submitting || !accountId}
          className="bg-emerald text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? "Saving…" : isEditing ? "Update income" : "Add income"}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-5 py-2.5 rounded-lg text-sm text-slate hover:text-ink transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}