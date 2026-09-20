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
    document.addEventListener("pointerdown", handleClick);
    return () => document.removeEventListener("pointerdown", handleClick);
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
        className="relative p-2.5 sm:p-2 rounded-lg hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={19} className="text-slate" strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 sm:-top-0.5 sm:-right-0.5 w-4 h-4 bg-coral text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        /* Phone: pinned under the top bar with 12px margins (always fits the screen).
           Laptop: normal dropdown under the bell. */
        <div
          className="
            fixed left-3 right-3 top-[4.25rem] z-40
            max-h-[70dvh] overflow-y-auto
            bg-white border border-slate-200 rounded-xl shadow-lg
            sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80 sm:max-h-96
          "
        >
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
                  {/* Always visible on touch screens; hover-only on laptops */}
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, n.id)}
                    disabled={deletingId === n.id}
                    title="Delete notification"
                    aria-label="Delete notification"
                    className="shrink-0 p-1.5 sm:p-1 rounded-md text-slate hover:text-coral hover:bg-coral-soft sm:text-slate-300 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity disabled:opacity-50"
                  >
                    <Trash2 size={14} />
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