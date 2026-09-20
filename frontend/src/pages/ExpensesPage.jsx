import { useEffect, useState } from "react";
import { Plus, ShoppingBag, TrendingDown, TrendingUp, Award, Receipt } from "lucide-react";
import { getExpenses } from "../api/transactions";
import { useToast } from "../context/ToastContext";
import ExpenseForm from "../components/expenses/ExpenseForm";
import ExpenseList from "../components/expenses/ExpenseList";
import DonutChart from "../components/charts/DonutChart";
import Modal from "../components/common/Modal";
import MonthPicker from "../components/common/MonthPicker";
import { getCategoryMeta } from "../utils/categoryIcons";

const CATEGORIES = ["Food", "Travel", "Shopping", "Education", "Entertainment", "Bills", "Others"];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });
  const { showToast } = useToast();

  const load = async () => {
    const res = await getExpenses();
    setExpenses(res.data);
  };

  useEffect(() => { load(); }, []);

  const handleAdded = async () => {
    await load();
    setModalOpen(false);
    showToast("Expense added");
  };

  const handleUpdated = async () => {
    setEditingExpense(null);
    await load();
    setModalOpen(false);
    showToast("Expense updated");
  };

  const handleDeleted = async () => {
    await load();
    showToast("Expense deleted");
  };

  const openAdd = () => { setEditingExpense(null); setModalOpen(true); };
  const openEdit = (expense) => { setEditingExpense(expense); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingExpense(null); };

  // Filter by selected month + category
  const inMonth = (e, period) => {
    const d = new Date(e.date);
    return d.getFullYear() === period.year && d.getMonth() + 1 === period.month;
  };

  const filtered = expenses.filter((e) => {
    const monthMatch = selectedMonth ? inMonth(e, selectedMonth) : true;
    const catMatch = categoryFilter === "All Categories" || e.category === categoryFilter;
    return monthMatch && catMatch;
  });

  // Previous month, for trend comparison
  const prevPeriod = selectedMonth
    ? { year: selectedMonth.month === 1 ? selectedMonth.year - 1 : selectedMonth.year, month: selectedMonth.month === 1 ? 12 : selectedMonth.month - 1 }
    : null;
  const prevFiltered = prevPeriod
    ? expenses.filter((e) => inMonth(e, prevPeriod) && (categoryFilter === "All Categories" || e.category === categoryFilter))
    : [];

  const totalExpenses = filtered.reduce((sum, e) => sum + e.amount, 0);
  const prevTotalExpenses = prevFiltered.reduce((sum, e) => sum + e.amount, 0);
  const expensePct = prevTotalExpenses > 0 ? Math.round(((totalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100) : null;

  const transactionCount = filtered.length;
  const countDiff = transactionCount - prevFiltered.length;

  const categoryTotals = {};
  filtered.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const largestCategory = sortedCategories[0];
  const largestPct = largestCategory && totalExpenses > 0 ? Math.round((largestCategory[1] / totalExpenses) * 100) : 0;

  const donutData = sortedCategories.map(([category, value]) => {
    const meta = getCategoryMeta(category);
    return { label: category, value, color: meta.color };
  });

  // Every filtered expense, most recent first. The wrapper below scrolls.
  const recentExpenses = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-5 sm:space-y-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 lg:gap-6">
        <h1 className="font-display text-xl sm:text-2xl text-ink">Expenses</h1>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex-1 sm:flex-none min-w-[9rem] px-3 py-2.5 sm:py-2 rounded-lg border border-slate-200 text-sm font-semibold text-ink bg-white"
          >
            <option>All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <MonthPicker selected={selectedMonth} onSelect={setSelectedMonth} />

          <button
            onClick={openAdd}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-emerald text-white px-4 py-2.5 sm:py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Expense
          </button>
        </div>
      </div>

      {/* STAT CARDS: first card full width on phone, 3 across from tablet up */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
        <div className="card p-4 sm:p-5 col-span-2 md:col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-coral-soft flex items-center justify-center shrink-0">
              <ShoppingBag size={18} className="text-coral" strokeWidth={2.2} />
            </div>
            <p className="text-sm font-semibold text-ink truncate">Total Expenses</p>
          </div>
          <p className="font-mono text-xl sm:text-2xl font-bold text-coral truncate">₹{totalExpenses.toFixed(0)}</p>
          {expensePct !== null && (
            <p className={`text-xs font-semibold mt-1.5 flex items-center gap-1 ${expensePct <= 0 ? "text-emerald" : "text-coral"}`}>
              {expensePct <= 0 ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
              {Math.abs(expensePct)}% vs last month
            </p>
          )}
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
              <Award size={18} className="text-orange-600" strokeWidth={2.2} />
            </div>
            <p className="text-sm font-semibold text-ink truncate">Largest</p>
          </div>
          {largestCategory ? (
            <>
              <p className="font-display text-base sm:text-lg font-bold text-ink truncate">{largestCategory[0]}</p>
              <p className="text-xs font-semibold text-slate mt-1">{largestPct}% of total</p>
            </>
          ) : (
            <p className="text-sm text-slate">No data</p>
          )}
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
              <Receipt size={18} className="text-purple-600" strokeWidth={2.2} />
            </div>
            <p className="text-sm font-semibold text-ink truncate">Transactions</p>
          </div>
          <p className="font-mono text-xl sm:text-2xl font-bold text-ink">{transactionCount}</p>
          {prevPeriod && (
            <p className={`text-xs font-semibold mt-1.5 flex items-center gap-1 ${countDiff <= 0 ? "text-emerald" : "text-coral"}`}>
              {countDiff <= 0 ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
              {Math.abs(countDiff)} vs last month
            </p>
          )}
        </div>
      </div>

      {/* LIST + DONUT: stacked on phone/tablet, side by side on laptop */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 sm:gap-5 items-start">
        <div className="card p-4 sm:p-6 min-w-0">
          <h2 className="font-display text-base sm:text-lg text-ink mb-4">Recent Expenses</h2>
          <div className="max-h-[420px] overflow-y-auto pr-1">
            <ExpenseList expenses={recentExpenses} onDeleted={handleDeleted} onEdit={openEdit} />
          </div>
        </div>

        <div className="card p-4 sm:p-6 min-w-0">
          <h2 className="font-display text-base sm:text-lg text-ink mb-4">Expense by Category</h2>
          {donutData.length > 0 ? (
            <div className="flex justify-center">
              <DonutChart data={donutData} size={140} thickness={20} centerLabel={`₹${totalExpenses.toFixed(0)}`} />
            </div>
          ) : (
            <p className="text-sm text-slate">No expenses recorded for this period.</p>
          )}
        </div>
      </div>

      {modalOpen && (
        <Modal title={editingExpense ? "Edit Expense" : "Add Expense"} onClose={closeModal} maxWidth="max-w-lg">
          <ExpenseForm
            onAdded={handleAdded}
            editingExpense={editingExpense}
            onUpdated={handleUpdated}
            onCancelEdit={closeModal}
          />
        </Modal>
      )}
    </div>
  );
}