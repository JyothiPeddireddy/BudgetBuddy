import { useEffect, useState, useRef } from "react";
import { Plus, X, ShoppingBag, TrendingDown, TrendingUp, Award, Receipt, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { getExpenses } from "../api/transactions";
import { useToast } from "../context/ToastContext";
import ExpenseForm from "../components/expenses/ExpenseForm";
import ExpenseList from "../components/expenses/ExpenseList";
import DonutChart from "../components/charts/DonutChart";
import { getCategoryMeta } from "../utils/categoryIcons";

const CATEGORIES = ["Food", "Travel", "Shopping", "Education", "Entertainment", "Bills", "Others", "Miscellaneous"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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
  const prevTransactionCount = prevFiltered.length;
  const countDiff = transactionCount - prevTransactionCount;

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

  // Show every filtered expense (sorted, most recent first) — no cap.
  // A scrollable wrapper around <ExpenseList> below keeps the card from
  // growing unbounded when there are many transactions in a period.
  const recentExpenses = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="max-w-6xl mx-auto px-8 py-10 space-y-6">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h1 className="font-display text-2xl text-ink">Expenses</h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-ink bg-white"
          >
            <option>All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <MonthPicker selected={selectedMonth} onSelect={setSelectedMonth} />
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 bg-emerald text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-coral-soft flex items-center justify-center">
              <ShoppingBag size={18} className="text-coral" strokeWidth={2.2} />
            </div>
            <p className="text-sm font-semibold text-ink">Total Expenses</p>
          </div>
          <p className="font-mono text-2xl font-bold text-coral">₹{totalExpenses.toFixed(0)}</p>
          {expensePct !== null && (
            <p className={`text-xs font-semibold mt-1.5 flex items-center gap-1 ${expensePct <= 0 ? "text-emerald" : "text-coral"}`}>
              {expensePct <= 0 ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
              {Math.abs(expensePct)}% vs last month
            </p>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Award size={18} className="text-orange-600" strokeWidth={2.2} />
            </div>
            <p className="text-sm font-semibold text-ink">Largest Expense</p>
          </div>
          {largestCategory ? (
            <>
              <p className="font-display text-lg font-bold text-ink">{largestCategory[0]}</p>
              <p className="text-xs font-semibold text-slate mt-1">{largestPct}% of total</p>
            </>
          ) : (
            <p className="text-sm text-slate">No data</p>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Receipt size={18} className="text-purple-600" strokeWidth={2.2} />
            </div>
            <p className="text-sm font-semibold text-ink">Transactions</p>
          </div>
          <p className="font-mono text-2xl font-bold text-ink">{transactionCount}</p>
          {prevPeriod && (
            <p className={`text-xs font-semibold mt-1.5 flex items-center gap-1 ${countDiff <= 0 ? "text-emerald" : "text-coral"}`}>
              {countDiff <= 0 ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
              {Math.abs(countDiff)} vs last month
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-5 items-start flex-wrap">
        <div className="card p-6 flex-1 min-w-[320px]">
          <h2 className="font-display text-lg text-ink mb-4">Recent Expenses</h2>
          <div className="max-h-[420px] overflow-y-auto pr-1">
            <ExpenseList expenses={recentExpenses} onDeleted={handleDeleted} onEdit={openEdit} />
          </div>
        </div>

        <div className="card p-6 w-fit">
          <h2 className="font-display text-lg text-ink mb-4">Expense by Category</h2>
          {donutData.length > 0 ? (
            <DonutChart data={donutData} size={140} thickness={20} centerLabel={`₹${totalExpenses.toFixed(0)}`} />
          ) : (
            <p className="text-sm text-slate">No expenses recorded for this period.</p>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <button onClick={closeModal} className="absolute top-5 right-5 text-slate hover:text-ink">
              <X size={20} />
            </button>
            <h2 className="font-display text-lg text-ink mb-5">
              {editingExpense ? "Edit Expense" : "Add Expense"}
            </h2>
            <ExpenseForm
              onAdded={handleAdded}
              editingExpense={editingExpense}
              onUpdated={handleUpdated}
              onCancelEdit={closeModal}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MonthPicker({ selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(selected?.year ?? new Date().getFullYear());
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const label = selected
    ? new Date(selected.year, selected.month - 1).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "All time";

  const now = new Date();
  const isFutureMonth = (m) => viewYear === now.getFullYear() && m > now.getMonth() + 1;
  const isFutureYear = viewYear >= now.getFullYear();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-ink bg-white hover:border-emerald transition-colors"
      >
        {label}
        <ChevronDown size={14} className="text-slate" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-20 p-3">
          <button
            onClick={() => { onSelect(null); setOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold mb-2 ${!selected ? "bg-emerald text-white" : "text-ink hover:bg-slate-50"}`}
          >
            All time
          </button>
          <div className="flex items-center justify-between px-1 mb-2">
            <button onClick={() => setViewYear((y) => y - 1)} className="p-1 hover:bg-slate-50 rounded">
              <ChevronLeft size={15} className="text-slate" />
            </button>
            <span className="text-xs font-semibold text-ink">{viewYear}</span>
            <button onClick={() => setViewYear((y) => y + 1)} disabled={isFutureYear} className="p-1 hover:bg-slate-50 rounded disabled:opacity-30">
              <ChevronRight size={15} className="text-slate" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {MONTHS.map((m, i) => {
              const monthNum = i + 1;
              const isSelected = selected?.year === viewYear && selected?.month === monthNum;
              const disabled = isFutureMonth(monthNum);
              return (
                <button
                  key={m}
                  disabled={disabled}
                  onClick={() => { onSelect({ year: viewYear, month: monthNum }); setOpen(false); }}
                  className={`px-2 py-2 rounded-lg text-xs font-semibold ${isSelected ? "bg-emerald text-white" : disabled ? "text-slate-300 cursor-not-allowed" : "text-ink hover:bg-slate-50"}`}
                >
                  {m.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}