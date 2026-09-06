import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LabelList,
} from "recharts";

function formatCompact(value) {
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-ink mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: ₹{p.value.toFixed(0)}
        </p>
      ))}
    </div>
  );
}

function renderLegend() {
  return (
    <div className="flex items-center justify-center gap-6 mb-2">
      <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
        <span className="w-2.5 h-2.5 rounded-sm bg-emerald" /> Income
      </span>
      <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
        <span className="w-2.5 h-2.5 rounded-sm bg-coral" /> Expenses
      </span>
    </div>
  );
}

export default function GroupedBarChart({ data }) {
  const hasData = data.some((d) => d.income > 0 || d.expenses > 0);

  if (!hasData) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-sm text-slate">No income or expense data yet for this range.</p>
      </div>
    );
  }

  return (
    <div>
      {renderLegend()}
      {/*
        height bumped 260 -> 280 and bottom margin 0 -> 24 so the XAxis
        month labels have room to render instead of being clipped at
        the bottom edge of the chart.
      */}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 24, right: 8, left: 0, bottom: 24 }} barGap={6}>
          <CartesianGrid vertical={false} stroke="#eef2f0" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
            height={30}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={formatCompact}
            tick={{ fill: "#64748b", fontSize: 11 }}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
          <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={28}>
            <LabelList
              dataKey="income"
              position="top"
              formatter={(v) => (v > 0 ? formatCompact(v) : "")}
              style={{ fill: "#0f172a", fontSize: 11, fontWeight: 700 }}
            />
          </Bar>
          <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={28}>
            <LabelList
              dataKey="expenses"
              position="top"
              formatter={(v) => (v > 0 ? formatCompact(v) : "")}
              style={{ fill: "#0f172a", fontSize: 11, fontWeight: 700 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}