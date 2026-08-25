import { TrendingDown, PiggyBank, Trophy, FileText, Bell } from "lucide-react";

export const NOTIFICATION_META = {
  budget_alert: { icon: TrendingDown, bg: "bg-coral-soft", text: "text-coral", tab: "alerts" },
  savings_reminder: { icon: PiggyBank, bg: "bg-purple-100", text: "text-purple-600", tab: "reminders" },
  goal_milestone: { icon: Trophy, bg: "bg-orange-100", text: "text-orange-600", tab: "updates" },
  monthly_report: { icon: FileText, bg: "bg-sky-100", text: "text-sky-600", tab: "updates" },
};

export function getNotificationMeta(type) {
  return NOTIFICATION_META[type] || { icon: Bell, bg: "bg-slate-100", text: "text-slate", tab: "updates" };
}

export function groupByDay(notifications) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);

  const groups = { Today: [], Yesterday: [], Earlier: [] };
  notifications.forEach((n) => {
    const d = new Date(n.created_at); d.setHours(0, 0, 0, 0);
    if (d.getTime() === today.getTime()) groups.Today.push(n);
    else if (d.getTime() === yesterday.getTime()) groups.Yesterday.push(n);
    else groups.Earlier.push(n);
  });
  return groups;
}

export function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}