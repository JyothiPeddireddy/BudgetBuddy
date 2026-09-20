import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  PiggyBank,
  LogOut,
  Landmark,
  Target,
  User,
  Mail,
  ChevronDown,
  ShieldCheck,
  Menu,
  X,
  BarChart3,
  PieChart,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../notifications/NotificationBell";
import useMediaQuery from "../../hooks/useMediaQuery";

/**
 * Keep this in sync with --breakpoint-dt in index.css.
 * 900px is deliberately BELOW the ~980px layout viewport that mobile
 * browsers use for "Desktop site", so a phone in desktop mode gets the
 * real sidebar instead of the hamburger drawer.
 */
const DESKTOP_QUERY = "(min-width: 900px)";

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

// Admin-only nav item (backend still gates it either way)
const ADMIN_NAV_ITEM = {
  to: "/dashboard/system-analytics",
  label: "Admin",
  icon: ShieldCheck,
};

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

export default function DashboardShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems =
    user?.role === "admin" ? [...BASE_NAV_ITEMS, ADMIN_NAV_ITEM] : BASE_NAV_ITEMS;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Stop the page behind the open drawer from scrolling
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // If the window grows past the desktop breakpoint, close the drawer
  useEffect(() => {
    if (isDesktop) setMobileMenuOpen(false);
  }, [isDesktop]);

  return (
    <div className="min-h-screen flex bg-paper overflow-x-clip">
      {/* Mobile overlay — only while the drawer is open below dt */}
      {mobileMenuOpen && !isDesktop && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-black/40 dt:hidden"
        />
      )}

      {/* Sidebar (slide-in drawer below dt, fixed column at dt and above) */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-64 max-w-[85vw] dt:w-60 bg-ink
          flex flex-col justify-between gap-6
          py-6 dt:py-8 px-5
          overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          dt:static dt:z-auto dt:translate-x-0 dt:shrink-0
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center justify-between mb-8 dt:mb-10 px-1">
            <div className="flex items-center gap-2.5">
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

            {/* Close button — drawer only */}
            <button
              type="button"
              onClick={closeMobileMenu}
              className="dt:hidden p-1 text-paper/70 hover:text-paper"
              aria-label="Close navigation"
            >
              <X size={22} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={closeMobileMenu}
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

        {/* Bottom user section */}
        <div className="px-1">
          <div className="flex items-center gap-2.5 mb-4 px-2 py-2 rounded-lg bg-paper/5 border border-paper/10">
            <div className="w-7 h-7 rounded-full bg-gold text-ink flex items-center justify-center text-xs font-semibold uppercase shrink-0">
              {user?.username?.[0]}
            </div>

            <p className="text-xs text-paper/70 font-mono truncate">
              {user?.username}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full text-xs px-3 py-2.5 rounded-md border border-paper/15 text-paper/60 hover:border-brick hover:text-brick transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main
          NOTE: no "overflow-y-auto" here any more — it stopped the mobile
          top bar from staying pinned while scrolling. */}
      <main className="flex-1 min-w-0">
        {/* Top bar: pinned below dt so the menu button is always reachable */}
        <div className="sticky top-0 z-30 bg-paper border-b border-slate-100 dt:border-0 dt:static flex items-center justify-between gap-3 px-4 sm:px-6 dt:px-8 py-3 sm:py-4 dt:pt-6 dt:pb-0">
          {/* Drawer menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="dt:hidden w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-ink hover:border-emerald transition-colors"
            aria-label="Open navigation"
          >
            <Menu size={21} />
          </button>

          {/* Desktop spacer */}
          <div className="hidden dt:block" />

          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationBell />
            <ProfileMenu user={user} onLogout={handleLogout} />
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  );
}


/* ============================================================
   PROFILE MENU
============================================================ */

function ProfileMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleClick);

    return () => document.removeEventListener("pointerdown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full border border-slate-200 bg-white hover:border-emerald transition-colors"
        aria-label="Account menu"
      >
        <div className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-emerald text-white flex items-center justify-center text-xs font-semibold uppercase shrink-0">
          {user?.username?.[0]}
        </div>

        <ChevronDown size={14} className="text-slate" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-2">
          <div className="px-4 py-2 border-b border-slate-100 space-y-1.5">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-slate shrink-0" />

              <p className="text-xs text-ink font-mono truncate">{user?.email}</p>
            </div>

            <span
              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                ROLE_BADGE_STYLES[user?.role] || ROLE_BADGE_STYLES.user
              }`}
            >
              {ROLE_LABELS[user?.role] || "User"}
            </span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 w-full text-left px-4 py-3 sm:py-2.5 text-sm font-semibold text-coral hover:bg-coral-soft transition-colors"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}