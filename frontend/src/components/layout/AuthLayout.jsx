const LEDGER_ROWS = [
  { label: "Groceries", amount: "-42.10" },
  { label: "Freelance payment", amount: "+680.00" },
  { label: "Electricity", amount: "-58.30" },
  { label: "Rent", amount: "-950.00" },
  { label: "Savings transfer", amount: "-200.00" },
  { label: "Refund — bookstore", amount: "+18.40" },
];

export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  const rows = [...LEDGER_ROWS, ...LEDGER_ROWS];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left: passbook cover */}
      <aside className="lg:w-[42%] relative overflow-hidden bg-ink text-paper flex flex-col justify-between px-10 py-12">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-display italic text-3xl">Budget</span>
            <span className="font-display text-3xl">Buddy</span>
          </div>
          <p className="mt-3 text-sm text-paper/60 max-w-xs">
            Track your income, expenses, and savings goals — all in one place.
          </p>
        </div>

        <div className="relative h-64 overflow-hidden mask-fade">
          <div className="ticker-track font-mono text-sm text-paper/50 space-y-3">
            {rows.map((row, i) => (
              <div key={i} className="flex justify-between border-b border-paper/10 pb-3">
                <span>{row.label}</span>
                <span className={row.amount.startsWith("+") ? "text-gold" : ""}>
                  {row.amount}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-paper/40 font-mono">
          Free to use — your data stays private
        </p>
      </aside>

      {/* Right: form on ruled paper */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          {eyebrow && <p className="auth-eyebrow">{eyebrow}</p>}
          <h1 className="auth-title">{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          {children}
        </div>
      </main>
    </div>
  );
}