import { useEffect, useState, useRef } from "react";
import { Bell, Trash2, CheckCheck } from "lucide-react";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../../api/notifications";
import { useToast } from "../../context/ToastContext";
import { timeAgo } from "../../utils/notificationMeta";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);
  const { showToast } = useToast();
  const seenIds = useRef(new Set());
  const isFirstLoad = useRef(true);
  const ref = useRef(null);

  const poll = async () => {
    try {
      const res = await getNotifications();
      const fresh = res.data;

      if (!isFirstLoad.current) {
        // Any notification we haven't seen yet gets a toast
        const newOnes = fresh.filter((n) => !seenIds.current.has(n.id));
        newOnes.forEach((n) => {
          showToast(cleanMessage(n.message), n.type === "budget_alert" ? "error" : "success");
        });
      }

      fresh.forEach((n) => seenIds.current.add(n.id));
      isFirstLoad.current = false;
      setNotifications(fresh);
    } catch {
      // silent — retry on next poll
    }
  };

  useEffect(() => {
    poll();
    const interval = setInterval(poll, 15000); // check every 15s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      showToast("Couldn't mark all as read.", "error");
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // don't also trigger the li's mark-as-read click
    setDeletingId(id);
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      seenIds.current.delete(id);
    } catch {
      showToast("Couldn't delete notification.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <Bell size={19} className="text-slate" strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-coral text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-30 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-ink">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="flex items-center gap-1 text-xs text-emerald font-semibold hover:underline disabled:opacity-50"
              >
                <CheckCheck size={13} />
                {markingAll ? "Marking…" : "Mark all as read"}
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-slate px-4 py-6 text-center">No notifications yet.</p>
          ) : (
            <ul className="divide-y divide-slate-50">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  onClick={() => !n.is_read && handleMarkRead(n.id)}
                  className={`group px-4 py-3 cursor-pointer transition-colors flex items-start justify-between gap-2 ${
                    n.is_read ? "bg-white" : "bg-emerald-soft/40 hover:bg-emerald-soft/60"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs text-ink">{cleanMessage(n.message)}</p>
                    <p className="text-[10px] text-slate mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, n.id)}
                    disabled={deletingId === n.id}
                    title="Delete notification"
                    className="shrink-0 p-1 rounded-md text-slate-300 hover:text-coral hover:bg-coral-soft opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  >
                    <Trash2 size={13} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// Strips the hidden [budget_alert:...] dedup marker before displaying to the user
function cleanMessage(message) {
  return message.replace(/\s*\[budget_alert:[^\]]+\]\s*$/, "");
}