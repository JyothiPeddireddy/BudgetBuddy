import { useEffect, useState } from "react";
import { Bell, Trash2 } from "lucide-react";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../api/notifications";
import { getNotificationMeta, groupByDay, timeAgo } from "../utils/notificationMeta";

const TABS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "alerts", label: "Alerts" },
  { key: "reminders", label: "Reminders" },
  { key: "updates", label: "Updates" },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );

  const load = async () => {
    const res = await getNotifications();
    setNotifications(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleRead = async (id) => {
    await markNotificationRead(id);
    load();
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    await deleteNotification(id);
    load();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    load();
  };

  const handleEnableNotifications = async () => {
    if (typeof Notification === "undefined") {
      alert("Your browser doesn't support push notifications.");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotifPermission(permission);

    if (permission === "granted") {
      new Notification("Budget Buddy", {
        body: "You'll now get real-time alerts here.",
      });
    }
  };

  const counts = {
    all: notifications.length,
    unread: notifications.filter((n) => !n.is_read).length,
    alerts: notifications.filter(
      (n) => getNotificationMeta(n.type).tab === "alerts"
    ).length,
    reminders: notifications.filter(
      (n) => getNotificationMeta(n.type).tab === "reminders"
    ).length,
    updates: notifications.filter(
      (n) => getNotificationMeta(n.type).tab === "updates"
    ).length,
  };

  const filtered = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.is_read;
    return getNotificationMeta(n.type).tab === activeTab;
  });

  const grouped = groupByDay(filtered);

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <h1 className="font-display text-2xl text-ink mb-1">Notifications</h1>
      <p className="text-sm text-slate mb-6">
        Stay updated with important alerts and updates.
      </p>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 card p-6">
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  activeTab === tab.key
                    ? "bg-emerald-soft border-emerald text-emerald"
                    : "border-slate-200 text-slate hover:border-slate-300"
                }`}
              >
                {tab.label} ({counts[tab.key]})
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-slate">No notifications here.</p>
          ) : (
            Object.entries(grouped).map(([group, items]) =>
              items.length > 0 && (
                <div key={group} className="mb-6 last:mb-0">
                  <p className="text-xs font-bold text-slate uppercase tracking-wide mb-3">
                    {group}
                  </p>

                  <ul className="space-y-2">
                    {items.map((n) => {
                      const { icon: Icon, bg, text } = getNotificationMeta(n.type);

                      return (
                        <li
                          key={n.id}
                          onClick={() => !n.is_read && handleRead(n.id)}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                            n.is_read
                              ? "border-slate-100"
                              : "border-emerald-soft bg-emerald-soft/30 hover:bg-emerald-soft/50"
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}
                          >
                            <Icon
                              size={16}
                              className={text}
                              strokeWidth={2.2}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-ink">
                              {n.message}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-slate whitespace-nowrap">
                              {timeAgo(n.created_at)}
                            </span>

                            {!n.is_read && (
                              <span className="w-2 h-2 rounded-full bg-emerald" />
                            )}

                            <button
                              onClick={(e) => handleDelete(n.id, e)}
                              className="text-slate hover:text-coral transition-colors"
                              aria-label="Delete notification"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )
            )
          )}
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-base text-ink">Filter</h2>

              <button
                onClick={handleMarkAllRead}
                className="text-xs text-emerald font-semibold hover:underline"
              >
                Mark all as read
              </button>
            </div>

            <ul className="space-y-1">
              {TABS.map((tab) => (
                <li key={tab.key}>
                  <button
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      activeTab === tab.key
                        ? "bg-emerald-soft text-emerald"
                        : "text-ink hover:bg-slate-50"
                    }`}
                  >
                    {tab.key === "all" ? "All Notifications" : tab.label}
                    <span className="text-xs">{counts[tab.key]}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}