// True pie chart -- solid wedges from the center, unlike DonutChart
// (which renders a ring with a hole). Built with SVG arc paths.

export default function PieChart({ data, size = 145 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = size / 2;
  const cx = radius;
  const cy = radius;

  if (total <= 0) return null;

  let cumulativeAngle = -90; // start at 12 o'clock

  const slices = data.map((d) => {
    const angle = (d.value / total) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle = endAngle;

    const toRad = (deg) => (deg * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(toRad(startAngle));
    const y1 = cy + radius * Math.sin(toRad(startAngle));
    const x2 = cx + radius * Math.cos(toRad(endAngle));
    const y2 = cy + radius * Math.sin(toRad(endAngle));
    const largeArc = angle > 180 ? 1 : 0;

    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return { path, color: d.color, label: d.label, value: d.value };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {slices.map((s) => (
        <path key={s.label} d={s.path} fill={s.color} stroke="#fff" strokeWidth="1.5" />
      ))}
    </svg>
  );
}