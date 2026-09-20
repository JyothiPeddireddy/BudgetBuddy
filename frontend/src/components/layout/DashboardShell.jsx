import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  PiggyBank,
  Target,
  BarChart3,
  FileText,
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  User,
} from "lucide-react";

export default function DashboardShell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const location = useLocation();

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Close mobile sidebar whenever the route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    {
      label: "Overview",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Accounts",
      path: "/accounts",
      icon: Wallet,
    },
    {
      label: "Income",
      path: "/income",
      icon: ArrowUpCircle,
    },
    {
      label: "Expenses",
      path: "/expenses",
      icon: ArrowDownCircle,
    },
    {
      label: "Budgets",
      path: "/budgets",
      icon: PiggyBank,
    },
    {
      label: "Goals",
      path: "/goals",
      icon: Target,
    },
    {
      label: "Analytics",
      path: "/analytics",
      icon: BarChart3,
    },
    {
      label: "Reports",
      path: "/reports",
      icon: FileText,
    },
    {
      label: "Notifications",
      path: "/notifications",
      icon: Bell,
    },
    {
      label: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-paper text-ink flex">

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-64 max-w-[85vw]
          lg:w-60
          bg-ink
          flex flex-col justify-between gap-6
          py-6 lg:py-8 px-5
          overflow-y-auto

          transform transition-transform duration-300 ease-in-out

          lg:static
          lg:z-auto
          lg:translate-x-0

          ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Sidebar Top */}
        <div>

          {/* Logo + Mobile Close */}
          <div className="flex items-center justify-between mb-8">
            <div className="text-xl font-bold text-paper">
              Budget Buddy
            </div>

            {/* Close button - mobile/tablet only */}
            <button
              type="button"
              onClick={closeMobileMenu}
              className="
                lg:hidden
                p-1
                text-paper/70
                hover:text-paper
                transition-colors
              "
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
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `
                    flex items-center gap-3
                    px-3 py-2.5
                    rounded-lg
                    text-sm font-medium
                    transition-colors

                    ${
                      isActive
                        ? "bg-emerald text-white"
                        : "text-paper/70 hover:bg-white/10 hover:text-paper"
                    }
                    `
                  }
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom */}
        <div className="space-y-2">

          <NavLink
            to="/profile"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `
              flex items-center gap-3
              px-3 py-2.5
              rounded-lg
              text-sm font-medium
              transition-colors

              ${
                isActive
                  ? "bg-emerald text-white"
                  : "text-paper/70 hover:bg-white/10 hover:text-paper"
              }
              `
            }
          >
            <User size={19} />
            <span>Profile</span>
          </NavLink>

          <button
            type="button"
            className="
              w-full
              flex items-center gap-3
              px-3 py-2.5
              rounded-lg
              text-sm font-medium
              text-paper/70
              hover:bg-white/10
              hover:text-paper
              transition-colors
            "
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>

        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 min-w-0">

        {/* Top Bar */}
        <div
          className="
            sticky top-0 z-30
            bg-paper
            border-b border-slate-100
            lg:border-0
            lg:static

            flex items-center justify-between
            gap-3

            px-4 sm:px-6 lg:px-8
            py-3 sm:py-4
            lg:pt-6 lg:pb-0
          "
        >

          {/* Hamburger - mobile/tablet only */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="
              lg:hidden
              w-10 h-10
              rounded-lg
              border border-slate-200
              bg-white
              flex items-center justify-center
              text-ink
              hover:border-emerald
              transition-colors
            "
            aria-label="Open navigation"
          >
            <Menu size={21} />
          </button>

          {/* Desktop spacer */}
          <div className="hidden lg:block" />

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Add your existing topbar content here */}
          </div>
        </div>

        {/* Page Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
}