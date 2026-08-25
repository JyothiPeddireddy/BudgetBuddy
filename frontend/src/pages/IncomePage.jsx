import { useEffect, useState, useRef } from "react";
import { Plus, X, Wallet, Calendar, Crown, Repeat, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { getIncomes } from "../api/transactions";
import { useToast } from "../context/ToastContext";
import IncomeForm from "../components/income/IncomeForm";
import IncomeList from "../components/income/IncomeList";
import DonutChart from "../components/charts/DonutChart";
import { getSourceMeta } from "../utils/sourceIcons";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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
    <div className="max-w-6xl mx-auto px-8 py-10 space-y-6">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div><h1 className="font-display text-2xl text-ink">Income</h1></div>
        <div className="flex items-center gap-3">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-ink bg-white"
          >
            {sources.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <MonthPicker selected={selectedMonth} onSelect={setSelectedMonth} />
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 bg-emerald text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Income
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-soft flex items-center justify-center">
              <Wallet size={18} className="text-emerald" strokeWidth={2.2} />
            </div>
            <p className="text-xs font-semibold text-ink">Total Income</p>
          </div>
          <p className="font-mono text-xl font-bold text-emerald">₹{totalIncome.toFixed(0)}</p>
          {totalPct !== null && (
            <p className="text-xs font-semibold mt-1.5 text-emerald">▲ {totalPct}% this month</p>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-soft flex items-center justify-center">
              <Calendar size={18} className="text-emerald" strokeWidth={2.2} />
            </div>
            <p className="text-xs font-semibold text-ink">This Month</p>
          </div>
          <p className="font-mono text-xl font-bold text-ink">₹{thisMonthTotal.toFixed(0)}</p>
          {monthPct !== null && (
            <p className={`text-xs font-semibold mt-1.5 ${monthPct >= 0 ? "text-emerald" : "text-coral"}`}>
              {monthPct >= 0 ? "▲" : "▼"} {Math.abs(monthPct)}% vs last month
            </p>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-soft flex items-center justify-center">
              <Crown size={18} className="text-indigo" strokeWidth={2.2} />
            </div>
            <p className="text-xs font-semibold text-ink">Top Source</p>
          </div>
          {topSource ? (
            <>
              <p className="font-display text-lg font-bold text-ink">{topSource[0]}</p>
              <p className="text-xs font-semibold text-slate mt-1">{topSourcePct}% of total</p>
            </>
          ) : (
            <p className="text-sm text-slate">No data</p>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Repeat size={18} className="text-orange-600" strokeWidth={2.2} />
            </div>
            <p className="text-xs font-semibold text-ink">Transactions</p>
          </div>
          <p className="font-mono text-xl font-bold text-ink">{transactionCount}</p>
          {prevPeriod && (
            <p className={`text-xs font-semibold mt-1.5 ${countDiff >= 0 ? "text-emerald" : "text-coral"}`}>
              {countDiff >= 0 ? "▲" : "▼"} {Math.abs(countDiff)} vs last month
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-5 items-start flex-wrap">
        <div className="card p-6 flex-1 min-w-[320px]">
          <h2 className="font-display text-lg text-ink mb-4">Recent Income</h2>
          <IncomeList incomes={recentIncomes} onDeleted={handleDeleted} onEdit={openEdit} />
        </div>

        <div className="card p-6 w-fit">
          <h2 className="font-display text-lg text-ink mb-4">Income Sources</h2>
          {donutData.length > 0 ? (
            <DonutChart data={donutData} size={140} thickness={20} centerLabel={`₹${thisMonthTotal.toFixed(0)}`} />
          ) : (
            <p className="text-sm text-slate">No income recorded for this period.</p>
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
              {editingIncome ? "Edit Income" : "Add Income"}
            </h2>
            <IncomeForm
              onAdded={handleAdded}
              editingIncome={editingIncome}
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
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
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
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-ink bg-white hover:border-emerald transition-colors">
        {label}
        <ChevronDown size={14} className="text-slate" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-20 p-3">
          <button onClick={() => { onSelect(null); setOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold mb-2 ${!selected ? "bg-emerald text-white" : "text-ink hover:bg-slate-50"}`}>
            All time
          </button>
          <div className="flex items-center justify-between px-1 mb-2">
            <button onClick={() => setViewYear((y) => y - 1)} className="p-1 hover:bg-slate-50 rounded"><ChevronLeft size={15} className="text-slate" /></button>
            <span className="text-xs font-semibold text-ink">{viewYear}</span>
            <button onClick={() => setViewYear((y) => y + 1)} disabled={isFutureYear} className="p-1 hover:bg-slate-50 rounded disabled:opacity-30"><ChevronRight size={15} className="text-slate" /></button>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {MONTHS.map((m, i) => {
              const monthNum = i + 1;
              const isSelected = selected?.year === viewYear && selected?.month === monthNum;
              const disabled = isFutureMonth(monthNum);
              return (
                <button key={m} disabled={disabled} onClick={() => { onSelect({ year: viewYear, month: monthNum }); setOpen(false); }} className={`px-2 py-2 rounded-lg text-xs font-semibold ${isSelected ? "bg-emerald text-white" : disabled ? "text-slate-300 cursor-not-allowed" : "text-ink hover:bg-slate-50"}`}>
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