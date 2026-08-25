export default function GroupedBarChart({ data, height = 180 }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => Math.max(d.income, d.expenses)), 1);

  return (
    <div>
      <div className="flex items-end justify-between gap-3" style={{ height }}>
        {data.map((d) => (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-end gap-1 w-full justify-center" style={{ height: height - 20 }}>
              <div
                className="w-3 rounded-t bg-emerald relative group"
                style={{ height: `${(d.income / max) * 100}%` }}
                title={`Income ₹${d.income.toFixed(0)}`}
              />
              <div
                className="w-3 rounded-t bg-coral"
                style={{ height: `${(d.expenses / max) * 100}%` }}
                title={`Expenses ₹${d.expenses.toFixed(0)}`}
              />
            </div>
            <span className="text-[10px] font-semibold text-slate">{d.month}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 justify-center mt-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald" /> Income
        </span>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate">
          <span className="w-2.5 h-2.5 rounded-sm bg-coral" /> Expenses
        </span>
      </div>
    </div>
  );
}