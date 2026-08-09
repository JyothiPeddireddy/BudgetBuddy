import { useState } from "react";
import { addAccount } from "../../api/accounts";

const TYPES = ["Bank", "Wallet", "Credit Card", "Cash"];

export default function AccountForm({ onAdded }) {
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountType, setAccountType] = useState(TYPES[0]);
  const [balance, setBalance] = useState("0");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await addAccount({
        account_name: accountName,
        bank_name: bankName || null,
        account_type: accountType,
        balance: parseFloat(balance) || 0,
      });
      setAccountName("");
      setBankName("");
      setBalance("0");
      onAdded();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not add account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text" required value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          placeholder="Account name (e.g. SBI Salary)" className="field"
        />
        <input
          type="text" value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          placeholder="Bank name (optional)" className="field"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <select value={accountType} onChange={(e) => setAccountType(e.target.value)} className="field">
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input
          type="number" step="0.01" value={balance}
          onChange={(e) => setBalance(e.target.value)}
          placeholder="Starting balance" className="field"
        />
      </div>
      {error && <p className="text-sm text-coral">{error}</p>}
      <button
        type="submit" disabled={submitting}
        className="bg-indigo text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {submitting ? "Adding…" : "Add account"}
      </button>
    </form>
  );
}