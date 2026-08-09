import { useEffect, useState } from "react";
import { getExpenses } from "../api/transactions";
import { useToast } from "../context/ToastContext";
import ExpenseForm from "../components/expenses/ExpenseForm";
import ExpenseList from "../components/expenses/ExpenseList";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const { showToast } = useToast();

  const load = async () => {
    const res = await getExpenses();
    setExpenses(res.data);
  };

  useEffect(() => { load(); }, []);

  const handleAdded = async () => {
    await load();
    showToast("Expense added");
  };

  const handleDeleted = async () => {
    await load();
    showToast("Expense deleted");
  };

  return (
    <div className="max-w-2xl mx-auto px-10 py-12 space-y-8">
      <div>
        <p className="eyebrow">Track spending</p>
        <h1 className="font-display text-3xl text-ink">Expenses</h1>
      </div>
      <div className="card p-6">
        <ExpenseForm onAdded={handleAdded} />
      </div>
      <div className="card p-6">
        <h2 className="font-display text-lg text-ink mb-4">Recent expenses</h2>
        <ExpenseList expenses={expenses} onDeleted={handleDeleted} />
      </div>
    </div>
  );
}