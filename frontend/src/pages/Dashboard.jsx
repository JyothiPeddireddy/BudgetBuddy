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
} from "lucide-react";
import { getDashboard, getBudgets } from "../api/transactions";
import { getAccounts } from "../api/accounts";
import { getGoals } from "../api/goals";
import { getGoalIcon } from "../components/goals/goalIcons";
import { useAuth } from "../context/AuthContext";
import DonutChart from "../components/charts/DonutChart";
import RadialProgress from "../components/charts/RadialProgress";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CATEGORY_COLORS = ["#10b981", "#f97316", "#6366f1", "#ec4899", "#0ea5e9", "#eab308"];

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
  return CATEGORY_ICONS[t.category] || { icon: Receipt, bg: "bg-coral-soft", text: "text-coral" };
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [thisMonthExpenses, setThisMonthExpenses] = useState(0);

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
    getGoals().then((res) => setGoals(res.data.filter((g) => g.status !== "completed").slice(0, 3)));

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

  if (!data) {
    return (
      <div className="px-10 py-12 text-slate text-sm">
        Loading…
      </div>
    );
  }

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

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="font-display text-2xl text-ink">
            Welcome back, {user?.username || "there"}! 👋
          </h1>
          <p className="text-sm text-slate mt-1">
            Here's what's happening with your money today.
          </p>
        </div>

        <MonthYearPicker
          selected={selected}
          onSelect={setSelected}
        />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
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

      {/* Goals strip */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base text-ink">Goals</h2>
          <Link to="/dashboard/goals" className="text-xs text-emerald font-semibold hover:underline">
            View all →
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-1">
          {goals.map((g) => {
            const pct = Math.min(100, (g.current_amount / g.target_amount) * 100);
            const remaining = Math.max(0, g.target_amount - g.current_amount);
            const { icon: Icon, bg, text, bar } = getGoalIcon(g.icon);
            return (
              <Link
                key={g.id}
                to="/dashboard/goals"
                className="shrink-0 w-56 border border-slate-100 rounded-xl p-3.5 hover:border-emerald transition-colors"
              >
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                    <Icon size={16} className={text} strokeWidth={2.2} />
                  </div>
                  <span className="text-sm font-semibold text-ink truncate">{g.title}</span>
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mr-2">
                    <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-ink shrink-0">{pct.toFixed(0)}%</span>
                </div>
                <p className="text-[11px] text-slate">₹{g.current_amount.toFixed(0)} / ₹{g.target_amount.toFixed(0)}</p>
                <p className="text-[11px] text-slate">Remaining: ₹{remaining.toFixed(0)}</p>
              </Link>
            );
          })}
          <Link
            to="/dashboard/goals"
            className="shrink-0 w-32 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1.5 hover:border-emerald hover:bg-emerald-soft/30 transition-colors"
          >
            <Plus size={18} className="text-slate" />
            <span className="text-xs font-semibold text-slate">Add Goal</span>
          </Link>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">

        {/* Spending Overview */}
        <div className="card p-5">
          <h2 className="font-display text-base text-ink mb-4">
            Spending Overview
          </h2>

          {spendingData.length > 0 ? (
            <DonutChart
              data={spendingData}
              size={145}
              thickness={21}
              centerLabel={`₹${data.total_expenses.toFixed(0)}`}
              centerSubLabel="Total Expenses"
            />
          ) : (
            <div className="h-36 flex items-center justify-center">
              <p className="text-sm text-slate">
                No expenses recorded for this period.
              </p>
            </div>
          )}
        </div>

        {/* Budget Progress */}
        <div className="card p-5">
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
                color={
                  thisMonthExpenses > totalBudgeted
                    ? "#ef4444"
                    : "#10b981"
                }
                label="Monthly Goal"
                sublabel={`₹${thisMonthExpenses.toFixed(
                  0
                )} / ₹${totalBudgeted.toFixed(0)}`}
              />

              <p className="text-xs text-emerald font-semibold mt-3 flex items-center gap-1">
                <Sparkles size={13} />
                {thisMonthExpenses > totalBudgeted
                  ? "Over budget this month"
                  : "You're on track!"}
              </p>
            </div>
          ) : (
            <div className="h-36 flex items-center justify-center">
              <p className="text-sm text-slate">
                Set a budget to track your progress.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Recent Transactions */}
        <div className="lg:col-span-3 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base text-ink">
              Recent Transactions
            </h2>

            <Link
              to="/dashboard/expenses"
              className="text-xs text-emerald font-semibold hover:underline"
            >
              View all →
            </Link>
          </div>

          {data.recent_transactions.length === 0 ? (
            <p className="text-sm text-slate">
              Nothing recorded yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {data.recent_transactions.slice(0, 4).map((t) => {
                const { icon: Icon, bg, text } = getTransactionIcon(t);
                return (
                  <li
                    key={`${t.type}-${t.id}`}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg}`}>
                        <Icon size={15} className={text} strokeWidth={2.2} />
                      </div>

                      <div>
                        <span className="text-xs font-semibold text-ink">
                          {t.category || t.source}
                        </span>
                        <span className="block text-[10px] text-slate">
                          {t.date}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`font-mono text-xs font-semibold ${
                        t.type === "income"
                          ? "text-emerald"
                          : "text-coral"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}₹
                      {t.amount.toFixed(0)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="font-display text-base text-ink mb-4">
            Quick Actions
          </h2>

          <div className="grid grid-cols-2 gap-2">
            <QuickAction
              to="/dashboard/income"
              icon={Plus}
              label="Add Income"
            />

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

function QuickAction({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-100 hover:border-emerald hover:bg-emerald-soft/40 transition-colors"
    >
      <div className="w-8 h-8 rounded-lg bg-emerald-soft flex items-center justify-center">
        <Icon
          size={15}
          className="text-emerald"
          strokeWidth={2.2}
        />
      </div>

      <span className="text-[10px] text-ink font-semibold text-center">
        {label}
      </span>
    </Link>
  );
}

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

    document.addEventListener("mousedown", handleClick);
    return () =>
      document.removeEventListener("mousedown", handleClick);
  }, []);

  const label = selected
    ? new Date(
        selected.year,
        selected.month - 1
      ).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "All time";

  const now = new Date();

  const isFutureMonth = (month) =>
    viewYear === now.getFullYear() &&
    month > now.getMonth() + 1;

  const isFutureYear = viewYear >= now.getFullYear();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-ink bg-white hover:border-emerald transition-colors"
      >
        {label}
        <ChevronDown size={14} className="text-slate" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-20 p-3">
          <button
            onClick={() => {
              onSelect(null);
              setOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold mb-2 ${
              !selected
                ? "bg-emerald text-white"
                : "text-ink hover:bg-slate-50"
            }`}
          >
            All time
          </button>

          <div className="flex items-center justify-between px-1 mb-2">
            <button
              onClick={() => setViewYear((y) => y - 1)}
              className="p-1 hover:bg-slate-50 rounded"
            >
              <ChevronLeft size={15} className="text-slate" />
            </button>

            <span className="text-xs font-semibold text-ink">
              {viewYear}
            </span>

            <button
              onClick={() => setViewYear((y) => y + 1)}
              disabled={isFutureYear}
              className="p-1 hover:bg-slate-50 rounded disabled:opacity-30"
            >
              <ChevronRight size={15} className="text-slate" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1">
            {MONTHS.map((month, index) => {
              const monthNum = index + 1;
              const isSelected =
                selected?.year === viewYear &&
                selected?.month === monthNum;
              const disabled = isFutureMonth(monthNum);

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
                  className={`px-2 py-2 rounded-lg text-xs font-semibold ${
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
    <div className="card p-4">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-9 h-9 rounded-lg ${styles.bg} flex items-center justify-center`}
        >
          <Icon
            size={17}
            className={styles.icon}
            strokeWidth={2.2}
          />
        </div>

        <p className="text-xs font-semibold text-ink">
          {label}
        </p>
      </div>

      <p
        className={`font-mono text-xl ${styles.text}`}
      >
        {prefix}
        {Number(value || 0).toFixed(0)}
      </p>
    </div>
  );
}