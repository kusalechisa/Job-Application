import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  ClipboardList,
  User,
  LogOut,
  Users,
  BarChart3,
  Settings,
  FileText,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import logoImage from "../assets/Logo.png";

const applicantLinks = [
  {
    to: "/app-dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    color: "text-blue-400",
  },
  {
    to: "/profile",
    label: "Applicant Profile",
    icon: User,
    color: "text-emerald-400",
  },
  {
    to: "/joblist",
    label: "Job List",
    icon: Briefcase,
    color: "text-purple-400",
  },
  {
    to: "/appliedjobs",
    label: "Applied Jobs",
    icon: ClipboardList,
    color: "text-amber-400",
  },
  {
    to: "/settings",
    label: "Account Settings",
    icon: Settings,
    color: "text-gray-400",
  },
];

const adminLinks = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    color: "text-blue-400",
  },
  {
    to: "/admin/jobs",
    label: "Manage Jobs",
    icon: Briefcase,
    color: "text-purple-400",
  },
  {
    to: "/admin/applications",
    label: "Applications",
    icon: FileText,
    color: "text-emerald-400",
  },
  { to: "/admin/users", label: "Users", icon: Users, color: "text-amber-400" },
  {
    to: "/admin/stats",
    label: "Statistics",
    icon: BarChart3,
    color: "text-rose-400",
  },
  {
    to: "/settings",
    label: "Account Settings",
    icon: Settings,
    color: "text-gray-400",
  },
];

export default function AppSidebar() {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { setOpenMobile, openMobile } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  const links = user?.role === "Admin" ? adminLinks : applicantLinks;

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle navigation click - close sidebar on mobile
  const handleNavigation = () => {
    if (isMobile && openMobile) {
      setOpenMobile(false);
    }
  };

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
    <Sidebar className="border-r border-slate-800 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 shadow-2xl shadow-black/50">
      {/* Header Section with Logo */}
      <div className="relative flex flex-col items-center gap-4 border-b border-slate-800/50 px-4 py-8">
        {/* Decorative gradient orb */}
        <div className="absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />

        {/* Logo Container */}
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-75 blur-md" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-2 shadow-inner shadow-slate-900/50">
            <img
              src={logoImage}
              alt="Logo"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {/* Brand Info */}
        <div className="flex flex-col items-center text-center">
          <h1 className="flex items-center gap-1 text-lg font-bold tracking-tight text-white">
            A-Mesob
            <Sparkles size={14} className="text-blue-400" />
          </h1>
          <p className="text-xs text-slate-400">Job Application System</p>
        </div>

        {/* User Info Badge (Mobile) */}
        {isMobile && user && (
          <div className="mt-2 flex items-center gap-2 rounded-full bg-slate-800/50 px-3 py-1.5 backdrop-blur-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-medium text-white">
              {getUserInitials()}
            </div>
            <span className="text-sm font-medium text-slate-200">
              {user.name?.split(" ")[0] || "User"}
            </span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <SidebarContent className="px-3 py-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1.5">
              {links.map(({ to, label, icon: Icon, color }) => {
                const isActive =
                  location.pathname === to ||
                  location.pathname.startsWith(`${to}/`);

                return (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      onClick={handleNavigation}
                      className={`
                        group relative h-11 w-full transition-all duration-200
                        ${
                          isActive
                            ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white shadow-lg shadow-blue-600/10"
                            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
                        }
                      `}
                    >
                      <Link to={to} className="flex items-center gap-3">
                        {/* Active Indicator */}
                        {isActive && (
                          <div className="absolute left-0 h-full w-1 rounded-r-full bg-gradient-to-b from-blue-500 to-purple-500" />
                        )}

                        {/* Icon with color */}
                        <Icon
                          size={20}
                          className={`transition-transform duration-200 group-hover:scale-110 ${
                            isActive ? color : "text-current"
                          }`}
                        />

                        {/* Label */}
                        <span className="text-sm font-medium">{label}</span>

                        {/* Chevron indicator (optional) */}
                        {!isActive && (
                          <ChevronRight
                            size={14}
                            className="ml-auto opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1"
                          />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with User Info and Logout */}
      <SidebarFooter className="border-t border-slate-800/50 px-4 py-4">
        {/* Desktop User Info */}

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                logout();
                if (isMobile && openMobile) setOpenMobile(false);
              }}
              className="group relative h-11 w-full justify-start gap-3 text-red-400 transition-all duration-200 hover:bg-red-600/10 hover:text-red-300"
            >
              <LogOut
                size={18}
                className="transition-transform duration-200 group-hover:scale-110"
              />
              <span className="text-sm font-medium">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Version Info */}
        <div className="mt-4 text-center">
          <p className="text-[10px] text-slate-500">Version 2.0.0</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
