export default function RadialProgress({ value, max, size = 160, thickness = 16, color = "#10b981", label, sublabel }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const gradient = `conic-gradient(${color} ${pct}%, #e2e8f0 ${pct}%)`;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <div className="w-full h-full rounded-full" style={{ background: gradient }} />
      <div
        className="absolute rounded-full bg-white flex flex-col items-center justify-center text-center px-2"
        style={{ top: thickness, left: thickness, right: thickness, bottom: thickness }}
      >
        <span className="font-mono text-2xl text-ink font-bold">{Math.round(pct)}%</span>
        {label && <span className="text-[11px] text-slate mt-1">{label}</span>}
        {sublabel && <span className="text-[10px] text-slate/70">{sublabel}</span>}
      </div>
    </div>
  );
}