import { useState, useEffect } from "react";
import { addExpense, updateExpense } from "../../api/transactions";
import { getAccounts } from "../../api/accounts";

const CATEGORIES = ["Food", "Travel", "Shopping", "Education", "Entertainment", "Miscellaneous"];

export default function ExpenseForm({ onAdded, editingExpense, onUpdated, onCancelEdit }) {
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isEditing = Boolean(editingExpense);

  useEffect(() => {
    getAccounts().then((res) => {
      setAccounts(res.data);
      // If editing an expense whose original account was deleted (account_id is null),
      // or if adding new, default to the first available account instead of staying blank.
      const editingAccountStillExists =
        editingExpense?.account_id && res.data.some((a) => a.id === editingExpense.account_id);

      if (!editingAccountStillExists && res.data.length > 0) {
        setAccountId(res.data[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (editingExpense) {
      setCategory(editingExpense.category);
      setAmount(String(editingExpense.amount));
      setDescription(editingExpense.description || "");
      setDate(editingExpense.date);
      // account_id is handled in the accounts-loading effect above,
      // since we need the accounts list to know if the original one still exists.
      if (editingExpense.account_id) {
        setAccountId(editingExpense.account_id);
      }
    } else {
      setCategory(CATEGORIES[0]);
      setAmount("");
      setDescription("");
      setDate(new Date().toISOString().slice(0, 10));
    }
  }, [editingExpense]);

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
        category,
        amount: parseFloat(amount),
        description,
        date,
      };

      if (isEditing) {
        await updateExpense(editingExpense.id, payload);
        onUpdated();
      } else {
        await addExpense(payload);
        setAmount("");
        setDescription("");
        onAdded();
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Could not save expense.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="field">
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
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
        type="text" value={description} onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)" className="field"
      />
      {error && <p className="text-sm text-coral">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit" disabled={submitting || !accountId}
          className="bg-coral text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? "Saving…" : isEditing ? "Update expense" : "Add expense"}
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