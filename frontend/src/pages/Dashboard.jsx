import { useEffect, useState, useRef } from "react";
import { TrendingUp, TrendingDown, Wallet2, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { getDashboard } from "../api/transactions";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null); // { year, month } or null for "All time"

  useEffect(() => {
    setData(null);
    const call = selected ? getDashboard(selected.year, selected.month) : getDashboard();
    call.then((res) => setData(res.data));
  }, [selected]);

  const eyebrowLabel = selected
    ? new Date(selected.year, selected.month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "All time";

  if (!data) return <div className="px-10 py-12 text-slate text-sm">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto px-10 py-12 space-y-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="eyebrow">Overview</p>
          <h1 className="font-display text-3xl text-ink">{eyebrowLabel}</h1>
        </div>
        <MonthYearPicker selected={selected} onSelect={setSelected} />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <StatCard label="Income" value={data.total_income} prefix="+" icon={TrendingUp} color="emerald" />
        <StatCard label="Expenses" value={data.total_expenses} prefix="-" icon={TrendingDown} color="coral" />
        <StatCard label="Balance" value={data.balance} prefix="" icon={Wallet2} color="indigo" />
      </div>

      {data.top_categories.length > 0 && (
        <div className="card p-6">
          <h2 className="font-display text-lg text-ink mb-4">Top categories</h2>
          <ul className="space-y-3">
            {data.top_categories.map((c) => (
              <li key={c.category} className="flex justify-between items-center">
                <span className="text-sm text-slate">{c.category}</span>
                <span className="font-mono text-sm text-ink">{c.total.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card p-6">
        <h2 className="font-display text-lg text-ink mb-4">Recent transactions</h2>
        {data.recent_transactions.length === 0 ? (
          <p className="text-sm text-slate">Nothing recorded yet.</p>
        ) : (
          <ul className="space-y-3">
            {data.recent_transactions.map((t) => (
              <li key={`${t.type}-${t.id}`} className="flex justify-between items-center">
                <span className="text-sm text-slate">{t.category || t.source}</span>
                <span className={`font-mono text-sm ${t.type === "income" ? "text-emerald" : "text-coral"}`}>
                  {t.type === "income" ? "+" : "-"}{t.amount.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function MonthYearPicker({ selected, onSelect }) {
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
    ? new Date(selected.year, selected.month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "All time";

  const now = new Date();
  const isFutureMonth = (m) => viewYear === now.getFullYear() && m > now.getMonth() + 1;
  const isFutureYear = viewYear >= now.getFullYear();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-ink bg-white hover:border-emerald transition-colors"
      >
        {label}
        <ChevronDown size={16} className="text-slate" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-20 p-3">
          <button
            onClick={() => { onSelect(null); setOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-2 transition-colors ${
              !selected ? "bg-indigo text-white" : "text-ink hover:bg-slate-50"
            }`}
          >
            All time
          </button>

          <div className="flex items-center justify-between px-1 mb-2">
            <button onClick={() => setViewYear((y) => y - 1)} className="p-1 hover:bg-slate-50 rounded">
              <ChevronLeft size={16} className="text-slate" />
            </button>
            <span className="text-sm font-medium text-ink">{viewYear}</span>
            <button
              onClick={() => setViewYear((y) => y + 1)}
              disabled={isFutureYear}
              className="p-1 hover:bg-slate-50 rounded disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight size={16} className="text-slate" />
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
                  className={`px-2 py-2 rounded-lg text-xs transition-colors ${
                    isSelected
                      ? "bg-emerald text-white"
                      : disabled
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-ink hover:bg-slate-50"
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

function StatCard({ label, value, prefix, icon: Icon, color }) {
  const styles = {
    emerald: { bg: "bg-emerald-soft", text: "text-emerald", icon: "text-emerald" },
    coral: { bg: "bg-coral-soft", text: "text-coral", icon: "text-coral" },
    indigo: { bg: "bg-indigo-soft", text: "text-indigo", icon: "text-indigo" },
  }[color];

  return (
    <div className="card p-6">
      <div className={`w-10 h-10 rounded-lg ${styles.bg} flex items-center justify-center mb-4`}>
        <Icon size={18} className={styles.icon} strokeWidth={2.2} />
      </div>
      <p className="text-xs text-slate mb-1">{label}</p>
      <p className={`font-mono text-2xl ${styles.text}`}>
        {prefix}{value.toFixed(2)}
      </p>
    </div>
  );
}