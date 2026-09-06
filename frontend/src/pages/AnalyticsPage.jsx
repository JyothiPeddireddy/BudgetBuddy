import { useEffect, useState, useRef } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Wallet,
  TrendingDown,
  Wallet2,
  Percent,
  Landmark,
  PieChart as PieChartIcon,
  BarChart3,
  Target,
  FileText,
  FileSpreadsheet,
  LayoutGrid,
} from "lucide-react";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext"; // <-- NEW
import {
  getAnalyticsSummary,
  getSpendingByCategory,
  getMonthlyTrend,
  getSavingsProgress,
  getCategoryTrend, // <-- NEW (step 2)
} from "../api/analytics";
import { getAccounts } from "../api/accounts";

import SpendingPieChart from "../components/charts/SpendingPieChart";
import GroupedBarChart from "../components/charts/GroupedBarChart";
import StackedBarChart from "../components/charts/StackedBarChart"; // <-- NEW (step 2)
import DonutChart from "../components/charts/DonutChart";
import SavingsGoalsProgressList from "../components/goals/SavingsGoalsProgressList";
import { getCategoryMeta } from "../utils/categoryIcons";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const ACCOUNT_COLORS = ["#10b981", "#6366f1", "#f59e0b", "#ec4899", "#0ea5e9", "#8b5cf6", "#f97316"];

export default function AnalyticsPage() {
  const { user } = useAuth(); // <-- NEW
  const isPremiumPlus = user?.role === "premium" || user?.role === "admin"; // <-- NEW

  const now = new Date();
  const [period, setPeriod] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });
  const [dateRange, setDateRange] = useState(null); // { startDate, endDate } | null — Premium+ custom range

  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [trendLocked, setTrendLocked] = useState(false); // true if trend call 403s even though we expected access
  const [categoryTrendData, setCategoryTrendData] = useState([]); // <-- NEW (step 2)
  const [categoryTrendLocked, setCategoryTrendLocked] = useState(false); // <-- NEW (step 2)
  const [goals, setGoals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState("");

  useEffect(() => {
    // Wait until we know the user's role before fetching, so we know
    // whether to bother calling the Premium-only endpoints.
    if (!user) return;

    let cancelled = false;
    setLoading(true);

    // Custom date range is Premium+ only. When active, summary and
    // spending-by-category are fetched by range instead of month/year.
    const useRange = isPremiumPlus && dateRange;

    const calls = [
      useRange
        ? getAnalyticsSummary(null, null, dateRange.startDate, dateRange.endDate)
        : getAnalyticsSummary(period.month, period.year),
      useRange
        ? getSpendingByCategory(null, null, dateRange.startDate, dateRange.endDate)
        : getSpendingByCategory(period.month, period.year),
      getSavingsProgress(),
      getAccounts(),
    ];

    // Only fetch monthly-trend / category-trend for Premium/Admin — User
    // tier doesn't get these endpoints per the role table, so skip the
    // calls (and the guaranteed 403) entirely for User tier.
    if (isPremiumPlus) {
      calls.push(getMonthlyTrend(6));
      calls.push(getCategoryTrend(6)); // <-- NEW (step 2)
    }

    Promise.allSettled(calls)
      .then((results) => {
        if (cancelled) return;

        const [summaryRes, categoryRes, goalsRes, accountsRes, trendRes, categoryTrendRes] = results;

        setSummary(summaryRes.status === "fulfilled" ? summaryRes.value.data : null);

        setCategoryData(
          categoryRes.status === "fulfilled" && Array.isArray(categoryRes.value.data)
            ? categoryRes.value.data
            : []
        );

        setGoals(
          goalsRes.status === "fulfilled" && Array.isArray(goalsRes.value.data)
            ? goalsRes.value.data
            : []
        );

        setAccounts(
          accountsRes.status === "fulfilled" && Array.isArray(accountsRes.value.data)
            ? accountsRes.value.data
            : []
        );

        if (isPremiumPlus) {
          if (trendRes.status === "fulfilled") {
            setTrendData(Array.isArray(trendRes.value.data) ? trendRes.value.data : []);
            setTrendLocked(false);
          } else {
            setTrendData([]);
            setTrendLocked(trendRes.reason?.response?.status === 403);
            if (trendRes.reason?.response?.status !== 403) {
              console.error("Failed to load monthly trend:", trendRes.reason);
            }
          }

          // <-- NEW (step 2)
          if (categoryTrendRes.status === "fulfilled") {
            setCategoryTrendData(Array.isArray(categoryTrendRes.value.data) ? categoryTrendRes.value.data : []);
            setCategoryTrendLocked(false);
          } else {
            setCategoryTrendData([]);
            setCategoryTrendLocked(categoryTrendRes.reason?.response?.status === 403);
            if (categoryTrendRes.reason?.response?.status !== 403) {
              console.error("Failed to load category trend:", categoryTrendRes.reason);
            }
          }
        } else {
          setTrendData([]);
          setTrendLocked(false);
          setCategoryTrendData([]);
          setCategoryTrendLocked(false);
        }

        [summaryRes, categoryRes, goalsRes, accountsRes].forEach((res) => {
          if (res.status === "rejected") {
            console.error("Failed to load analytics data:", res.reason);
          }
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [period.month, period.year, dateRange, user, isPremiumPlus]);

  const handleExport = async (format) => {
    setExportLoading(format);
    try {
      const res = await api.get(`/analytics/export/${format}`, {
        params: { month: period.month, year: period.year, months: 6 },
        responseType: "blob",
      });
      const mimeType = format === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      const url = window.URL.createObjectURL(new Blob([res.data], { type: mimeType }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `budget-buddy-analytics-report-${period.year}-${String(period.month).padStart(2, "0")}.${format === "pdf" ? "pdf" : "xlsx"}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      if (err.response?.status === 401) {
        alert("Please login again.");
      } else if (err.response?.status === 403) {
        alert("PDF/Excel export requires a Premium account.");
      } else {
        alert(`Unable to export ${format.toUpperCase()}.`);
      }
    } finally {
      setExportLoading("");
    }
  };

  // Spending by category -> {label, value, color}
  const pieData = categoryData.map((d) => {
    const meta = getCategoryMeta(d.category);
    return { label: d.category, value: d.total, color: meta.color };
  });

  // Monthly trend -> {month, income, expenses}  (Premium/Admin only)
  const barData = trendData.map((point) => {
    const [yearStr, monthStr] = point.month.split("-");
    const shortLabel = `${MONTH_SHORT[Number(monthStr) - 1]} '${yearStr.slice(2)}`;
    return {
      month: shortLabel,
      income: point.total_income,
      expenses: point.total_expenses,
    };
  });

  // User tier: simple single-month income vs expense comparison,
  // built from /analytics/summary (which User tier already has access to)
  // instead of the Premium-only /monthly-trend endpoint.
  const simpleComparisonData = [
    {
      month: `${MONTH_SHORT[period.month - 1]} '${String(period.year).slice(2)}`,
      income: summary?.total_income ?? 0,
      expenses: summary?.total_expenses ?? 0,
    },
  ];

  // ---- Category trend (step 2) -> stacked bar data + category/color list ----
  // Distinct categories across all months, ordered by total spend (desc) so
  // the biggest categories anchor the bottom of the stack and the legend.
  const categoryTotals = {};
  categoryTrendData.forEach((point) => {
    Object.entries(point.categories || {}).forEach(([cat, amt]) => {
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
    });
  });
  const stackedCategories = Object.keys(categoryTotals)
    .sort((a, b) => categoryTotals[b] - categoryTotals[a])
    .map((cat) => ({ key: cat, color: getCategoryMeta(cat).color }));

  const stackedData = categoryTrendData.map((point) => {
    const row = { month: point.label };
    stackedCategories.forEach((c) => {
      row[c.key] = point.categories?.[c.key] || 0;
    });
    return row;
  });

  // Account balances -> {label, value, color}
  const accountDonutData = accounts.map((a, i) => ({
    label: a.bank_name || a.account_name,
    value: a.balance,
    color: ACCOUNT_COLORS[i % ACCOUNT_COLORS.length],
  }));
  const accountTotal = accountDonutData.reduce((sum, d) => sum + d.value, 0);

  const currentMonthLabel = new Date(period.year, period.month - 1)
    .toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // What to show under "Spending by Category" — the active custom range,
  // or the selected month/year when no range is active.
  const categoryPeriodLabel = dateRange
    ? `${dateRange.startDate} → ${dateRange.endDate}`
    : `${MONTH_NAMES[period.month - 1]} ${period.year}`;

  return (
    <div className="max-w-6xl mx-auto px-8 py-10 space-y-6">

      {/* HEADER */}
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h1 className="font-display text-2xl text-ink">Analytics</h1>
          <p className="text-sm text-slate mt-1">
            Spending trends, category breakdowns, and savings progress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export buttons: Premium/Admin only */}
          {isPremiumPlus && (
            <>
              <button
                type="button"
                onClick={() => handleExport("pdf")}
                disabled={exportLoading !== ""}
                title="Export as PDF"
                className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-ink bg-white hover:border-coral transition-colors disabled:opacity-50"
              >
                <FileText size={14} className="text-coral" />
                {exportLoading === "pdf" ? "…" : "PDF"}
              </button>

              <button
                type="button"
                onClick={() => handleExport("excel")}
                disabled={exportLoading !== ""}
                title="Export as Excel"
                className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-ink bg-white hover:border-emerald transition-colors disabled:opacity-50"
              >
                <FileSpreadsheet size={14} className="text-emerald" />
                {exportLoading === "excel" ? "…" : "Excel"}
              </button>
            </>
          )}

          {/* Date pickers: Premium/Admin only. User tier is locked to current month. */}
          {isPremiumPlus ? (
            <>
              <DateRangePicker
                value={dateRange}
                onApply={setDateRange}
                onClear={() => setDateRange(null)}
              />
              <MonthYearPicker
                selected={period}
                onSelect={(p) => { setDateRange(null); setPeriod(p); }}
              />
            </>
          ) : (
            <span className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate bg-slate-50">
              {currentMonthLabel}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="card p-10 text-center text-sm text-slate">Loading analytics…</div>
      ) : (
        <>
          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-5 gap-4">
            <StatCard
              label="Total Income"
              value={`₹${(summary?.total_income ?? 0).toLocaleString("en-IN")}`}
              icon={Wallet}
              color="emerald"
            />
            <StatCard
              label="Total Expenses"
              value={`₹${(summary?.total_expenses ?? 0).toLocaleString("en-IN")}`}
              icon={TrendingDown}
              color="coral"
            />
            <StatCard
              label="Net Savings"
              value={`₹${(summary?.net_savings ?? 0).toLocaleString("en-IN")}`}
              icon={Wallet2}
              color="indigo"
            />
            <StatCard
              label="Savings Rate"
              value={`${summary?.savings_rate ?? 0}%`}
              icon={Percent}
              color="purple"
            />
            <StatCard
              label="Total Balance"
              value={`₹${(summary?.total_balance ?? 0).toLocaleString("en-IN")}`}
              icon={Landmark}
              color="emerald"
            />
          </div>

          {/* ROW 1: SPENDING BY CATEGORY + INCOME VS EXPENSES */}
          <div className="grid grid-cols-2 gap-5 items-start">

            {/* 1. SPENDING BY CATEGORY */}
            <div className="card p-6">
              <h2 className="flex items-center gap-2 font-display text-lg text-ink mb-1">
                <PieChartIcon size={17} className="text-indigo" />
                Spending by Category
              </h2>
              <p className="text-xs text-slate mb-4">
                {categoryPeriodLabel}
              </p>
              {pieData.length > 0 ? (
                <SpendingPieChart data={pieData} currencyLabel="Total Expenses" size={270} />
              ) : (
                <p className="text-sm text-slate">No expense data for this period.</p>
              )}
            </div>

            {/* 2. INCOME VS EXPENSES */}
            <div className="card p-6">
              <h2 className="flex items-center gap-2 font-display text-lg text-ink mb-1">
                <BarChart3 size={17} className="text-emerald" />
                Income vs Expenses
              </h2>
              <p className="text-xs text-slate mb-4">
                {isPremiumPlus ? "Last 6 months" : currentMonthLabel}
              </p>

              {isPremiumPlus ? (
                trendLocked ? (
                  <p className="text-sm text-slate">
                    Upgrade to Premium to see your 6-month income vs expenses trend.
                  </p>
                ) : (
                  <GroupedBarChart data={barData} />
                )
              ) : (
                // User tier: simple current-month comparison, built from
                // /analytics/summary rather than the Premium-only trend endpoint.
                <GroupedBarChart data={simpleComparisonData} />
              )}
            </div>

          </div>

          {/* ROW 1.5: CATEGORY BREAKDOWN OVER TIME — Premium/Admin only (step 2) */}
          {isPremiumPlus && (
            <div className="card p-6">
              <h2 className="flex items-center gap-2 font-display text-lg text-ink mb-1">
                <LayoutGrid size={17} className="text-purple-600" />
                Category Breakdown Over Time
              </h2>
              <p className="text-xs text-slate mb-4">Last 6 months, by category</p>

              {categoryTrendLocked ? (
                <p className="text-sm text-slate">
                  Upgrade to Premium to see how your spending by category has changed over time.
                </p>
              ) : (
                <StackedBarChart data={stackedData} categories={stackedCategories} />
              )}
            </div>
          )}

          {/* ROW 2: SAVINGS GOALS PROGRESS (left) + ACCOUNT BALANCE BREAKDOWN (right) */}
          <div className="grid grid-cols-2 gap-5 items-start">

            {/* 3. SAVINGS GOALS PROGRESS — left */}
            <div className="card p-6 h-fit">
              <h2 className="flex items-center gap-2 font-display text-lg text-ink mb-5">
                <Target size={17} className="text-orange-500" />
                Savings Goals Progress
              </h2>
              <SavingsGoalsProgressList goals={goals} />
            </div>

            {/* 4. ACCOUNT BALANCE BREAKDOWN — right */}
            <div className="card p-6">
              <h2 className="flex items-center gap-2 font-display text-lg text-ink mb-1">
                <Landmark size={17} className="text-purple-600" />
                Account Balance Breakdown
              </h2>
              <p className="text-xs text-slate mb-4">Across all accounts</p>
              {accountDonutData.length > 0 ? (
                <DonutChart
                  data={accountDonutData}
                  size={220}
                  thickness={20}
                  centerLabel={`₹${accountTotal.toLocaleString("en-IN")}`}
                  centerSubLabel="Total Balance"
                />
              ) : (
                <p className="text-sm text-slate">No accounts added yet.</p>
              )}
            </div>

          </div>
        </>
      )}
    </div>
  );
}


/* ============================================================
   DATE RANGE PICKER  (Premium+ only)
============================================================ */

function DateRangePicker({ value, onApply, onClear }) {
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(value?.startDate ?? "");
  const [end, setEnd] = useState(value?.endDate ?? "");
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setStart(value?.startDate ?? "");
    setEnd(value?.endDate ?? "");
  }, [value]);

  const isValid = start && end && start <= end;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-xs font-semibold transition-colors ${
          value ? "border-emerald text-emerald bg-emerald-soft/40" : "border-slate-200 text-ink bg-white hover:border-emerald"
        }`}
      >
        {value ? `${value.startDate} → ${value.endDate}` : "Custom Range"}
        <ChevronDown size={14} className={value ? "text-emerald" : "text-slate"} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-3 space-y-2">
          <label className="block text-[11px] font-semibold text-slate">
            Start date
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="mt-1 w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
            />
          </label>
          <label className="block text-[11px] font-semibold text-slate">
            End date
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="mt-1 w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
            />
          </label>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => { setStart(""); setEnd(""); onClear(); setOpen(false); }}
              className="text-[11px] font-semibold text-slate hover:text-coral"
            >
              Clear
            </button>
            <button
              type="button"
              disabled={!isValid}
              onClick={() => { onApply({ startDate: start, endDate: end }); setOpen(false); }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald text-white disabled:opacity-40"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


/* ============================================================
   MONTH / YEAR PICKER
============================================================ */

function MonthYearPicker({ selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(selected.year);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => { setViewYear(selected.year); }, [selected.year]);

  const label = new Date(selected.year, selected.month - 1)
    .toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const now = new Date();
  const isFutureMonth = (m) => viewYear === now.getFullYear() && m > now.getMonth() + 1;
  const isFutureYear = viewYear >= now.getFullYear();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-ink bg-white hover:border-emerald transition-colors"
      >
        {label}
        <ChevronDown size={14} className="text-slate" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-3">
          <div className="flex items-center justify-between px-1 mb-2">
            <button type="button" onClick={() => setViewYear((y) => y - 1)} className="p-1 hover:bg-slate-50 rounded">
              <ChevronLeft size={15} className="text-slate" />
            </button>
            <span className="text-xs font-semibold text-ink">{viewYear}</span>
            <button
              type="button"
              onClick={() => setViewYear((y) => y + 1)}
              disabled={isFutureYear}
              className="p-1 hover:bg-slate-50 rounded disabled:opacity-30"
            >
              <ChevronRight size={15} className="text-slate" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1">
            {MONTH_NAMES.map((m, i) => {
              const monthNum = i + 1;
              const isSelected = selected.year === viewYear && selected.month === monthNum;
              const disabled = isFutureMonth(monthNum);
              return (
                <button
                  type="button"
                  key={m}
                  disabled={disabled}
                  onClick={() => { onSelect({ year: viewYear, month: monthNum }); setOpen(false); }}
                  className={`px-2 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isSelected ? "bg-emerald text-white" : disabled ? "text-slate-300 cursor-not-allowed" : "text-ink hover:bg-slate-50"
                  }`}
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


/* ============================================================
   STAT CARD
============================================================ */

function StatCard({ label, value, icon: Icon, color }) {
  const styles = {
    emerald: { bg: "bg-emerald-soft", text: "text-emerald" },
    coral: { bg: "bg-coral-soft", text: "text-coral" },
    indigo: { bg: "bg-indigo-soft", text: "text-indigo" },
    purple: { bg: "bg-purple-100", text: "text-purple-600" },
  }[color];

  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-xl ${styles.bg} flex items-center justify-center`}>
          <Icon size={16} className={styles.text} strokeWidth={2.2} />
        </div>
        <p className="text-xs font-semibold text-ink">{label}</p>
      </div>
      <p className={`font-mono text-xl font-bold ${styles.text}`}>{value}</p>
    </div>
  );
}