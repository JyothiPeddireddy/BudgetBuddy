import { Briefcase, Laptop, Gift, Wallet, TrendingUp } from "lucide-react";

const RULES = [
  { match: /salary|payroll/i, icon: Briefcase, bg: "bg-emerald-soft", text: "text-emerald", color: "#10b981" },
  { match: /freelance|contract|project/i, icon: Laptop, bg: "bg-orange-100", text: "text-orange-600", color: "#f97316" },
  { match: /bonus|referral/i, icon: TrendingUp, bg: "bg-sky-100", text: "text-sky-600", color: "#0ea5e9" },
  { match: /gift/i, icon: Gift, bg: "bg-pink-100", text: "text-pink-600", color: "#ec4899" },
];

const FALLBACK = { icon: Wallet, bg: "bg-purple-100", text: "text-purple-600", color: "#a855f7" };

export function getSourceMeta(source) {
  const rule = RULES.find((r) => r.match.test(source || ""));
  return rule || FALLBACK;
}