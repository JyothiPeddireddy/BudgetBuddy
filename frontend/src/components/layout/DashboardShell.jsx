import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { LayoutDashboard, Receipt, Wallet, PiggyBank, LogOut, Landmark, Target } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../notifications/NotificationBell";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Overview", end: true, icon: LayoutDashboard },
  { to: "/dashboard/accounts", label: "Accounts", icon: Landmark },
  { to: "/dashboard/expenses", label: "Expenses", icon: Receipt },
  { to: "/dashboard/income", label: "Income", icon: Wallet },
  { to: "/dashboard/budgets", label: "Budgets", icon: PiggyBank },
  { to: "/dashboard/goals", label: "Goals", icon: Target },
];

export default function DashboardShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-paper">
      <aside className="w-60 bg-ink flex flex-col justify-between py-8 px-5">
        <div>
          <div className="flex items-baseline gap-1.5 mb-10 px-1">
            <span className="font-display italic text-lg text-paper">Budget</span>
            <span className="font-display text-lg text-paper">Buddy</span>
          </div>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
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
        <div className="flex justify-end px-8 pt-6">
          <NotificationBell />
        </div>
        <Outlet />
      </main>
    </div>
  );
}