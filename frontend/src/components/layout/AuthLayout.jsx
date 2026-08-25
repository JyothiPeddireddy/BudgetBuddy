// const LEDGER_ROWS = [
//   { label: "Groceries", amount: "-42.10" },
//   { label: "Freelance payment", amount: "+680.00" },
//   { label: "Electricity", amount: "-58.30" },
//   { label: "Rent", amount: "-950.00" },
//   { label: "Savings transfer", amount: "-200.00" },
//   { label: "Refund — bookstore", amount: "+18.40" },
// ];

// export default function AuthLayout({ eyebrow, title, subtitle, children }) {
//   const rows = [...LEDGER_ROWS, ...LEDGER_ROWS];

//   return (
//     <div className="min-h-screen flex flex-col lg:flex-row">
//       {/* Left: passbook cover */}
//       <aside className="lg:w-[42%] relative overflow-hidden bg-ink text-paper flex flex-col justify-between px-10 py-12">
//         <div>
//           <div className="flex items-baseline gap-2">
//             <span className="font-display italic text-3xl">Budget</span>
//             <span className="font-display text-3xl">Buddy</span>
//           </div>
//           <p className="mt-3 text-sm text-paper/60 max-w-xs">
//             Track your income, expenses, and savings goals — all in one place.
//           </p>
//         </div>

//         <div className="relative h-64 overflow-hidden mask-fade">
//           <div className="ticker-track font-mono text-sm text-paper/50 space-y-3">
//             {rows.map((row, i) => (
//               <div key={i} className="flex justify-between border-b border-paper/10 pb-3">
//                 <span>{row.label}</span>
//                 <span className={row.amount.startsWith("+") ? "text-gold" : ""}>
//                   {row.amount}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>

//         <p className="text-xs text-paper/40 font-mono">
//           Free to use — your data stays private
//         </p>
//       </aside>

//       {/* Right: form on ruled paper */}
//       <main className="flex-1 flex items-center justify-center px-6 py-16">
//         <div className="w-full max-w-md">
//           {eyebrow && <p className="auth-eyebrow">{eyebrow}</p>}
//           <h1 className="auth-title">{title}</h1>
//           {subtitle && <p className="auth-subtitle">{subtitle}</p>}
//           {children}
//         </div>
//       </main>
//     </div>
//   );
// }



// import { PiggyBank, Wallet, TrendingUp, Target } from "lucide-react";

// const FEATURES = [
//   { icon: TrendingUp, title: "Track Expenses", desc: "Know where your money goes" },
//   { icon: Wallet, title: "Set Budgets", desc: "Stay in control of your spending" },
//   { icon: Target, title: "Achieve Goals", desc: "Save for what matters most" },
// ];

// export default function AuthLayout({ title, subtitle, children }) {
//   return (
//     <div className="min-h-screen flex bg-white">
//       <div className="hidden lg:flex lg:w-1/2 bg-emerald-soft relative overflow-hidden flex-col justify-center px-16">
//         <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald/10" />
//         <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-emerald/5" />
//         <div className="relative z-10">
//           <div className="w-40 h-40 rounded-3xl bg-emerald flex items-center justify-center mb-10 shadow-lg">
//             <PiggyBank size={72} className="text-white" strokeWidth={1.5} />
//           </div>
//           <h2 className="font-display text-3xl text-ink mb-2">Track. Plan. Save. Grow.</h2>
//           <p className="text-slate mb-10">Smarter budgeting for a better tomorrow.</p>
//           <ul className="space-y-5">
//             {FEATURES.map((f) => {
//               const Icon = f.icon;
//               return (
//                 <li key={f.title} className="flex items-center gap-4">
//                   <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
//                     <Icon size={20} className="text-emerald" strokeWidth={2} />
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-ink">{f.title}</p>
//                     <p className="text-xs text-slate">{f.desc}</p>
//                   </div>
//                 </li>
//               );
//             })}
//           </ul>
//         </div>
//       </div>

//       <div className="flex-1 flex items-center justify-center px-6 py-16">
//         <div className="w-full max-w-md">
//           <div className="flex items-center gap-2 mb-8">
//             <div className="w-9 h-9 rounded-lg bg-emerald flex items-center justify-center">
//               <PiggyBank size={20} className="text-white" strokeWidth={2} />
//             </div>
//             <span className="font-display text-lg text-ink">Budget Buddy</span>
//           </div>
//           <h1 className="font-display text-2xl text-ink mb-2">{title}</h1>
//           {subtitle && <p className="text-sm text-slate mb-8">{subtitle}</p>}
//           {children}
//         </div>
//       </div>
//     </div>
//   );
// }


import { PiggyBank, Wallet, TrendingUp, Target, ShieldCheck, Smartphone, Sparkles } from "lucide-react";
import WalletIllustration from "../illustrations/WalletIllustration";
import PiggyBankIllustration from "../illustrations/PiggyBankIllustration";

const VARIANTS = {
  login: {
    Illustration: WalletIllustration,
    heading: "Track. Plan. Save. Grow.",
    tagline: "Smarter budgeting for a better tomorrow.",
    features: [
      { icon: TrendingUp, title: "Track Expenses", desc: "Know where your money goes" },
      { icon: Wallet, title: "Set Budgets", desc: "Stay in control of your spending" },
      { icon: Target, title: "Achieve Goals", desc: "Save for what matters most" },
    ],
  },
  signup: {
    Illustration: PiggyBankIllustration,
    heading: "Your money, your way.",
    tagline: "Join thousands of users who budget smarter.",
    features: [
      { icon: ShieldCheck, title: "Secure & Private", desc: "Your data is 100% safe" },
      { icon: Sparkles, title: "Easy to Use", desc: "Simple, beautiful and powerful" },
      { icon: Smartphone, title: "Works Everywhere", desc: "Web, mobile and more" },
    ],
  },
};

export default function AuthLayout({ title, subtitle, children, variant = "login" }) {
  const { Illustration, heading, tagline, features } = VARIANTS[variant] || VARIANTS.login;

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex lg:w-1/2 bg-[#CCFBF1] relative overflow-hidden flex-col justify-center px-16">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#B9F3E9]" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-[#C3F7ED]/70" />

        <div className="relative z-10">
          <div className="w-40 h-40 mb-8">
            <Illustration className="w-full h-full" />
          </div>

          <h2 className="font-display text-3xl text-[#202020] mb-2">{heading}</h2>
          <p className="text-[#64748B] mb-10">{tagline}</p>

          <ul className="space-y-5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.title} className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                    <Icon size={20} className="text-[#14B8A6]" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#202020]">{f.title}</p>
                    <p className="text-xs text-[#64748B]">{f.desc}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg bg-[#14B8A6] flex items-center justify-center">
              <PiggyBank size={20} className="text-white" strokeWidth={2} />
            </div>
            <span className="font-display text-lg text-[#202020]">Budget Buddy</span>
          </div>

          <h1 className="font-display text-2xl text-[#202020] mb-2">{title}</h1>
          {subtitle && <p className="text-sm text-[#64748B] mb-8">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}