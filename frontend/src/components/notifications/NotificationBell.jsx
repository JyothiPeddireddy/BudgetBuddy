import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { getNotifications, markNotificationRead } from "../../api/notifications";
import { useToast } from "../../context/ToastContext";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
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
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-ink">Notifications</p>
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-slate px-4 py-6 text-center">No notifications yet.</p>
          ) : (
            <ul className="divide-y divide-slate-50">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  onClick={() => !n.is_read && handleMarkRead(n.id)}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    n.is_read ? "bg-white" : "bg-emerald-soft/40 hover:bg-emerald-soft/60"
                  }`}
                >
                  <p className="text-xs text-ink">{cleanMessage(n.message)}</p>
                  <p className="text-[10px] text-slate mt-1">
                    {new Date(n.created_at).toLocaleString("en-US", {
                      month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                    })}
                  </p>
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