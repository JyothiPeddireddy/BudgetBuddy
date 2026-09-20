export default function SpendingPieChart({
  data,
  size = 130,
  currencyLabel = "Total Expenses",
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  let cumulative = 0;

  const stops = data.map((d) => {
    const pct = total > 0 ? (d.value / total) * 100 : 0;
    const start = cumulative;
    cumulative += pct;

    return `${d.color} ${start}% ${cumulative}%`;
  });

  const gradient =
    stops.length > 0
      ? `conic-gradient(${stops.join(", ")})`
      : "conic-gradient(#e2e8f0 0% 100%)";

  return (
    <div className="w-full min-w-0">
      {/* CHART + CATEGORY LIST */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
        <div
          className="rounded-full shrink-0"
          style={{
            width: size,
            height: size,
            background: gradient,
          }}
        />

        <ul className="w-full sm:w-auto min-w-0 space-y-2">
          {data.map((d) => {
            const pct =
              total > 0 ? Math.round((d.value / total) * 100) : 0;

            return (
              <li
                key={d.label}
                className="flex items-center gap-2 text-sm min-w-0"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: d.color }}
                />

                <div className="flex items-center justify-between gap-3 min-w-0 w-full">
                  <span className="text-ink font-semibold min-w-0 truncate">
                    {d.label}
                  </span>

                  <span className="text-slate shrink-0 whitespace-nowrap">
                    ₹{d.value.toLocaleString("en-IN")} ({pct}%)
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* TOTAL */}
      <p className="text-sm font-semibold text-ink mt-4">
        {currencyLabel}:{" "}
        <span className="text-indigo">
          ₹{total.toLocaleString("en-IN")}
        </span>
      </p>
    </div>
  );
}