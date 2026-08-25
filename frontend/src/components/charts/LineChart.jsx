function formatK(value) {
  if (Math.abs(value) >= 1000) return `${Math.round(value / 1000)}k`;
  return Math.round(value).toString();
}

export default function LineChart({ data, height = 100 }) {
  if (!data.length) return null;

  const values = data.map((d) => d.balance);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const width = 100;
  const padding = 4;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((d.balance - min) / range) * (height - padding * 2);
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const mid = (max + min) / 2;

  return (
    <div className="flex gap-2">
      <div className="flex flex-col justify-between text-[10px] text-slate font-semibold shrink-0" style={{ height }}>
        <span>{formatK(max)}</span>
        <span>{formatK(mid)}</span>
        <span>{formatK(min)}</span>
      </div>
      <div className="flex-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#trendFill)" />
          <path d={linePath} fill="none" stroke="#10b981" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="1.8" fill="#10b981" vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
        <div className="flex justify-between mt-1">
          {data.map((d) => (
            <span key={d.month} className="text-[10px] text-slate font-semibold">{d.month}</span>
          ))}
        </div>
      </div>
    </div>
  );
}