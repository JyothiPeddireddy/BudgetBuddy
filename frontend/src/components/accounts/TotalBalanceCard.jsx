import WalletIllustration from "./WalletIllustration";

export default function TotalBalanceCard({ totalBalance }) {
  return (
    <div
      className="rounded-[20px] p-6 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #14B8A6, #0D9488)" }}
    >
      <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10" />
      <div className="relative z-10 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
          <WalletIllustration size={28} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>
            Total Balance
          </p>
          <p className="font-mono text-3xl font-bold mt-1" style={{ color: "#FFFFFF" }}>
            ₹{totalBalance.toFixed(0)}
          </p>
        </div>
      </div>
    </div>
  );
}