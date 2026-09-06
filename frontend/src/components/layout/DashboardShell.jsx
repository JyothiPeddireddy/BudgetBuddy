import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { LayoutDashboard, Receipt, Wallet, PiggyBank, LogOut, Landmark, Target, User, Mail, ChevronDown, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../notifications/NotificationBell";
import { BarChart3 } from "lucide-react";
import { PieChart } from "lucide-react";

const BASE_NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", end: true, icon: LayoutDashboard },
  { to: "/dashboard/accounts", label: "Accounts", icon: Landmark },
  { to: "/dashboard/income", label: "Income", icon: Wallet },
  { to: "/dashboard/expenses", label: "Expenses", icon: Receipt },
  { to: "/dashboard/budgets", label: "Budgets", icon: PiggyBank },
  { to: "/dashboard/goals", label: "Goals", icon: Target },
  { to: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { to: "/dashboard/analytics", label: "Analytics", icon: PieChart },
  { to: "/dashboard/profile", label: "Profile", icon: User },
];

// Admin-only nav item, appended conditionally below so it never
// renders for User/Premium accounts (backend still gates it either way).
const ADMIN_NAV_ITEM = { to: "/dashboard/system-analytics", label: "Admin", icon: ShieldCheck };

// Shown in the top-right profile dropdown so it's obvious at a glance
// which tier the logged-in account is on.
const ROLE_LABELS = {
  admin: "Admin",
  premium: "Premium User",
  user: "User",
};

const ROLE_BADGE_STYLES = {
  admin: "bg-purple-100 text-purple-700",
  premium: "bg-emerald-soft text-emerald",
  user: "bg-slate-100 text-slate",
};

export default function DashboardShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = user?.role === "admin" ? [...BASE_NAV_ITEMS, ADMIN_NAV_ITEM] : BASE_NAV_ITEMS;

  return (
    <div className="min-h-screen flex bg-paper">
      <aside className="w-60 bg-ink flex flex-col justify-between py-8 px-5">
        <div>
          <div className="flex items-center gap-2.5 mb-10 px-1">
            <div className="w-8 h-8 rounded-lg bg-emerald flex items-center justify-center shrink-0">
              <Wallet size={16} className="text-white" strokeWidth={2.4} />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-lg text-paper">Budget</span>
                <span className="font-display text-lg text-paper">Buddy</span>
              </div>
              <p className="text-[10px] text-paper/40 font-mono tracking-wide -mt-0.5">
                Plan · Save · Grow
              </p>
            </div>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                      isActive
                        ? "bg-gold text-ink font-medium"
                        : "text-paper/60 hover:bg-paper/10 hover:text-paper"
                    }`
                  }
                >
                  <Icon size={17} strokeWidth={2} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="px-1">
          <div className="flex items-center gap-2.5 mb-4 px-2 py-2 rounded-lg bg-paper/5 border border-paper/10">
            <div className="w-7 h-7 rounded-full bg-gold text-ink flex items-center justify-center text-xs font-semibold uppercase shrink-0">
              {user?.username?.[0]}
            </div>
            <p className="text-xs text-paper/70 font-mono truncate">{user?.username}</p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full text-xs px-3 py-2 rounded-md border border-paper/15 text-paper/60 hover:border-brick hover:text-brick transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-end gap-3 px-8 pt-6">
          <NotificationBell />
          <ProfileMenu user={user} onLogout={handleLogout} />
        </div>
        <Outlet />
      </main>
    </div>
  );
}


/* ============================================================
   PROFILE MENU  (avatar button -> dropdown with email + logout)
============================================================ */

function ProfileMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full border border-slate-200 bg-white hover:border-emerald transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-emerald text-white flex items-center justify-center text-xs font-semibold uppercase shrink-0">
          {user?.username?.[0]}
        </div>
        <ChevronDown size={14} className="text-slate" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-2">
          <div className="px-4 py-2 border-b border-slate-100 space-y-1.5">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-slate shrink-0" />
              <p className="text-xs text-ink font-mono truncate">{user?.email}</p>
            </div>
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${ROLE_BADGE_STYLES[user?.role] || ROLE_BADGE_STYLES.user}`}
            >
              {ROLE_LABELS[user?.role] || "User"}
            </span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm font-semibold text-coral hover:bg-coral-soft transition-colors"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}