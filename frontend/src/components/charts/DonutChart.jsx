export default function DonutChart({ data, size = 160, thickness = 22, centerLabel, centerSubLabel }) {
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
    <div className="flex items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <div className="w-full h-full rounded-full" style={{ background: gradient }} />
        <div
          className="absolute rounded-full bg-white flex flex-col items-center justify-center"
          style={{ top: thickness, left: thickness, right: thickness, bottom: thickness }}
        >
          {centerLabel && <span className="font-mono text-lg text-ink font-bold">{centerLabel}</span>}
          {centerSubLabel && <span className="text-[10px] font-semibold text-slate">{centerSubLabel}</span>}
        </div>
      </div>
      <ul className="space-y-2.5 min-w-[130px]">
        {data.map((d) => (
          <li key={d.label} className="flex items-center justify-between gap-6 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
              <span className="text-ink font-semibold">{d.label}</span>
            </span>
            <span className="text-ink font-bold">
              {total > 0 ? Math.round((d.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}