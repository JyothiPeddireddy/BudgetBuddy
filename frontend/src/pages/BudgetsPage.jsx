import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { getBudgets, getExpenses } from "../api/transactions";
import { useToast } from "../context/ToastContext";
import BudgetForm from "../components/budget/BudgetForm";
import BudgetList from "../components/budget/BudgetList";
import Modal from "../components/common/Modal";
import MonthPicker from "../components/common/MonthPicker";

const CATEGORIES = [
  "Food",
  "Travel",
  "Shopping",
  "Education",
  "Entertainment",
  "Bills",
  "Others",
];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [editingBudget, setEditingBudget] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });

  const { showToast } = useToast();

  // Load budgets and expenses
  const load = async () => {
    try {
      const [budgetsRes, expensesRes] = await Promise.all([
        getBudgets(),
        getExpenses(),
      ]);
      setBudgets(budgetsRes.data);
      setExpenses(expensesRes.data);
    } catch (error) {
      console.error("Failed to load budgets:", error);
      showToast("Failed to load budgets");
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Budget actions
  const handleAdded = async () => {
    await load();
    setModalOpen(false);
    showToast("Budget created");
  };

  const handleUpdated = async () => {
    await load();
    setEditingBudget(null);
    setModalOpen(false);
    showToast("Budget updated");
  };

  const handleDeleted = async () => {
    await load();
    showToast("Budget deleted");
  };

  const openAdd = () => {
    setEditingBudget(null);
    setModalOpen(true);
  };

  const openEdit = (budget) => {
    setEditingBudget(budget);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingBudget(null);
  };

  // Selected month
  const selectedMonthYear = `${selectedMonth.year}-${String(
    selectedMonth.month
  ).padStart(2, "0")}`;

  const monthBudgets = budgets.filter(
    (budget) => budget.month_year === selectedMonthYear
  );

  const filteredBudgets = monthBudgets.filter(
    (budget) =>
      categoryFilter === "All Categories" || budget.category === categoryFilter
  );

  // Spent per category in the selected month
  const spentByCategory = {};

  expenses.forEach((expense) => {
    const date = new Date(expense.date);

    if (
      date.getFullYear() === selectedMonth.year &&
      date.getMonth() + 1 === selectedMonth.month
    ) {
      spentByCategory[expense.category] =
        (spentByCategory[expense.category] || 0) + expense.amount;
    }
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-emerald font-semibold mb-1">
            Manage your spending
          </p>
          <h1 className="font-display text-xl sm:text-2xl text-ink">Budgets</h1>
          <p className="text-sm text-slate mt-1">
            Set limits and stay on track with your monthly spending.
          </p>
        </div>

        {/* Filters: wrap onto two rows on phones */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex-1 sm:flex-none min-w-[9rem] px-3 py-2.5 sm:py-2 rounded-lg border border-slate-200 text-sm font-semibold text-ink bg-white outline-none focus:border-emerald"
          >
            <option>All Categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <MonthPicker
            selected={selectedMonth}
            onSelect={setSelectedMonth}
            allowAllTime={false}
          />

          <button
            onClick={openAdd}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-emerald text-white px-4 py-2.5 sm:py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus size={16} strokeWidth={2.5} />
            Set Budget
          </button>
        </div>
      </div>

      {/* Budget Content */}
      <div className="grid grid-cols-1 max-w-2xl mx-auto gap-5 w-full">
        <div className="card p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <h2 className="font-display text-base text-ink">Your Budgets</h2>
              <p className="text-xs text-slate mt-1">
                Track your spending against each category.
              </p>
            </div>

            <span className="text-xs font-semibold text-slate shrink-0">
              {filteredBudgets.length}{" "}
              {filteredBudgets.length === 1 ? "budget" : "budgets"}
            </span>
          </div>

          <BudgetList
            budgets={filteredBudgets}
            spentByCategory={spentByCategory}
            onDeleted={handleDeleted}
            onEdit={openEdit}
          />
        </div>
      </div>

      {modalOpen && (
        <Modal
          title={editingBudget ? "Edit Budget" : "Set Budget"}
          onClose={closeModal}
          maxWidth="max-w-md"
        >
          <BudgetForm
            onAdded={handleAdded}
            onUpdated={handleUpdated}
            editingBudget={editingBudget}
            onCancelEdit={closeModal}
          />
        </Modal>
      )}
    </div>
  );
}