import { useEffect, useState, useRef } from "react";
import {
  Plus,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

import { getBudgets, getExpenses } from "../api/transactions";
import { useToast } from "../context/ToastContext";
import BudgetForm from "../components/budget/BudgetForm";
import BudgetList from "../components/budget/BudgetList";

const CATEGORIES = [
  "Food",
  "Travel",
  "Shopping",
  "Education",
  "Entertainment",
  "Miscellaneous",
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [editingBudget, setEditingBudget] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [categoryFilter, setCategoryFilter] =
    useState("All Categories");

  const now = new Date();

  const [selectedMonth, setSelectedMonth] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });

  const { showToast } = useToast();

  // --------------------------------------------------
  // Load budgets and expenses
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Budget actions
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Selected month
  // --------------------------------------------------

  const selectedMonthYear = `${selectedMonth.year}-${String(
    selectedMonth.month
  ).padStart(2, "0")}`;

  // Budgets for selected month
  const monthBudgets = budgets.filter(
    (budget) => budget.month_year === selectedMonthYear
  );

  // Apply category filter
  const filteredBudgets = monthBudgets.filter(
    (budget) =>
      categoryFilter === "All Categories" ||
      budget.category === categoryFilter
  );

  // --------------------------------------------------
  // Calculate expenses by category
  // --------------------------------------------------

  const spentByCategory = {};

  expenses.forEach((expense) => {
    const date = new Date(expense.date);

    if (
      date.getFullYear() === selectedMonth.year &&
      date.getMonth() + 1 === selectedMonth.month
    ) {
      spentByCategory[expense.category] =
        (spentByCategory[expense.category] || 0) +
        expense.amount;
    }
  });

  // --------------------------------------------------
  // Budget summary
  // --------------------------------------------------

  const totalSpent = monthBudgets.reduce(
    (sum, budget) =>
      sum + (spentByCategory[budget.category] || 0),
    0
  );

  const totalBudgeted = monthBudgets.reduce(
    (sum, budget) => sum + budget.monthly_limit,
    0
  );

  const onTrack =
    totalBudgeted === 0 || totalSpent <= totalBudgeted;

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="max-w-6xl mx-auto px-8 py-10 space-y-6">

      {/* --------------------------------------------- */}
      {/* Page Header */}
      {/* --------------------------------------------- */}

      <div className="flex items-start justify-between gap-6 flex-wrap">

        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-emerald font-semibold mb-1">
            Manage your spending
          </p>

          <h1 className="font-display text-2xl text-ink">
            Budgets
          </h1>

          <p className="text-sm text-slate mt-1">
            Set limits and stay on track with your monthly spending.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value)
            }
            className="
              px-3 py-2
              rounded-lg
              border border-slate-200
              text-sm
              font-semibold
              text-ink
              bg-white
              outline-none
              focus:border-emerald
            "
          >
            <option>All Categories</option>

            {CATEGORIES.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>

          {/* Month Picker */}
          <MonthPicker
            selected={selectedMonth}
            onSelect={setSelectedMonth}
          />

          {/* Add Budget */}
          <button
            onClick={openAdd}
            className="
              flex items-center gap-1.5
              bg-emerald
              text-white
              px-4 py-2
              rounded-lg
              text-sm
              font-semibold
              hover:opacity-90
              transition-opacity
            "
          >
            <Plus
              size={16}
              strokeWidth={2.5}
            />

            Set Budget
          </button>

        </div>
      </div>

      {/* --------------------------------------------- */}
      {/* Budget Content */}
      {/* --------------------------------------------- */}

      <div className="grid grid-cols-1 max-w-2xl mx-auto gap-5 w-full">

        {/* Budget List */}
        <div className="card p-6">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="font-display text-base text-ink">
                Your Budgets
              </h2>

              <p className="text-xs text-slate mt-1">
                Track your spending against each category.
              </p>
            </div>

            <span className="text-xs font-semibold text-slate">
              {filteredBudgets.length}{" "}
              {filteredBudgets.length === 1
                ? "budget"
                : "budgets"}
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

      {/* --------------------------------------------- */}
      {/* Budget Modal */}
      {/* --------------------------------------------- */}

      {modalOpen && (
        <div
          className="
            fixed inset-0
            bg-ink/40
            flex items-center justify-center
            z-50
            px-4
          "
        >

          <div
            className="
              bg-white
              rounded-2xl
              shadow-xl
              w-full
              max-w-md
              p-6
              relative
            "
          >

            <button
              onClick={closeModal}
              className="
                absolute
                top-5
                right-5
                text-slate
                hover:text-ink
              "
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <h2 className="font-display text-lg text-ink mb-5">
              {editingBudget
                ? "Edit Budget"
                : "Set Budget"}
            </h2>

            <BudgetForm
              onAdded={handleAdded}
              onUpdated={handleUpdated}
              editingBudget={editingBudget}
              onCancelEdit={closeModal}
            />

          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================= */
/* Month Picker                                      */
/* ================================================= */

function MonthPicker({ selected, onSelect }) {
  const [open, setOpen] = useState(false);

  const [viewYear, setViewYear] = useState(
    selected?.year ?? new Date().getFullYear()
  );

  const ref = useRef(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClick = (event) => {
      if (
        ref.current &&
        !ref.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClick
      );
    };
  }, []);

  const label = new Date(
    selected.year,
    selected.month - 1
  ).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  const now = new Date();

  const isFutureMonth = (month) =>
    viewYear === now.getFullYear() &&
    month > now.getMonth() + 1;

  const isFutureYear =
    viewYear >= now.getFullYear();

  return (
    <div
      className="relative"
      ref={ref}
    >

      {/* Picker Button */}
      <button
        onClick={() => setOpen((value) => !value)}
        className="
          flex items-center gap-2
          px-3 py-2
          border border-slate-200
          rounded-lg
          text-sm
          font-semibold
          text-ink
          bg-white
          hover:border-emerald
          transition-colors
        "
      >
        {label}

        <ChevronDown
          size={14}
          className="text-slate"
        />
      </button>

      {/* Picker Dropdown */}
      {open && (
        <div
          className="
            absolute
            right-0
            mt-2
            w-64
            bg-white
            border border-slate-200
            rounded-xl
            shadow-lg
            z-20
            p-3
          "
        >

          {/* Year Navigation */}
          <div className="flex items-center justify-between px-1 mb-2">

            <button
              onClick={() =>
                setViewYear((year) => year - 1)
              }
              className="
                p-1
                hover:bg-slate-50
                rounded
              "
            >
              <ChevronLeft
                size={15}
                className="text-slate"
              />
            </button>

            <span className="text-xs font-semibold text-ink">
              {viewYear}
            </span>

            <button
              onClick={() =>
                setViewYear((year) => year + 1)
              }
              disabled={isFutureYear}
              className="
                p-1
                hover:bg-slate-50
                rounded
                disabled:opacity-30
              "
            >
              <ChevronRight
                size={15}
                className="text-slate"
              />
            </button>

          </div>

          {/* Months */}
          <div className="grid grid-cols-3 gap-1">

            {MONTHS.map((month, index) => {
              const monthNum = index + 1;

              const isSelected =
                selected?.year === viewYear &&
                selected?.month === monthNum;

              const disabled =
                isFutureMonth(monthNum);

              return (
                <button
                  key={month}
                  disabled={disabled}
                  onClick={() => {
                    onSelect({
                      year: viewYear,
                      month: monthNum,
                    });

                    setOpen(false);
                  }}
                  className={`
                    px-2 py-2
                    rounded-lg
                    text-xs
                    font-semibold
                    transition-colors
                    ${
                      isSelected
                        ? "bg-emerald text-white"
                        : disabled
                        ? "text-slate-300 cursor-not-allowed"
                        : "text-ink hover:bg-slate-50"
                    }
                  `}
                >
                  {month.slice(0, 3)}
                </button>
              );
            })}

          </div>
        </div>
      )}
    </div>
  );
}