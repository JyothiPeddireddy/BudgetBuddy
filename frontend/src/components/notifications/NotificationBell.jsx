import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { getNotifications, markNotificationRead } from "../../api/notifications";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const load = async () => {
    const res = await getNotifications();
    setNotifications(res.data);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // poll every 30s
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

  const handleRead = async (id) => {
    await markNotificationRead(id);
    load();
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="relative p-2 hover:bg-slate-50 rounded-lg">
        <Bell size={20} className="text-slate" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-coral text-white text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg z-20">
          {notifications.length === 0 ? (
            <p className="text-sm text-slate p-4">No notifications yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  onClick={() => !n.is_read && handleRead(n.id)}
                  className={`p-3 text-sm cursor-pointer transition-colors ${
                    n.is_read ? "text-slate" : "text-ink bg-indigo-soft/40 hover:bg-indigo-soft/60"
                  }`}
                >
                  <p>{n.message}</p>
                  <p className="text-xs text-slate mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}