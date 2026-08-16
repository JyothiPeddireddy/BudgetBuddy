import { useEffect, useState } from "react";
import { getGoals } from "../api/goals";
import SavingsGoalForm from "../components/goals/SavingsGoalForm";
import SavingsGoalList from "../components/goals/SavingsGoalList";

export default function SavingsGoalsPage() {
  const [goals, setGoals] = useState([]);

  const load = async () => {
    const res = await getGoals();
    setGoals(res.data);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-2xl mx-auto px-10 py-12 space-y-8">
      <div>
        <p className="eyebrow">Savings</p>
        <h1 className="font-display text-3xl text-ink">Goals</h1>
      </div>
      <div className="card p-6">
        <SavingsGoalForm onAdded={load} />
      </div>
      <div className="card p-6">
        <h2 className="font-display text-lg text-ink mb-4">Your goals</h2>
        <SavingsGoalList goals={goals} onChanged={load} />
      </div>
    </div>
  );
}