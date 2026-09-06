import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

function formatCompact(value) {
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const nonZero = payload.filter((p) => p.value > 0);
  if (nonZero.length === 0) return null;

  const total = nonZero.reduce((sum, p) => sum + p.value, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs max-w-[220px]">
      <p className="font-semibold text-ink mb-1">{label}</p>
      {nonZero.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: ₹{p.value.toFixed(0)}
        </p>
      ))}
      <p className="text-ink font-bold mt-1 pt-1 border-t border-slate-100">
        Total: ₹{total.toFixed(0)}
      </p>
    </div>
  );
}

function renderLegend(categories) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 mb-2">
      {categories.map((c) => (
        <span key={c.key} className="flex items-center gap-1.5 text-xs font-semibold text-ink">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: c.color }} />
          {c.key}
        </span>
      ))}
    </div>
  );
}

/**
 * data: [{ month: "Jan '26", Food: 1200, Travel: 400, ... }, ...]
 * categories: [{ key: "Food", color: "#f97316" }, ...]  — stacking order + color per category
 */
export default function StackedBarChart({ data, categories }) {
  const hasData = data.some((d) =>
    categories.some((c) => (d[c.key] || 0) > 0)
  );

  if (!hasData || categories.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-sm text-slate">No category spending data yet for this range.</p>
      </div>
    );
  }

  return (
    <div>
      {renderLegend(categories)}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
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
          {categories.map((c, i) => (
            <Bar
              key={c.key}
              dataKey={c.key}
              name={c.key}
              stackId="categories"
              fill={c.color}
              radius={i === categories.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
              maxBarSize={48}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}