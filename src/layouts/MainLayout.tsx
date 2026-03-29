import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Users,
  UserCog,
  FileSpreadsheet,
  Receipt,
  FileBarChart,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Stethoscope,
  ChevronLeft,
  UserCircle,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { useThemeStore } from "@/stores/theme";
import { UserRole, UserRoleLabel } from "@/shared/types";
import { RoleGuard } from "@/shared/ui";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  minRole?: UserRole;
}

const navItems: NavItem[] = [
  { to: "/", label: "Главная", icon: <LayoutDashboard className="w-5 h-5" /> },
  {
    to: "/departments",
    label: "Отделения",
    icon: <Building2 className="w-5 h-5" />,
    minRole: UserRole.ACCOUNTANT,
  },
  {
    to: "/positions",
    label: "Должности",
    icon: <Briefcase className="w-5 h-5" />,
    minRole: UserRole.ACCOUNTANT,
  },
  {
    to: "/employees",
    label: "Сотрудники",
    icon: <Users className="w-5 h-5" />,
    minRole: UserRole.ACCOUNTANT,
  },
  {
    to: "/payroll-items",
    label: "Статьи",
    icon: <Receipt className="w-5 h-5" />,
    minRole: UserRole.ACCOUNTANT,
  },
  {
    to: "/payroll-sheets",
    label: "Расчётные листы",
    icon: <FileSpreadsheet className="w-5 h-5" />,
    minRole: UserRole.ACCOUNTANT,
  },
  {
    to: "/reports",
    label: "Отчёты",
    icon: <FileBarChart className="w-5 h-5" />,
  },
  {
    to: "/users",
    label: "Пользователи",
    icon: <UserCog className="w-5 h-5" />,
    minRole: UserRole.ADMINISTRATOR,
  },
];

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const { isDark, toggle: toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredItems = navItems.filter((item) => {
    if (item.minRole === undefined) return true;
    return (user?.role ?? -1) >= item.minRole;
  });

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 h-screen z-50 flex flex-col bg-card-light dark:bg-card-dark border-r border-border-light dark:border-border-dark transition-all duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "w-[72px]" : "w-64"}`}
      >
        {/* Logo */}
        <div
          className={`flex items-center gap-3 px-4 h-16 border-b border-border-light dark:border-border-dark flex-shrink-0 ${collapsed ? "justify-center" : ""}`}
        >
          <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-lg">MedPayroll</span>
          )}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto btn-ghost btn-icon btn-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {filteredItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${collapsed ? "justify-center" : ""} ${
                  isActive
                    ? "bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div
          className={`border-t border-border-light dark:border-border-dark p-3 space-y-2 flex-shrink-0 ${collapsed ? "items-center" : ""}`}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex btn-ghost btn-sm w-full justify-center"
          >
            <ChevronLeft
              className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
            />
          </button>

          {!collapsed && user && (
            <button
              onClick={() => {
                navigate("/profile");
                setSidebarOpen(false);
              }}
              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <p className="text-sm font-medium truncate">{user.username}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {UserRoleLabel[user.role]}
              </p>
            </button>
          )}

          <div className={`flex ${collapsed ? "flex-col" : ""} gap-1`}>
            {collapsed && (
              <button
                onClick={() => {
                  navigate("/profile");
                  setSidebarOpen(false);
                }}
                className="btn-ghost btn-icon btn-sm flex-1"
                title="Профиль"
              >
                <UserCircle className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={toggleTheme}
              className="btn-ghost btn-icon btn-sm flex-1"
              title={isDark ? "Светлая тема" : "Тёмная тема"}
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={handleLogout}
              className="btn-ghost btn-icon btn-sm flex-1 text-red-500"
              title="Выйти"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden sticky top-0 z-30 h-14 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-xl border-b border-border-light dark:border-border-dark flex items-center px-4 gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="btn-ghost btn-icon btn-sm"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display font-bold">MedPayroll</span>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
