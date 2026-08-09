import { useEffect, useState } from "react";
import { getBudgets } from "../api/transactions";
import { useToast } from "../context/ToastContext";
import BudgetForm from "../components/budget/BudgetForm";
import BudgetList from "../components/budget/BudgetList";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const { showToast } = useToast();

  const load = async () => {
    const res = await getBudgets();
    setBudgets(res.data);
  };

  useEffect(() => { load(); }, []);

  const handleAdded = async () => {
    await load();
    showToast("Budget created");
  };

  const handleDeleted = async () => {
    await load();
    showToast("Budget deleted");
  };

  return (
    <div className="max-w-2xl mx-auto px-10 py-12 space-y-8">
      <div>
        <p className="eyebrow">Set limits</p>
        <h1 className="font-display text-3xl text-ink">Budgets</h1>
      </div>
      <div className="card p-6">
        <BudgetForm onAdded={handleAdded} />
      </div>
      <div className="card p-6">
        <h2 className="font-display text-lg text-ink mb-4">Your budgets</h2>
        <BudgetList budgets={budgets} onDeleted={handleDeleted} />
      </div>
    </div>
  );
}