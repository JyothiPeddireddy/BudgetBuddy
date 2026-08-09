import { useState } from "react";
import { addExpense } from "../../api/transactions";
import { useEffect } from "react";
import { getAccounts } from "../../api/accounts";

const CATEGORIES = ["Food", "Travel", "Shopping", "Education", "Entertainment", "Miscellaneous"];

export default function ExpenseForm({ onAdded }) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState("");

  useEffect(() => {
  getAccounts().then((res) => {
    setAccounts(res.data);
    if (res.data.length > 0) setAccountId(res.data[0].id);
  });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await addExpense({ account_id: accountId,category,amount: parseFloat(amount),description,date});
      setAmount("");
      setDescription("");
      onAdded();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not add expense.");
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
        <select
          value={accountId}
          onChange={(e) => setAccountId(Number(e.target.value))}
          className="field"
          required
        >

          {accounts.length === 0 && (
            <option value="">
              No accounts — add one first
            </option>
          )}

          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.account_name}
            </option>
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
      <button
        type="submit" disabled={submitting}
        className="bg-[#2DD4BF] text-slate-900 font-semibold px-5 py-2.5 rounded-xl hover:bg-[#14B8A6] transition-all"
      >
        {submitting ? "Adding…" : "Add expense"}
      </button>
    </form>
  );
}