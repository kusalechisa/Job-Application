import { Bell, Search, User } from "lucide-react";
import { useState } from "react";

export default function AdminNavbar() {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, message: "New application received for Senior Developer", time: "5 min ago", unread: true },
    { id: 2, message: "Interview scheduled for John Doe", time: "1 hour ago", unread: true },
    { id: 3, message: "Job posting expired: Frontend Developer", time: "2 hours ago", unread: false },
    { id: 4, message: "System maintenance scheduled for tonight", time: "1 day ago", unread: false },
  ];

  return (
    <header className="fixed left-64 right-0 top-0 z-30 h-16 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-full items-center justify-between px-6">
        {/* Search */}
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search applications, jobs, users..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <Bell className="h-5 w-5" />
              {notifications.some((n) => n.unread) && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`border-b border-slate-100 p-4 last:border-0 dark:border-slate-800 ${
                        notification.unread ? "bg-sky-50 dark:bg-sky-950" : ""
                      }`}
                    >
                      <p className="text-sm text-slate-900 dark:text-slate-100">{notification.message}</p>
                      <p className="mt-1 text-xs text-slate-500">{notification.time}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-200 p-3 dark:border-slate-800">
                  <button className="w-full rounded-lg py-2 text-sm font-medium text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-950">
                    Mark all as read
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-white">
              <User className="h-4 w-4" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Admin</p>
              <p className="text-xs text-slate-500">System Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
