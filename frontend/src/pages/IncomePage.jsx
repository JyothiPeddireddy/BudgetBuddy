import { useEffect, useState } from "react";
import { getIncomes } from "../api/transactions";
import { useToast } from "../context/ToastContext";
import IncomeForm from "../components/income/IncomeForm";
import IncomeList from "../components/income/IncomeList";

export default function IncomePage() {
  const [incomes, setIncomes] = useState([]);
  const { showToast } = useToast();

  const load = async () => {
    const res = await getIncomes();
    setIncomes(res.data);
  };

  useEffect(() => { load(); }, []);

  const handleAdded = async () => {
    await load();
    showToast("Income added");
  };

  const handleDeleted = async () => {
    await load();
    showToast("Income deleted");
  };

  return (
    <div className="max-w-2xl mx-auto px-10 py-12 space-y-8">
      <div>
        <p className="eyebrow">Track earnings</p>
        <h1 className="font-display text-3xl text-ink">Income</h1>
      </div>
      <div className="card p-6">
        <IncomeForm onAdded={handleAdded} />
      </div>
      <div className="card p-6">
        <h2 className="font-display text-lg text-ink mb-4">Recent income</h2>
        <IncomeList incomes={incomes} onDeleted={handleDeleted} />
      </div>
    </div>
  );
}