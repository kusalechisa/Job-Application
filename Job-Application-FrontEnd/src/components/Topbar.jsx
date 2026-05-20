import { SidebarTrigger } from "@/components/ui/sidebar";
import { Menu, Moon, Sun, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Get user initials for avatar
  const getUserInitials = () => {
    const name = user?.name || "User";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-950/95 dark:supports-[backdrop-filter]:bg-slate-950/60">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
            {/* Left Section - Logo & Brand */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <SidebarTrigger className="lg:hidden" />
              <div className="hidden lg:block">
                <SidebarTrigger />
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Logo Mark */}
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg sm:h-9 sm:w-9 lg:h-10 lg:w-10">
                  <span className="text-sm font-bold sm:text-base">A</span>
                </div>

                {/* Brand Name */}
                <div>
                  <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg lg:text-xl">
                    A-Mesob
                    <span className="hidden sm:inline"> | Job Application</span>
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 sm:hidden">
                    Job App
                  </p>
                </div>
              </div>
            </div>

            {/* Right Section - User Info & Actions */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-all duration-200 hover:scale-105 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800 sm:h-10 sm:w-10"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun size={isMobile ? 16 : 18} />
                ) : (
                  <Moon size={isMobile ? 16 : 18} />
                )}
              </button>

              {/* User Section - Desktop */}
              <div className="hidden md:block">
                <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900 lg:gap-4 lg:px-4 lg:py-2">
                  {/* User Avatar */}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-md lg:h-9 lg:w-9">
                    <span className="text-xs font-medium lg:text-sm">
                      {getUserInitials()}
                    </span>
                  </div>

                  {/* User Info */}
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white lg:text-base">
                      {user?.name || "Guest User"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 lg:text-sm">
                      {user?.role ? `Role: ${user.role}` : "Not signed in"}
                    </p>
                  </div>
                </div>
              </div>

              {/* User Section - Mobile Dropdown */}
              <div className="relative md:hidden">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                  aria-label="User menu"
                >
                  <User size={16} />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
                      <div className="border-b border-slate-100 p-3 dark:border-slate-800">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {user?.name || "Guest User"}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {user?.role || "No role assigned"}
                        </p>
                      </div>
                      <div className="p-2">
                        <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                          <User size={14} />
                          Profile
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation (Optional) */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:hidden">
          <div className="flex h-16 items-center justify-around px-4">
            <button className="flex flex-col items-center gap-1 text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
              <span className="text-xs font-medium">Home</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
              <span className="text-xs font-medium">Applications</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
              <span className="text-xs font-medium">Profile</span>
            </button>
          </div>
        </nav>
      )}
    </>
  );
}
