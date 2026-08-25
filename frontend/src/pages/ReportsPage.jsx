import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  Download,
  Filter,
  PiggyBank,
  TrendingDown,
  Wallet,
  X,
} from "lucide-react";
import { getExpenses, getIncomes } from "../api/transactions";
import { getGoals } from "../api/goals";
import { getCategoryMeta } from "../utils/categoryIcons";
import { getGoalIcon } from "../components/goals/goalIcons";

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const COLORS = {
  emerald: "#10b981",
  coral: "#ef4444",
  blue: "#2563eb",
  orange: "#f59e0b",
  purple: "#8b5cf6",
  pink: "#fb7185",
  slate: "#94a3b8",
};

const PAYMENT_COLORS = {
  UPI: COLORS.emerald,
  "Credit Card": COLORS.orange,
  Cash: COLORS.blue,
  "Debit Card": COLORS.purple,
};

const toNumber = (value) => Number(value) || 0;

const formatINR = (value) =>
  `₹${toNumber(value).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const formatCompactINR = (value) => {
  const amount = toNumber(value);
  if (Math.abs(amount) >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (Math.abs(amount) >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return formatINR(amount);
};

const getDateKey = (year, month) => `${year}-${String(month).padStart(2, "0")}`;

export default function ReportsPage() {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [goals, setGoals] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return getDateKey(d.getFullYear(), d.getMonth() + 1);
  });
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    Promise.all([getExpenses(), getIncomes(), getGoals()])
      .then(([expenseRes, incomeRes, goalRes]) => {
        setExpenses(expenseRes.data || []);
        setIncomes(incomeRes.data || []);
        setGoals(goalRes.data || []);
      })
      .catch((error) => {
        console.error("Failed to load reports data:", error);
      });
  }, []);

  const { selectedYear, selectedMonthNumber } = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    return { selectedYear: year, selectedMonthNumber: month };
  }, [selectedMonth]);

  const inMonth = (dateStr, year, month) => {
    const d = new Date(dateStr);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  };

  const thisExpenses = useMemo(
    () => expenses.filter((e) => inMonth(e.date, selectedYear, selectedMonthNumber)),
    [expenses, selectedYear, selectedMonthNumber]
  );

  const thisIncomes = useMemo(
    () => incomes.filter((i) => inMonth(i.date, selectedYear, selectedMonthNumber)),
    [incomes, selectedYear, selectedMonthNumber]
  );

  const previousPeriod = useMemo(() => {
    const d = new Date(selectedYear, selectedMonthNumber - 2, 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  }, [selectedYear, selectedMonthNumber]);

  const prevExpenses = useMemo(
    () => expenses.filter((e) => inMonth(e.date, previousPeriod.year, previousPeriod.month)),
    [expenses, previousPeriod]
  );

  const prevIncomes = useMemo(
    () => incomes.filter((i) => inMonth(i.date, previousPeriod.year, previousPeriod.month)),
    [incomes, previousPeriod]
  );

  const totalIncome = thisIncomes.reduce((sum, item) => sum + toNumber(item.amount), 0);
  const totalExpenses = thisExpenses.reduce((sum, item) => sum + toNumber(item.amount), 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  const prevIncome = prevIncomes.reduce((sum, item) => sum + toNumber(item.amount), 0);
  const prevExpTotal = prevExpenses.reduce((sum, item) => sum + toNumber(item.amount), 0);
  const prevNet = prevIncome - prevExpTotal;
  const prevRate = prevIncome > 0 ? (prevNet / prevIncome) * 100 : 0;

  const pctChange = (current, previous) =>
    previous > 0 ? Math.round(((current - previous) / previous) * 100) : null;

  const incomePct = pctChange(totalIncome, prevIncome);
  const expensePct = pctChange(totalExpenses, prevExpTotal);
  const savingsPct = pctChange(netSavings, prevNet);
  const ratePct = savingsRate - Math.round(prevRate);

  const categoryTotals = useMemo(() => {
    const totals = {};
    thisExpenses.forEach((expense) => {
      const category = expense.category || "Other";
      totals[category] = (totals[category] || 0) + toNumber(expense.amount);
    });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [thisExpenses]);

  const donutData = useMemo(
    () =>
      categoryTotals.map(([category, value]) => ({
        label: category,
        value,
        color: getCategoryMeta(category).color,
      })),
    [categoryTotals]
  );

  const highestExpense = categoryTotals[0];
  const lowestExpense = categoryTotals[categoryTotals.length - 1];

  const monthlyData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(selectedYear, selectedMonthNumber - 1 - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const income = incomes
        .filter((item) => inMonth(item.date, year, month))
        .reduce((sum, item) => sum + toNumber(item.amount), 0);
      const expensesTotal = expenses
        .filter((item) => inMonth(item.date, year, month))
        .reduce((sum, item) => sum + toNumber(item.amount), 0);

      data.push({
        month: MONTHS_SHORT[d.getMonth()],
        income,
        expenses: expensesTotal,
        net: income - expensesTotal,
      });
    }
    return data;
  }, [expenses, incomes, selectedYear, selectedMonthNumber]);

  const bestSavingMonth = monthlyData.reduce(
    (best, current) => (current.net > best.net ? current : best),
    monthlyData[0] || { month: "—", net: 0 }
  );

  const activeGoals = goals.filter((goal) => goal.status !== "completed").slice(0, 4);

  const paymentMethodTotals = useMemo(() => {
    const totals = {};
    thisExpenses.forEach((expense) => {
      const method = expense.payment_method || expense.paymentMethod;
      if (!method) return;
      const normalized = String(method)
        .trim()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
      totals[normalized] = (totals[normalized] || 0) + toNumber(expense.amount);
    });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [thisExpenses]);

  const paymentTotal = paymentMethodTotals.reduce((sum, [, value]) => sum + value, 0);
  const mostUsedPayment = paymentMethodTotals[0];

  let grade = "C";
  let gradeLabel = "Fair";

  if (savingsRate >= 20) {
    grade = "A";
    gradeLabel = "Excellent";
  } else if (savingsRate >= 10) {
    grade = "B";
    gradeLabel = "Good";
  } else if (savingsRate < 0) {
    grade = "D";
    gradeLabel = "Needs Attention";
  }

  const healthTips = [
    savingsRate >= 20 ? "Keep saving consistently" : "Try to increase your savings rate",
    highestExpense
      ? `Try to reduce unnecessary ${highestExpense[0].toLowerCase()} expenses`
      : "Keep monitoring your expenses",
    netSavings > 0 ? "You can increase your investments" : "Focus on building positive monthly savings",
  ];

  const selectedMonthLabel = new Date(selectedYear, selectedMonthNumber - 1, 1).toLocaleDateString("en-US", {
    month: "short",
  });

  const rangeLabel = `${selectedMonthLabel} 1 - ${selectedMonthLabel} ${new Date(
    selectedYear,
    selectedMonthNumber,
    0
  ).getDate()}, ${selectedYear}`;

  const monthOptions = useMemo(() => {
    const options = [];
    const base = new Date();
    for (let i = 0; i < 12; i += 1) {
      const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
      options.push({
        value: getDateKey(d.getFullYear(), d.getMonth() + 1),
        label: `${d.toLocaleDateString("en-US", { month: "short" })} 1 - ${d.toLocaleDateString(
          "en-US",
          { month: "short" }
        )} ${new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()}, ${d.getFullYear()}`,
      });
    }
    return options;
  }, []);

  const handleExportCSV = () => {
    const rows = [
      ["Type", "Category/Source", "Amount", "Date"],
      ...thisExpenses.map((expense) => ["Expense", expense.category || "Other", toNumber(expense.amount), expense.date]),
      ...thisIncomes.map((income) => ["Income", income.source || "Income", toNumber(income.amount), income.date]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `report-${selectedYear}-${String(selectedMonthNumber).padStart(2, "0")}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    setDownloadOpen(false);
  };

  const handlePrintPDF = () => {
    setDownloadOpen(false);
    window.print();
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-5 flex-wrap">
        <div>
          <h1 className="font-display text-[30px] leading-9 font-bold text-ink">Reports</h1>
          <p className="text-sm text-slate mt-1">Detailed insights into your financial activities.</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="relative flex items-center">
            <CalendarDays size={18} className="absolute left-4 text-ink pointer-events-none" />
            <select
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="appearance-none h-11 min-w-[205px] pl-11 pr-10 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-ink outline-none focus:ring-2 focus:ring-emerald/20"
              aria-label="Select report month"
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown size={17} className="absolute right-3 text-slate pointer-events-none" />
          </label>

          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            className={`h-11 px-4 rounded-xl border text-sm font-semibold flex items-center gap-2 transition-colors ${
              filtersOpen ? "border-emerald bg-emerald-soft text-emerald" : "border-slate-200 bg-white text-ink hover:bg-slate-50"
            }`}
          >
            <Filter size={17} />
            Filters
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setDownloadOpen((open) => !open)}
              className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-ink flex items-center gap-2 hover:bg-slate-50"
            >
              <Download size={17} />
              Download
              <ChevronDown size={16} />
            </button>

            {downloadOpen && (
              <div className="absolute right-0 top-12 z-30 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-ink hover:bg-slate-50"
                >
                  Export Excel (CSV)
                </button>
                <button
                  type="button"
                  onClick={handlePrintPDF}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-ink hover:bg-slate-50"
                >
                  Export PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {filtersOpen && (
        <div className="card px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate">
            <Filter size={16} />
            Showing all income and expense categories for <span className="font-semibold text-ink">{rangeLabel}</span>.
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen(false)}
            className="text-slate hover:text-ink"
            aria-label="Close filters"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Income" value={totalIncome} pct={incomePct} icon={Wallet} color="emerald" />
        <StatCard label="Total Expenses" value={totalExpenses} pct={expensePct} icon={TrendingDown} color="coral" invert />
        <StatCard label="Net Savings" value={netSavings} pct={savingsPct} icon={PiggyBank} color="indigo" />
        <StatCard label="Savings Rate" value={savingsRate} pct={ratePct} icon={BarChart3} color="blue" suffix="%" />
      </div>

      {/* Main report grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(280px,0.95fr)] gap-5">
        <div className="space-y-5">
          {/* Category + monthly chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <section className="card p-5 min-h-[355px]">
              <h2 className="font-display text-base font-bold text-ink mb-5">Spending by Category</h2>

              {donutData.length > 0 ? (
                <div className="flex items-center justify-center gap-8">
                  <DonutChart
                    data={donutData}
                    size={190}
                    thickness={32}
                    centerLabel={formatINR(totalExpenses)}
                    centerSubLabel="Total Expenses"
                  />
                  <div className="space-y-3 min-w-[155px]">
                    {categoryTotals.map(([category, value]) => {
                      const percent = totalExpenses > 0 ? Math.round((value / totalExpenses) * 100) : 0;
                      const meta = getCategoryMeta(category);
                      return (
                        <div key={category} className="flex items-center gap-2 text-sm">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: meta.color }}
                          />
                          <span className="text-ink flex-1">{category}</span>
                          <span className="font-semibold text-slate">{percent}%</span>
                          <span className="font-semibold text-ink w-16 text-right">{formatINR(value)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <EmptyState text="No expenses recorded for this month." />
              )}
            </section>

            <section className="card p-5 min-h-[355px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-base font-bold text-ink">Income vs Expenses (Monthly)</h2>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald" />Income</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-coral" />Expenses</span>
                </div>
              </div>
              <MonthlyChart data={monthlyData} />
              <div className="text-center mt-3">
                <button type="button" className="text-sm font-semibold text-emerald hover:underline">
                  View monthly trends <span className="ml-1">→</span>
                </button>
              </div>
            </section>
          </div>

          {/* Goals + payment methods */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <section className="card p-5 min-h-[325px]">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-base font-bold text-ink">Savings Goals Progress</h2>
                <button type="button" className="text-xs font-semibold text-emerald hover:underline">View all</button>
              </div>

              {activeGoals.length > 0 ? (
                <div>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_100px] gap-3 text-[11px] text-slate font-semibold mb-3 px-1">
                    <span>Goal</span>
                    <span className="text-right">Target Amount</span>
                    <span className="text-right">Saved Amount</span>
                    <span className="text-right">Progress</span>
                  </div>

                  <ul className="divide-y divide-slate-100">
                    {activeGoals.map((goal) => {
                      const target = toNumber(goal.target_amount);
                      const current = toNumber(goal.current_amount);
                      const progress = target > 0 ? Math.min(100, (current / target) * 100) : 0;
                      const { icon: GoalIcon, bg, text, bar } = getGoalIcon(goal.icon);

                      return (
                        <li key={goal.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto_100px] items-center gap-3 py-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                              <GoalIcon size={17} className={text} strokeWidth={2.2} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-ink truncate">{goal.title}</p>
                              {goal.deadline && (
                                <p className="text-[11px] text-slate mt-0.5">
                                  {new Date(goal.deadline).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-ink text-right">{formatINR(target)}</span>
                          <span className="text-xs font-semibold text-ink text-right">{formatINR(current)}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-14 h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div className={`h-full rounded-full ${bar}`} style={{ width: `${progress}%` }} />
                            </div>
                            <span className="text-xs font-bold text-ink w-8">{progress.toFixed(0)}%</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <EmptyState text="No active goals." />
              )}
            </section>

            <section className="card p-5 min-h-[325px]">
              <h2 className="font-display text-base font-bold text-ink mb-5">Expenses by Payment Method</h2>

              {paymentMethodTotals.length > 0 ? (
                <div className="flex items-center justify-center gap-8">
                  <PaymentDonut data={paymentMethodTotals} total={paymentTotal} />
                  <div className="space-y-4 min-w-[160px]">
                    {paymentMethodTotals.map(([method, value]) => {
                      const percent = paymentTotal > 0 ? Math.round((value / paymentTotal) * 100) : 0;
                      return (
                        <div key={method} className="flex items-center gap-2 text-sm">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: PAYMENT_COLORS[method] || COLORS.slate }}
                          />
                          <span className="flex-1 text-ink">{method}</span>
                          <span className="font-semibold text-slate">{percent}%</span>
                          <span className="font-semibold text-ink w-16 text-right">{formatINR(value)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-[230px] flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                    <BarChart3 size={22} className="text-slate" />
                  </div>
                  <p className="text-sm font-semibold text-ink">Payment method insights</p>
                  <p className="text-xs text-slate mt-1 max-w-[260px]">
                    Payment method is not available in the current expense data, so this report cannot calculate the breakdown yet.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Right rail */}
        <div className="space-y-5">
          <section className="card p-5 min-h-[355px]">
            <h2 className="font-display text-base font-bold text-ink mb-4">Financial Health</h2>

            <div className="relative w-36 h-36 mx-auto mb-4">
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: `conic-gradient(${COLORS.emerald} ${Math.max(0, Math.min(100, savingsRate + 50))}%, #e2e8f0 0)`,
                }}
              >
                <div className="absolute inset-3 rounded-full bg-white flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-emerald">{grade}</span>
                  <span className="text-xs font-semibold text-emerald">{gradeLabel}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate text-center leading-5 mb-5">
              {grade === "A" || grade === "B"
                ? "You're on the right track! Keep maintaining your spending habits."
                : "There's room to improve your savings habits."}
            </p>

            <ul className="space-y-4">
              {healthTips.map((tip) => (
                <li key={tip} className="flex items-start gap-3 text-sm text-ink">
                  <span className="w-5 h-5 rounded-full bg-emerald flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} className="text-white" strokeWidth={3} />
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-5">
            <h2 className="font-display text-base font-bold text-ink mb-5">Quick Insights</h2>
            <div className="space-y-5">
              <InsightRow
                icon={Wallet}
                color="emerald"
                label="Highest Expense"
                value={highestExpense ? `${highestExpense[0]} ${formatINR(highestExpense[1])}` : "—"}
              />
              <InsightRow
                icon={TrendingDown}
                color="coral"
                label="Lowest Expense"
                value={lowestExpense ? `${lowestExpense[0]} ${formatINR(lowestExpense[1])}` : "—"}
              />
              <InsightRow
                icon={BarChart3}
                color="blue"
                label="Most Used Payment"
                value={
                  mostUsedPayment && paymentTotal > 0
                    ? `${mostUsedPayment[0]} ${Math.round((mostUsedPayment[1] / paymentTotal) * 100)}%`
                    : "Not available"
                }
              />
              <InsightRow
                icon={PiggyBank}
                color="purple"
                label="Best Saving Month"
                value={`${bestSavingMonth.month} ${formatINR(bestSavingMonth.net)} Saved`}
              />
            </div>
          </section>

          <section className="card p-5">
            <h2 className="font-display text-base font-bold text-ink mb-2">Export Reports</h2>
            <p className="text-xs text-slate mb-4">Download your report in the format you prefer.</p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handlePrintPDF}
                className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-ink hover:bg-slate-50 flex items-center justify-center gap-2"
              >
                <span className="text-coral">PDF</span>
                Export PDF
              </button>
              <button
                type="button"
                onClick={handleExportCSV}
                className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-ink hover:bg-slate-50 flex items-center justify-center gap-2"
              >
                <span className="text-emerald">XLS</span>
                Export Excel
              </button>
            </div>
          </section>
        </div>
      </div>

      <div className="rounded-xl bg-emerald-soft/60 border border-emerald/10 px-4 py-3 flex items-center justify-between gap-4 text-xs text-slate">
        <span>
          All reports are based on your selected date range and include all transactions.
        </span>
        <span className="font-semibold text-ink">All amounts are in INR (₹)</span>
      </div>
    </div>
  );
}

function MonthlyChart({ data }) {
  const maxValue = Math.max(...data.flatMap((item) => [item.income, item.expenses]), 1);

  return (
    <div className="pt-2">
      <div className="relative h-[225px]">
        <div className="absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between">
          {[1, 0.75, 0.5, 0.25, 0].map((ratio) => (
            <div key={ratio} className="flex items-center gap-2">
              <span className="w-9 text-[10px] text-slate text-right">
                {ratio === 0 ? "₹0" : `₹${Math.round((maxValue * ratio) / 1000)}K`}
              </span>
              <div className="flex-1 border-t border-slate-100" />
            </div>
          ))}
        </div>

        <div className="absolute left-11 right-0 top-0 bottom-8 flex items-end justify-around gap-2">
          {data.map((item) => (
            <div key={item.month} className="h-full flex items-end gap-1.5">
              <div
                className="w-4 sm:w-5 rounded-t-[3px] bg-emerald"
                style={{ height: `${Math.max(3, (item.income / maxValue) * 100)}%` }}
                title={`${item.month} income ${formatINR(item.income)}`}
              />
              <div
                className="w-4 sm:w-5 rounded-t-[3px] bg-coral"
                style={{ height: `${Math.max(3, (item.expenses / maxValue) * 100)}%` }}
                title={`${item.month} expenses ${formatINR(item.expenses)}`}
              />
            </div>
          ))}
        </div>

        <div className="absolute left-11 right-0 bottom-0 flex justify-around">
          {data.map((item) => (
            <span key={item.month} className="text-xs font-semibold text-slate">{item.month}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PaymentDonut({ data, total }) {
  let start = 0;
  const stops = data.map(([method, value]) => {
    const end = start + (value / total) * 360;
    const color = PAYMENT_COLORS[method] || COLORS.slate;
    const stop = `${color} ${start}deg ${end}deg`;
    start = end;
    return stop;
  });

  return (
    <div
      className="relative w-40 h-40 rounded-full shrink-0"
      style={{ background: `conic-gradient(${stops.join(", ")})` }}
    >
      <div className="absolute inset-7 rounded-full bg-white flex flex-col items-center justify-center">
        <span className="font-mono text-xl font-bold text-ink">{formatINR(total)}</span>
        <span className="text-[10px] text-slate">Total Expenses</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, pct, icon: Icon, color, invert, suffix = "" }) {
  const styles = {
    emerald: { bg: "bg-emerald-soft", text: "text-emerald" },
    coral: { bg: "bg-coral-soft", text: "text-coral" },
    indigo: { bg: "bg-indigo-soft", text: "text-indigo" },
    blue: { bg: "bg-blue-50", text: "text-blue-600" },
  }[color];

  const good = invert ? pct <= 0 : pct >= 0;

  return (
    <div className="card p-5 min-h-[124px] flex items-start gap-4">
      <div className={`w-12 h-12 rounded-full ${styles.bg} flex items-center justify-center shrink-0`}>
        <Icon size={20} className={styles.text} strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate mb-1">{label}</p>
        <p className={`font-mono text-[22px] leading-7 font-bold ${styles.text}`}>
          {suffix === "%" ? value : formatINR(value)}{suffix}
        </p>
        {pct !== null && (
          <p className={`text-xs font-semibold mt-1 ${good ? "text-emerald" : "text-coral"}`}>
            {pct >= 0 ? "▲" : "▼"} {Math.abs(pct)}% vs last month
          </p>
        )}
      </div>
    </div>
  );
}

function InsightRow({ icon: Icon, color, label, value }) {
  const styles = {
    emerald: { bg: "bg-emerald-soft", text: "text-emerald" },
    coral: { bg: "bg-coral-soft", text: "text-coral" },
    blue: { bg: "bg-blue-50", text: "text-blue-600" },
    purple: { bg: "bg-purple-100", text: "text-purple-600" },
  }[color];

  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${styles.bg} flex items-center justify-center shrink-0`}>
        <Icon size={17} className={styles.text} strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate">{label}</p>
        <p className="text-sm font-semibold text-ink truncate">{value}</p>
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="h-[245px] flex items-center justify-center text-sm text-slate">
      {text}
    </div>
  );
}