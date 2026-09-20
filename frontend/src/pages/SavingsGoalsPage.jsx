import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { getGoals } from "../api/goals";
import { useToast } from "../context/ToastContext";
import SavingsGoalForm from "../components/goals/SavingsGoalForm";
import SavingsGoalList from "../components/goals/SavingsGoalList";
import SavingsGoalDetail from "../components/goals/SavingsGoalDetail";

export default function SavingsGoalsPage() {
  const [goals, setGoals] = useState([]);
  const [view, setView] = useState("list");
  const [selectedGoal, setSelectedGoal] = useState(null);
  const { showToast } = useToast();

  const load = async () => {
    const res = await getGoals();
    setGoals(res.data);
    setSelectedGoal((prev) => (prev ? res.data.find((g) => g.id === prev.id) || prev : prev));
  };

  useEffect(() => { load(); }, []);

  const handleSelect = (goal) => {
    setSelectedGoal(goal);
    setView("detail");
  };

  const handleAdded = async () => {
    await load();
    setView("list");
    showToast("Goal created");
  };

  const handleDeleted = async () => {
    await load();
    setView("list");
    showToast("Goal deleted");
  };

  const handleChanged = async (wasCompleted) => {
    await load();
    if (wasCompleted) {
      showToast("🎉 Goal completed!");
    } else {
      showToast("Contribution added");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {view === "list" && (
        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <h1 className="font-display text-lg text-ink">My Goals</h1>
            <button
              onClick={() => setView("add")}
              className="flex items-center gap-1.5 bg-emerald text-white px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shrink-0"
            >
              <Plus size={16} strokeWidth={2.5} />
              Add Goal
            </button>
          </div>
          <SavingsGoalList goals={goals} onSelect={handleSelect} />
        </div>
      )}

      {view === "add" && (
        <div className="card p-4 sm:p-6">
          <SavingsGoalForm onAdded={handleAdded} onCancel={() => setView("list")} />
        </div>
      )}

      {view === "detail" && selectedGoal && (
        <div className="card p-4 sm:p-6">
          <SavingsGoalDetail
            goal={selectedGoal}
            onBack={() => setView("list")}
            onChanged={handleChanged}
            onDeleted={handleDeleted}
          />
        </div>
      )}
    </div>
  );
}