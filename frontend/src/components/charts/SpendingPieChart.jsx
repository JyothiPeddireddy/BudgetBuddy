export default function SpendingPieChart({ data, size = 130, currencyLabel = "Total Expenses" }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let cumulative = 0;
  const stops = data.map((d) => {
    const pct = total > 0 ? (d.value / total) * 100 : 0;
    const start = cumulative;
    cumulative += pct;
    return `${d.color} ${start}% ${cumulative}%`;
  });
  const gradient = stops.length > 0 ? `conic-gradient(${stops.join(", ")})` : "conic-gradient(#e2e8f0 0% 100%)";

  return (
    <div>
      <div className="flex items-center gap-6">
        <div className="rounded-full shrink-0" style={{ width: size, height: size, background: gradient }} />
        <ul className="space-y-2">
          {data.map((d) => {
            const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
            return (
              <li key={d.label} className="flex items-center gap-2 text-sm">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-ink font-semibold">{d.label}</span>
                <span className="text-slate">₹{d.value.toLocaleString("en-IN")} ({pct}%)</span>
              </li>
            );
          })}
        </ul>
      </div>
      <p className="text-sm font-semibold text-ink mt-4">
        {currencyLabel}: <span className="text-indigo">₹{total.toLocaleString("en-IN")}</span>
      </p>
    </div>
  );
}