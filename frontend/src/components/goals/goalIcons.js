import {
  Laptop, Plane, ShieldCheck, Car, Home,
  Gift, Smartphone, Camera, GraduationCap, Heart,
  Briefcase, Bike,
} from "lucide-react";

export const ICON_OPTIONS = [
  { key: "laptop", icon: Laptop, bg: "bg-emerald-soft", text: "text-emerald", bar: "bg-emerald" },
  { key: "plane", icon: Plane, bg: "bg-sky-100", text: "text-sky-600", bar: "bg-sky-500" },
  { key: "shield", icon: ShieldCheck, bg: "bg-orange-100", text: "text-orange-600", bar: "bg-orange-500" },
  { key: "car", icon: Car, bg: "bg-indigo-soft", text: "text-indigo", bar: "bg-indigo" },
  { key: "home", icon: Home, bg: "bg-purple-100", text: "text-purple-600", bar: "bg-purple-500" },
  { key: "gift", icon: Gift, bg: "bg-pink-100", text: "text-pink-600", bar: "bg-pink-500" },
  { key: "phone", icon: Smartphone, bg: "bg-cyan-100", text: "text-cyan-600", bar: "bg-cyan-500" },
  { key: "camera", icon: Camera, bg: "bg-amber-100", text: "text-amber-600", bar: "bg-amber-500" },
  { key: "education", icon: GraduationCap, bg: "bg-violet-100", text: "text-violet-600", bar: "bg-violet-500" },
  { key: "wedding", icon: Heart, bg: "bg-rose-100", text: "text-rose-600", bar: "bg-rose-500" },
  { key: "business", icon: Briefcase, bg: "bg-slate-100", text: "text-slate", bar: "bg-slate-500" },
  { key: "bike", icon: Bike, bg: "bg-teal-100", text: "text-teal-600", bar: "bg-teal-500" },
];

export function getGoalIcon(key) {
  const found = ICON_OPTIONS.find((o) => o.key === key);
  if (!found && import.meta.env.DEV) {
    console.warn(`No icon mapping found for key "${key}" — falling back to default (laptop).`);
  }
  return found || ICON_OPTIONS[0];
}