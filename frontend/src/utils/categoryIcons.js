import { Utensils, Plane, ShoppingBag, BookOpen, Film, Package, Receipt } from "lucide-react";

export const CATEGORY_META = {
  Food: { icon: Utensils, bg: "bg-orange-100", text: "text-orange-600", color: "#f97316" },
  Travel: { icon: Plane, bg: "bg-sky-100", text: "text-sky-600", color: "#0ea5e9" },
  Shopping: { icon: ShoppingBag, bg: "bg-purple-100", text: "text-purple-600", color: "#a855f7" },
  Education: { icon: BookOpen, bg: "bg-indigo-soft", text: "text-indigo", color: "#6366f1" },
  Entertainment: { icon: Film, bg: "bg-pink-100", text: "text-pink-600", color: "#ec4899" },
  Miscellaneous: { icon: Package, bg: "bg-slate-100", text: "text-slate", color: "#64748b" },
};

export function getCategoryMeta(category) {
  return CATEGORY_META[category] || { icon: Receipt, bg: "bg-coral-soft", text: "text-coral", color: "#ef4444" };
}