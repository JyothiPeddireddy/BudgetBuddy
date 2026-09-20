import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Wallet2,
  PiggyBank,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Receipt,
  BarChart3,
  Sparkles,
  Utensils,
  Plane,
  ShoppingBag,
  BookOpen,
  Film,
  Package,
  Banknote,
  Scale,
} from "lucide-react";
import { getDashboard, getBudgets } from "../api/transactions";
import { getAccounts } from "../api/accounts";
import { getGoals } from "../api/goals";
import { getGoalIcon } from "../components/goals/goalIcons";
import { useAuth } from "../context/AuthContext";
import DonutChart from "../components/charts/DonutChart";
import PieChart from "../components/charts/PieChart";
import RadialProgress from "../components/charts/RadialProgress";

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

const CATEGORY_COLORS = [
  "#10b981",
  "#f97316",
  "#6366f1",
  "#ec4899",
  "#0ea5e9",
  "#eab308",
];

const CATEGORY_ICONS = {
  Food: { icon: Utensils, bg: "bg-orange-100", text: "text-orange-600" },
  Travel: { icon: Plane, bg: "bg-sky-100", text: "text-sky-600" },
  Shopping: { icon: ShoppingBag, bg: "bg-purple-100", text: "text-purple-600" },
  Education: { icon: BookOpen, bg: "bg-indigo-soft", text: "text-indigo" },
  Entertainment: { icon: Film, bg: "bg-pink-100", text: "text-pink-600" },
  Miscellaneous: { icon: Package, bg: "bg-slate-100", text: "text-slate" },
};

function getTransactionIcon(t) {
  if (t.type === "income") {
    return { icon: Banknote, bg: "bg-emerald-soft", text: "text-emerald" };
  }

  return (
    CATEGORY_ICONS[t.category] || {
      icon: Receipt,
      bg: "bg-coral-soft",
      text: "text-coral",
    }
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [thisMonthExpenses, setThisMonthExpenses] = useState(0);

  /* ============================================================
     LOAD DASHBOARD DATA
  ============================================================ */

  useEffect(() => {
    setData(null);

    const call = selected
      ? getDashboard(selected.year, selected.month)
      : getDashboard();

    call.then((res) => setData(res.data));
  }, [selected]);

  useEffect(() => {
    getAccounts().then((res) => setAccounts(res.data));

    getBudgets().then((res) => setBudgets(res.data));

    getGoals().then((res) =>
      setGoals(res.data.filter((g) => g.status !== "completed").slice(0, 3))
    );

    const now = new Date();

    getDashboard(now.getFullYear(), now.getMonth() + 1).then((res) =>
      setThisMonthExpenses(res.data.total_expenses)
    );
  }, []);

  const eyebrowLabel = selected
    ? new Date(selected.year, selected.month - 1).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "All time";

  /* ============================================================
     LOADING
  ============================================================ */

  if (!data) {
    return (
      <div className="px-4 sm:px-6 lg:px-10 py-8 sm:py-12 text-slate text-sm">
        Loading…
      </div>
    );
  }

  /* ============================================================
     CALCULATIONS
  ============================================================ */

  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0
  );

  const now = new Date();

  const currentMonthYear = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;

  const thisMonthBudgets = budgets.filter(
    (budget) => budget.month_year === currentMonthYear
  );

  const totalBudgeted = thisMonthBudgets.reduce(
    (sum, budget) => sum + budget.monthly_limit,
    0
  );

  const spendingData = data.top_categories.map((category, index) => ({
    label: category.category,
    value: category.total,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));

  /* ============================================================
     MAIN DASHBOARD
     NOTE: no "overflow-hidden" on this root div — it was clipping
     the month picker dropdown. Horizontal overflow is already
     handled by "overflow-x: hidden" on <body> in index.css.
  ============================================================ */

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-4 sm:space-y-5">
      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-6">
        <div className="min-w-0">
          <h1 className="font-display text-xl sm:text-2xl text-ink break-words">
            Welcome back, {user?.username || "there"}! 👋
          </h1>

          <p className="text-sm text-slate mt-1">
            Here's what's happening with your money today.
          </p>
        </div>

        <MonthYearPicker selected={selected} onSelect={setSelected} />
      </div>

      {/* STAT CARDS */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Balance"
          value={totalBalance}
          prefix="₹"
          icon={Wallet2}
          color="indigo"
        />

        <StatCard
          label="Income"
          value={data.total_income}
          prefix="₹"
          icon={TrendingUp}
          color="emerald"
        />

        <StatCard
          label="Expenses"
          value={data.total_expenses}
          prefix="₹"
          icon={TrendingDown}
          color="coral"
        />

        <StatCard
          label="Savings"
          value={Math.max(0, data.total_income - data.total_expenses)}
          prefix="₹"
          icon={PiggyBank}
          color="gold"
        />
      </div>

      {/* GOALS */}

      <div className="card p-4 sm:p-5 min-w-0">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="font-display text-base text-ink">Goals</h2>

          <Link
            to="/dashboard/goals"
            className="text-xs text-emerald font-semibold hover:underline shrink-0"
          >
            View all →
          </Link>
        </div>

        {/* Horizontal swipe list on mobile, snaps card by card */}
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 snap-x snap-mandatory -mx-1 px-1">
          {goals.map((g) => {
            const pct = Math.min(100, (g.current_amount / g.target_amount) * 100);

            const remaining = Math.max(0, g.target_amount - g.current_amount);

            const { icon: Icon, bg, text, bar } = getGoalIcon(g.icon);

            return (
              <Link
                key={g.id}
                to="/dashboard/goals"
                className="snap-start shrink-0 w-[70vw] max-w-[15rem] sm:w-56 border border-slate-100 rounded-xl p-3.5 hover:border-emerald transition-colors"
              >
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div
                    className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}
                  >
                    <Icon size={16} className={text} strokeWidth={2.2} />
                  </div>

                  <span className="text-sm font-semibold text-ink truncate">
                    {g.title}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mr-2">
                    <div
                      className={`h-full rounded-full ${bar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <span className="text-xs font-bold text-ink shrink-0">
                    {pct.toFixed(0)}%
                  </span>
                </div>

                <p className="text-[11px] text-slate">
                  ₹{g.current_amount.toFixed(0)} / ₹{g.target_amount.toFixed(0)}
                </p>

                <p className="text-[11px] text-slate">
                  Remaining: ₹{remaining.toFixed(0)}
                </p>
              </Link>
            );
          })}

          <Link
            to="/dashboard/goals"
            className="snap-start shrink-0 w-28 sm:w-32 min-h-[7rem] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1.5 hover:border-emerald hover:bg-emerald-soft/30 transition-colors"
          >
            <Plus size={18} className="text-slate" />

            <span className="text-xs font-semibold text-slate">Add Goal</span>
          </Link>
        </div>
      </div>

      {/* CHARTS
          Phone: 1 column | Tablet: 2 columns | Laptop: 3 columns */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Spending Overview */}

        <div className="card p-4 sm:p-5 min-w-0 overflow-hidden">
          <h2 className="font-display text-base text-ink mb-4">
            Spending Overview
          </h2>

          {spendingData.length > 0 ? (
            <div className="flex justify-center">
              <DonutChart
                data={spendingData}
                size={145}
                thickness={21}
                centerLabel={`₹${data.total_expenses.toFixed(0)}`}
                centerSubLabel="Total Expenses"
              />
            </div>
          ) : (
            <div className="h-36 flex items-center justify-center">
              <p className="text-sm text-slate text-center">
                No expenses recorded for this period.
              </p>
            </div>
          )}
        </div>

        {/* Budget Progress */}

        <div className="card p-4 sm:p-5 min-w-0 overflow-hidden">
          <h2 className="font-display text-base text-ink mb-4">
            Budget Progress
          </h2>

          {totalBudgeted > 0 ? (
            <div className="flex flex-col items-center justify-center">
              <RadialProgress
                value={thisMonthExpenses}
                max={totalBudgeted}
                size={145}
                thickness={15}
                color={thisMonthExpenses > totalBudgeted ? "#ef4444" : "#10b981"}
                label="Monthly Goal"
                sublabel={`₹${thisMonthExpenses.toFixed(
                  0
                )} / ₹${totalBudgeted.toFixed(0)}`}
              />

              <p className="text-xs text-emerald font-semibold mt-3 flex items-center gap-1 text-center">
                <Sparkles size={13} />

                {thisMonthExpenses > totalBudgeted
                  ? "Over budget this month"
                  : "You're on track!"}
              </p>
            </div>
          ) : (
            <div className="h-36 flex items-center justify-center">
              <p className="text-sm text-slate text-center">
                Set a budget to track your progress.
              </p>
            </div>
          )}
        </div>

        {/* Income vs Expenses — spans full width on tablet so it doesn't sit alone */}

        <div className="card p-4 sm:p-5 min-w-0 overflow-hidden md:col-span-2 lg:col-span-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-1">
            <h2 className="flex items-center gap-2 font-display text-base text-ink">
              <Scale size={15} className="text-indigo" />
              Income vs Expenses
            </h2>

            <Link
              to="/dashboard/analytics"
              className="text-xs text-emerald font-semibold hover:underline shrink-0"
            >
              View Full Analytics →
            </Link>
          </div>

          <p className="text-xs text-slate mb-3">{eyebrowLabel}</p>

          {data.total_income > 0 || data.total_expenses > 0 ? (
            <div className="flex flex-col items-center">
              <PieChart
                data={[
                  {
                    label: "Income",
                    value: data.total_income,
                    color: "#10b981",
                  },
                  {
                    label: "Expenses",
                    value: data.total_expenses,
                    color: "#f43f5e",
                  },
                ]}
                size={145}
              />

              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-3">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald inline-block" />
                  Income ₹{data.total_income.toFixed(0)}
                </span>

                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate">
                  <span className="w-2.5 h-2.5 rounded-full bg-coral inline-block" />
                  Expenses ₹{data.total_expenses.toFixed(0)}
                </span>
              </div>

              <p className="text-xs font-semibold mt-2 text-center">
                {data.total_income >= data.total_expenses ? (
                  <span className="text-emerald">
                    ₹{(data.total_income - data.total_expenses).toFixed(0)} net
                    positive
                  </span>
                ) : (
                  <span className="text-coral">
                    ₹{(data.total_expenses - data.total_income).toFixed(0)} net
                    negative
                  </span>
                )}
              </p>
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center">
              <p className="text-sm text-slate text-center">
                No activity recorded for this period.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* RECENT TRANSACTIONS + QUICK ACTIONS */}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent Transactions */}

        <div className="lg:col-span-3 card p-4 sm:p-5 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-4 gap-3">
            <h2 className="font-display text-base text-ink">
              Recent Transactions
            </h2>

            <Link
              to="/dashboard/reports"
              className="text-xs text-emerald font-semibold hover:underline shrink-0"
            >
              View all →
            </Link>
          </div>

          {data.recent_transactions.length === 0 ? (
            <p className="text-sm text-slate">Nothing recorded yet.</p>
          ) : (
            <ul className="space-y-3">
              {data.recent_transactions.slice(0, 4).map((t) => {
                const { icon: Icon, bg, text } = getTransactionIcon(t);

                return (
                  <li
                    key={`${t.type}-${t.id}`}
                    className="flex justify-between items-center gap-3 min-w-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${bg}`}
                      >
                        <Icon size={15} className={text} strokeWidth={2.2} />
                      </div>

                      <div className="min-w-0">
                        <span className="block text-xs font-semibold text-ink truncate">
                          {t.category || t.source}
                        </span>

                        <span className="block text-[10px] text-slate">
                          {t.date}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`font-mono text-xs font-semibold shrink-0 ${
                        t.type === "income" ? "text-emerald" : "text-coral"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}₹{t.amount.toFixed(0)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Quick Actions */}

        <div className="lg:col-span-2 card p-4 sm:p-5 min-w-0">
          <h2 className="font-display text-base text-ink mb-4">Quick Actions</h2>

          {/* 2 columns on phone, 4 on tablet, 2 again beside the transactions on laptop */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-2">
            <QuickAction to="/dashboard/income" icon={Plus} label="Add Income" />

            <QuickAction
              to="/dashboard/expenses"
              icon={Receipt}
              label="Add Expense"
            />

            <QuickAction
              to="/dashboard/budgets"
              icon={BarChart3}
              label="Set Budgets"
            />

            <QuickAction
              to="/dashboard/reports"
              icon={BarChart3}
              label="View Reports"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   QUICK ACTION
============================================================ */

function QuickAction({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-center gap-1.5 p-3 min-h-[76px] rounded-xl border border-slate-100 hover:border-emerald hover:bg-emerald-soft/40 transition-colors"
    >
      <div className="w-8 h-8 rounded-lg bg-emerald-soft flex items-center justify-center">
        <Icon size={15} className="text-emerald" strokeWidth={2.2} />
      </div>

      <span className="text-[11px] text-ink font-semibold text-center">
        {label}
      </span>
    </Link>
  );
}

/* ============================================================
   MONTH / YEAR PICKER

   BUG FIXED: the dropdown used "right-0", but on mobile the button
   sits at the LEFT edge of the screen, so the dropdown opened
   towards the left and got cut off (you can see this in your
   screenshot). Now it opens from the left on mobile ("left-0")
   and from the right on larger screens ("sm:right-0").
============================================================ */

function MonthYearPicker({ selected, onSelect }) {
  const [open, setOpen] = useState(false);

  const [viewYear, setViewYear] = useState(
    selected?.year ?? new Date().getFullYear()
  );

  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    // "pointerdown" works for both mouse and touch
    document.addEventListener("pointerdown", handleClick);

    return () => document.removeEventListener("pointerdown", handleClick);
  }, []);

  const label = selected
    ? new Date(selected.year, selected.month - 1).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "All time";

  const now = new Date();

  const isFutureMonth = (month) =>
    viewYear === now.getFullYear() && month > now.getMonth() + 1;

  const isFutureYear = viewYear >= now.getFullYear();

  return (
    <div className="relative self-start sm:self-auto" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2.5 sm:py-2 border border-slate-200 rounded-lg text-xs font-semibold text-ink bg-white hover:border-emerald transition-colors"
      >
        {label}

        <ChevronDown size={14} className="text-slate" />
      </button>

      {open && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-3">
          <button
            type="button"
            onClick={() => {
              onSelect(null);
              setOpen(false);
            }}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold mb-2 ${
              !selected ? "bg-emerald text-white" : "text-ink hover:bg-slate-50"
            }`}
          >
            All time
          </button>

          <div className="flex items-center justify-between px-1 mb-2">
            <button
              type="button"
              onClick={() => setViewYear((y) => y - 1)}
              className="p-2 hover:bg-slate-50 rounded"
              aria-label="Previous year"
            >
              <ChevronLeft size={15} className="text-slate" />
            </button>

            <span className="text-xs font-semibold text-ink">{viewYear}</span>

            <button
              type="button"
              onClick={() => setViewYear((y) => y + 1)}
              disabled={isFutureYear}
              className="p-2 hover:bg-slate-50 rounded disabled:opacity-30"
              aria-label="Next year"
            >
              <ChevronRight size={15} className="text-slate" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1">
            {MONTHS.map((month, index) => {
              const monthNum = index + 1;

              const isSelected =
                selected?.year === viewYear && selected?.month === monthNum;

              const disabled = isFutureMonth(monthNum);

              return (
                <button
                  key={month}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onSelect({ year: viewYear, month: monthNum });
                    setOpen(false);
                  }}
                  className={`px-2 py-2.5 rounded-lg text-xs font-semibold ${
                    isSelected
                      ? "bg-emerald text-white"
                      : disabled
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-ink hover:bg-slate-50"
                  }`}
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

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({ label, value, prefix, icon: Icon, color }) {
  const styles = {
    emerald: {
      bg: "bg-emerald-soft",
      text: "text-emerald",
      icon: "text-emerald",
    },

    coral: {
      bg: "bg-coral-soft",
      text: "text-coral",
      icon: "text-coral",
    },

    indigo: {
      bg: "bg-indigo-soft",
      text: "text-indigo",
      icon: "text-indigo",
    },

    gold: {
      bg: "bg-gold/15",
      text: "text-gold",
      icon: "text-gold",
    },
  }[color];

  return (
    <div className="card p-3 sm:p-4 min-w-0">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 min-w-0">
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg ${styles.bg} flex items-center justify-center shrink-0`}
        >
          <Icon size={16} className={styles.icon} strokeWidth={2.2} />
        </div>

        <p className="text-[11px] sm:text-xs font-semibold text-ink truncate">
          {label}
        </p>
      </div>

      <p
        className={`font-mono text-[15px] sm:text-xl ${styles.text} truncate`}
        title={`${prefix}${Number(value || 0).toFixed(0)}`}
      >
        {prefix}
        {Number(value || 0).toFixed(0)}
      </p>
    </div>
  );
}