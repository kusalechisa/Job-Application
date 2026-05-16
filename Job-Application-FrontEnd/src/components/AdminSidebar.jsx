import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Briefcase, Users, FileText, BarChart3, Settings, LogOut, TrendingUp } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: Briefcase, label: "Jobs", path: "/admin/jobs" },
  { icon: FileText, label: "Applications", path: "/admin/applications" },
  { icon: Users, label: "Users", path: "/admin/users" },
  { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
  { icon: TrendingUp, label: "Statistics", path: "/admin/statistics" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function AdminSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="border-b border-slate-200 p-6 dark:border-slate-800">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Job Portal</h1>
          <p className="text-sm text-slate-500">Admin Panel</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                      isActive
                        ? "bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400"
                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="mb-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950 dark:hover:text-rose-400"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
