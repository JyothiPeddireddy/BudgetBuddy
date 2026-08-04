import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getExpenses } from "../api/transactions";
import ExpenseForm from "../components/expenses/ExpenseForm";
import ExpenseList from "../components/expenses/ExpenseList";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);

  const loadExpenses = async () => {
    const res = await getExpenses();
    setExpenses(res.data);
  };

  useEffect(() => { loadExpenses(); }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-paper-line px-8 py-5 flex justify-between items-center">
        <div className="flex items-baseline gap-2">
          <span className="font-display italic text-xl text-ink">Budget</span>
          <span className="font-display text-xl text-ink">Buddy</span>
        </div>
        <button onClick={handleLogout} className="text-sm text-slate hover:text-brick">Sign out</button>
      </header>

      <main className="max-w-2xl mx-auto px-8 py-12 space-y-10">
        <div>
          <p className="eyebrow">{user?.username && `Signed in as ${user.username}`}</p>
          <h1 className="font-display text-3xl text-ink mb-6">Add an expense</h1>
          <ExpenseForm onAdded={loadExpenses} />
        </div>
        <div>
          <h2 className="font-display text-xl text-ink mb-4">Recent expenses</h2>
          <ExpenseList expenses={expenses} onDeleted={loadExpenses} />
        </div>
      </main>
    </div>
  );
}