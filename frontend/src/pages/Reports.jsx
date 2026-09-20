import { useEffect, useState } from "react";
import {
  Download,
  Wallet,
  TrendingDown,
  Wallet2,
  Percent,
  ListChecks,
  FileText,
  FileSpreadsheet,
} from "lucide-react";

import api from "../api/axios";
import { getExpenses, getIncomes } from "../api/transactions";
import { getAccounts } from "../api/accounts";
import MonthPicker from "../components/common/MonthPicker";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Reports() {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const now = new Date();

  const [viewPeriod, setViewPeriod] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });

  const [exportLoading, setExportLoading] = useState("");

  useEffect(() => {
    getExpenses()
      .then((res) => setExpenses(Array.isArray(res.data) ? res.data : []))
      .catch((err) => { console.error("Failed to load expenses:", err); setExpenses([]); });

    getIncomes()
      .then((res) => setIncomes(Array.isArray(res.data) ? res.data : []))
      .catch((err) => { console.error("Failed to load incomes:", err); setIncomes([]); });

    getAccounts()
      .then((res) => setAccounts(Array.isArray(res.data) ? res.data : []))
      .catch((err) => { console.error("Failed to load accounts:", err); setAccounts([]); });
  }, []);

  const bankLookup = {};
  accounts.forEach((a) => {
    bankLookup[a.id] = a.bank_name || a.account_name || "—";
  });

  const inMonth = (dateStr, year, month) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  };

  const thisExpenses = viewPeriod
    ? expenses.filter((e) => inMonth(e.date, viewPeriod.year, viewPeriod.month))
    : expenses;

  const thisIncomes = viewPeriod
    ? incomes.filter((i) => inMonth(i.date, viewPeriod.year, viewPeriod.month))
    : incomes;

  const prevMonth = viewPeriod ? (viewPeriod.month === 1 ? 12 : viewPeriod.month - 1) : null;
  const prevYear = viewPeriod ? (viewPeriod.month === 1 ? viewPeriod.year - 1 : viewPeriod.year) : null;

  const prevExpenses = viewPeriod ? expenses.filter((e) => inMonth(e.date, prevYear, prevMonth)) : [];
  const prevIncomes = viewPeriod ? incomes.filter((i) => inMonth(i.date, prevYear, prevMonth)) : [];

  const totalIncome = thisIncomes.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalExpenses = thisExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;

  const prevIncomeTotal = prevIncomes.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const prevExpenseTotal = prevExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const prevBalance = prevIncomeTotal - prevExpenseTotal;
  const prevSavingsRate = prevIncomeTotal > 0 ? (prevBalance / prevIncomeTotal) * 100 : 0;

  const pctChange = (current, previous) => {
    if (previous > 0) return Math.round(((current - previous) / previous) * 100);
    return null;
  };

  const incomePct = pctChange(totalIncome, prevIncomeTotal);
  const expensePct = pctChange(totalExpenses, prevExpenseTotal);
  const balancePct = pctChange(balance, prevBalance);
  const ratePct = viewPeriod ? Math.round(savingsRate - prevSavingsRate) : null;

  const allTransactions = [
    ...thisExpenses.map((expense) => ({ ...expense, type: "expense", description: expense.category || "Expense" })),
    ...thisIncomes.map((income) => ({ ...income, type: "income", description: income.source || "Income" })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  // "All time" is selected when viewPeriod is null.
  const isAllTime = viewPeriod === null;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  /*
   * Export PDF / Excel
   * When "All time" is selected, sends all_time=true instead of
   * silently falling back to the current real month.
   */
  const handleExport = async (format) => {
    setExportLoading(format);

    try {
      const params = isAllTime
        ? { all_time: true }
        : { month: viewPeriod.month, year: viewPeriod.year };

      const response = await api.get(`/reports/export/${format}`, {
        params,
        responseType: "blob",
      });

      const mimeType = format === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      link.download = isAllTime
        ? `budget-buddy-financial-report-all-time.${format === "pdf" ? "pdf" : "xlsx"}`
        : `budget-buddy-financial-report-${viewPeriod.year}-${String(viewPeriod.month).padStart(2, "0")}.${format === "pdf" ? "pdf" : "xlsx"}`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`${format} export error:`, error);
      if (error.response?.status === 401) {
        alert("Please login again.");
      } else {
        alert(`Unable to export ${format.toUpperCase()}.`);
      }
    } finally {
      setExportLoading("");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-5 sm:space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-6">
        <div>
          <h1 className="font-display text-xl sm:text-2xl text-ink">Reports &amp; Export</h1>
          <p className="text-sm text-slate mt-1">View your financial summary and export your data.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleExport("pdf")}
            disabled={exportLoading !== ""}
            title="Export as PDF"
            className="flex items-center gap-1.5 px-3 py-2.5 sm:py-2 border border-slate-200 rounded-lg text-xs font-semibold text-ink bg-white hover:border-coral transition-colors disabled:opacity-50"
          >
            <FileText size={14} className="text-coral" />
            {exportLoading === "pdf" ? "…" : "PDF"}
          </button>

          <button
            type="button"
            onClick={() => handleExport("excel")}
            disabled={exportLoading !== ""}
            title="Export as Excel"
            className="flex items-center gap-1.5 px-3 py-2.5 sm:py-2 border border-slate-200 rounded-lg text-xs font-semibold text-ink bg-white hover:border-emerald transition-colors disabled:opacity-50"
          >
            <FileSpreadsheet size={14} className="text-emerald" />
            {exportLoading === "excel" ? "…" : "Excel"}
          </button>

          <MonthPicker selected={viewPeriod} onSelect={setViewPeriod} format="long" />
        </div>
      </div>

      {/* STAT CARDS: 2x2 on phone, 4 across on laptop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Income" value={`₹${totalIncome.toLocaleString("en-IN")}`} pct={incomePct} icon={Wallet} color="emerald" />
        <StatCard label="Total Expenses" value={`₹${totalExpenses.toLocaleString("en-IN")}`} pct={expensePct} icon={TrendingDown} color="coral" invert />
        <StatCard label="Balance" value={`₹${balance.toLocaleString("en-IN")}`} pct={balancePct} icon={Wallet2} color="indigo" />
        <StatCard label="Savings Rate" value={`${savingsRate}%`} pct={ratePct} icon={Percent} color="purple" />
      </div>

      {/* ALL TRANSACTIONS */}
      <div className="card p-4 sm:p-6">
        <h2 className="flex items-center gap-2 font-display text-base sm:text-lg text-ink mb-4">
          <ListChecks size={17} className="text-indigo" />
          All Transactions
        </h2>

        {allTransactions.length === 0 ? (
          <p className="text-sm text-slate">Nothing recorded for this period.</p>
        ) : (
          <>
            {/* PHONE: compact list */}
            <ul className="sm:hidden max-h-[480px] overflow-y-auto divide-y divide-slate-100">
              {allTransactions.map((t) => (
                <li key={`${t.type}-${t.id}`} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{t.description}</p>
                    <p className="text-[11px] text-slate mt-0.5 truncate">
                      {formatDate(t.date)} • {bankLookup[t.account_id] || "—"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-mono text-sm font-semibold ${t.type === "income" ? "text-emerald" : "text-coral"}`}>
                      {t.type === "income" ? "+" : "-"}₹{Number(t.amount || 0).toLocaleString("en-IN")}
                    </p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${t.type === "income" ? "bg-emerald-soft text-emerald" : "bg-coral-soft text-coral"}`}>
                      {t.type === "income" ? "Income" : "Expense"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            {/* TABLET / LAPTOP: table */}
            <div className="hidden sm:block max-h-[420px] overflow-y-auto overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-xs font-semibold text-slate sticky top-0 bg-white z-10 border-b border-slate-200">
                    <th className="text-left py-2.5 pr-2 font-semibold">Date</th>
                    <th className="text-left py-2.5 pr-2 font-semibold">Description</th>
                    <th className="text-left py-2.5 pr-2 font-semibold">Bank</th>
                    <th className="text-left py-2.5 pr-2 font-semibold">Type</th>
                    <th className="text-right py-2.5 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allTransactions.map((transaction) => (
                    <tr key={`${transaction.type}-${transaction.id}`} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-2 text-slate whitespace-nowrap">{formatDate(transaction.date)}</td>
                      <td className="py-3 pr-2 text-ink font-medium truncate max-w-[160px]">{transaction.description}</td>
                      <td className="py-3 pr-2 text-slate truncate max-w-[110px]">{bankLookup[transaction.account_id] || "—"}</td>
                      <td className="py-3 pr-2">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold ${transaction.type === "income" ? "bg-emerald-soft text-emerald" : "bg-coral-soft text-coral"}`}>
                          {transaction.type === "income" ? "Income" : "Expense"}
                        </span>
                      </td>
                      <td className={`py-3 text-right font-mono font-semibold whitespace-nowrap ${transaction.type === "income" ? "text-emerald" : "text-coral"}`}>
                        {transaction.type === "income" ? "+" : "-"}₹{Number(transaction.amount || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* EXPORT CARD */}
      <div className="card p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-soft flex items-center justify-center shrink-0">
              <Download size={18} className="text-emerald" strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-base sm:text-lg text-ink">Export Report</h2>
              <p className="text-xs text-slate">
                {isAllTime
                  ? "Includes income, expenses, accounts & savings goals across all time. Budget report is excluded (budgets are monthly)."
                  : `Includes income, expenses, accounts, budgets & savings goals for ${MONTH_NAMES[viewPeriod.month - 1]} ${viewPeriod.year}.`}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => handleExport("pdf")}
              disabled={exportLoading !== ""}
              className="w-full sm:w-auto flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 hover:border-emerald transition-colors disabled:opacity-50"
            >
              <div className="w-9 h-9 rounded-lg bg-coral-soft flex items-center justify-center shrink-0">
                <FileText size={16} className="text-coral" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-ink">{exportLoading === "pdf" ? "Generating…" : "Export as PDF"}</p>
                <p className="text-xs text-slate">Download PDF report</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleExport("excel")}
              disabled={exportLoading !== ""}
              className="w-full sm:w-auto flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 hover:border-emerald transition-colors disabled:opacity-50"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-soft flex items-center justify-center shrink-0">
                <FileSpreadsheet size={16} className="text-emerald" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-ink">{exportLoading === "excel" ? "Generating…" : "Export as Excel"}</p>
                <p className="text-xs text-slate">Download Excel file</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ============================================================
   STAT CARD
============================================================ */

function StatCard({ label, value, pct, icon: Icon, color, invert = false }) {
  const styles = {
    emerald: { bg: "bg-emerald-soft", text: "text-emerald", icon: "text-emerald" },
    coral: { bg: "bg-coral-soft", text: "text-coral", icon: "text-coral" },
    indigo: { bg: "bg-indigo-soft", text: "text-indigo", icon: "text-indigo" },
    purple: { bg: "bg-purple-100", text: "text-purple-600", icon: "text-purple-600" },
  }[color];

  const good = pct === null ? null : invert ? pct <= 0 : pct >= 0;

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center gap-2.5 sm:gap-3 mb-3">
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${styles.bg} flex items-center justify-center shrink-0`}>
          <Icon size={18} className={styles.icon} strokeWidth={2.2} />
        </div>
        <p className="text-xs sm:text-sm font-semibold text-ink truncate">{label}</p>
      </div>
      <p className={`font-mono text-lg sm:text-2xl font-bold ${styles.text} truncate`}>{value}</p>
      {pct !== null && (
        <p className={`text-[11px] sm:text-xs font-semibold mt-1.5 ${good ? "text-emerald" : "text-coral"}`}>
          {pct >= 0 ? "+" : ""}{pct}% from last month
        </p>
      )}
    </div>
  );
}