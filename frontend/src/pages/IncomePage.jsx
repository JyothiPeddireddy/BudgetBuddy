import { useEffect, useState } from "react";
import { Plus, Wallet, Calendar, Crown, Repeat } from "lucide-react";
import { getIncomes } from "../api/transactions";
import { useToast } from "../context/ToastContext";
import IncomeForm from "../components/income/IncomeForm";
import IncomeList from "../components/income/IncomeList";
import DonutChart from "../components/charts/DonutChart";
import Modal from "../components/common/Modal";
import MonthPicker from "../components/common/MonthPicker";
import { getSourceMeta } from "../utils/sourceIcons";

export default function IncomePage() {
  const [incomes, setIncomes] = useState([]);
  const [editingIncome, setEditingIncome] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sourceFilter, setSourceFilter] = useState("All Sources");
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });
  const { showToast } = useToast();

  const load = async () => {
    const res = await getIncomes();
    setIncomes(res.data);
  };

  useEffect(() => { load(); }, []);

  const handleAdded = async () => { await load(); setModalOpen(false); showToast("Income added"); };
  const handleUpdated = async () => { setEditingIncome(null); await load(); setModalOpen(false); showToast("Income updated"); };
  const handleDeleted = async () => { await load(); showToast("Income deleted"); };
  const openAdd = () => { setEditingIncome(null); setModalOpen(true); };
  const openEdit = (income) => { setEditingIncome(income); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingIncome(null); };

  const inMonth = (i, period) => {
    const d = new Date(i.date);
    return d.getFullYear() === period.year && d.getMonth() + 1 === period.month;
  };

  const sources = ["All Sources", ...new Set(incomes.map((i) => i.source))];

  const filtered = incomes.filter((i) => {
    const monthMatch = selectedMonth ? inMonth(i, selectedMonth) : true;
    const srcMatch = sourceFilter === "All Sources" || i.source === sourceFilter;
    return monthMatch && srcMatch;
  });

  const prevPeriod = selectedMonth
    ? { year: selectedMonth.month === 1 ? selectedMonth.year - 1 : selectedMonth.year, month: selectedMonth.month === 1 ? 12 : selectedMonth.month - 1 }
    : null;
  const prevFiltered = prevPeriod
    ? incomes.filter((i) => inMonth(i, prevPeriod) && (sourceFilter === "All Sources" || i.source === sourceFilter))
    : [];

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0); // all-time
  const thisMonthTotal = filtered.reduce((sum, i) => sum + i.amount, 0);
  const prevMonthTotal = prevFiltered.reduce((sum, i) => sum + i.amount, 0);
  const monthPct = prevMonthTotal > 0 ? Math.round(((thisMonthTotal - prevMonthTotal) / prevMonthTotal) * 100) : null;

  const totalPct = totalIncome > 0 ? Math.round((thisMonthTotal / totalIncome) * 100) : null;

  const transactionCount = filtered.length;
  const countDiff = transactionCount - prevFiltered.length;

  const sourceTotals = {};
  filtered.forEach((i) => { sourceTotals[i.source] = (sourceTotals[i.source] || 0) + i.amount; });
  const sortedSources = Object.entries(sourceTotals).sort((a, b) => b[1] - a[1]);
  const topSource = sortedSources[0];
  const topSourcePct = topSource && thisMonthTotal > 0 ? Math.round((topSource[1] / thisMonthTotal) * 100) : 0;

  // Group beyond top 4 into "Others" for the donut
  const TOP_N = 4;
  const donutData = sortedSources.slice(0, TOP_N).map(([source, value]) => {
    const meta = getSourceMeta(source);
    return { label: source, value, color: meta.color };
  });
  if (sortedSources.length > TOP_N) {
    const othersTotal = sortedSources.slice(TOP_N).reduce((sum, [, v]) => sum + v, 0);
    donutData.push({ label: "Others", value: othersTotal, color: "#94a3b8" });
  }

  const recentIncomes = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-5 sm:space-y-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 lg:gap-6">
        <h1 className="font-display text-xl sm:text-2xl text-ink">Income</h1>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="flex-1 sm:flex-none min-w-[9rem] px-3 py-2.5 sm:py-2 rounded-lg border border-slate-200 text-sm font-semibold text-ink bg-white"
          >
            {sources.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <MonthPicker selected={selectedMonth} onSelect={setSelectedMonth} />

          <button
            onClick={openAdd}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-emerald text-white px-4 py-2.5 sm:py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Income
          </button>
        </div>
      </div>

      {/* STAT CARDS: 2x2 on phone, 4 across on laptop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-soft flex items-center justify-center shrink-0">
              <Wallet size={18} className="text-emerald" strokeWidth={2.2} />
            </div>
            <p className="text-xs font-semibold text-ink truncate">Total Income</p>
          </div>
          <p className="font-mono text-lg sm:text-xl font-bold text-emerald truncate">₹{totalIncome.toFixed(0)}</p>
          {totalPct !== null && (
            <p className="text-xs font-semibold mt-1.5 text-emerald">▲ {totalPct}% this month</p>
          )}
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-soft flex items-center justify-center shrink-0">
              <Calendar size={18} className="text-emerald" strokeWidth={2.2} />
            </div>
            <p className="text-xs font-semibold text-ink truncate">This Month</p>
          </div>
          <p className="font-mono text-lg sm:text-xl font-bold text-ink truncate">₹{thisMonthTotal.toFixed(0)}</p>
          {monthPct !== null && (
            <p className={`text-xs font-semibold mt-1.5 ${monthPct >= 0 ? "text-emerald" : "text-coral"}`}>
              {monthPct >= 0 ? "▲" : "▼"} {Math.abs(monthPct)}% vs last month
            </p>
          )}
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-soft flex items-center justify-center shrink-0">
              <Crown size={18} className="text-indigo" strokeWidth={2.2} />
            </div>
            <p className="text-xs font-semibold text-ink truncate">Top Source</p>
          </div>
          {topSource ? (
            <>
              <p className="font-display text-base sm:text-lg font-bold text-ink truncate">{topSource[0]}</p>
              <p className="text-xs font-semibold text-slate mt-1">{topSourcePct}% of total</p>
            </>
          ) : (
            <p className="text-sm text-slate">No data</p>
          )}
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
              <Repeat size={18} className="text-orange-600" strokeWidth={2.2} />
            </div>
            <p className="text-xs font-semibold text-ink truncate">Transactions</p>
          </div>
          <p className="font-mono text-lg sm:text-xl font-bold text-ink">{transactionCount}</p>
          {prevPeriod && (
            <p className={`text-xs font-semibold mt-1.5 ${countDiff >= 0 ? "text-emerald" : "text-coral"}`}>
              {countDiff >= 0 ? "▲" : "▼"} {Math.abs(countDiff)} vs last month
            </p>
          )}
        </div>
      </div>

      {/* LIST + DONUT */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 sm:gap-5 items-start">
        <div className="card p-4 sm:p-6 min-w-0">
          <h2 className="font-display text-base sm:text-lg text-ink mb-4">Recent Income</h2>
          <IncomeList incomes={recentIncomes} onDeleted={handleDeleted} onEdit={openEdit} />
        </div>

        <div className="card p-4 sm:p-6 min-w-0">
          <h2 className="font-display text-base sm:text-lg text-ink mb-4">Income Sources</h2>
          {donutData.length > 0 ? (
            <div className="flex justify-center">
              <DonutChart data={donutData} size={140} thickness={20} centerLabel={`₹${thisMonthTotal.toFixed(0)}`} />
            </div>
          ) : (
            <p className="text-sm text-slate">No income recorded for this period.</p>
          )}
        </div>
      </div>

      {modalOpen && (
        <Modal title={editingIncome ? "Edit Income" : "Add Income"} onClose={closeModal} maxWidth="max-w-lg">
          <IncomeForm
            onAdded={handleAdded}
            editingIncome={editingIncome}
            onUpdated={handleUpdated}
            onCancelEdit={closeModal}
          />
        </Modal>
      )}
    </div>
  );
}