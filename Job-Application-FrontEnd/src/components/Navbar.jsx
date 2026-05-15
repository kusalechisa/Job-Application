import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logoImage from "../assets/Logo.png";

const applicantLinks = [
  { to: "/app-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/profile", label: "Applicant Profile", icon: User },
  { to: "/joblist", label: "Job List", icon: Briefcase },
  { to: "/appliedjobs", label: "Applied Jobs", icon: ClipboardList },
  { to: "/settings", label: "Account Settings", icon: Settings },
];

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/jobs", label: "Manage Jobs", icon: Briefcase },
  { to: "/admin/applications", label: "Applications", icon: FileText },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/stats", label: "Statistics", icon: BarChart3 },
  { to: "/settings", label: "Account Settings", icon: Settings },
];

export default function AppSidebar() {
  const location = useLocation();
  const { logout, user } = useAuth();
  const links = user?.role === "Admin" ? adminLinks : applicantLinks;

  return (
    <Sidebar className="bg-slate-950 text-slate-100 shadow-xl shadow-slate-900/30">
      <div className="flex flex-col items-center gap-3 border-b border-slate-800 px-4 py-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 p-2 shadow-inner shadow-slate-900/30">
          <img src={logoImage} alt="Logo" className="h-full w-full object-contain" />
        </div>
        <div className="flex flex-col items-center text-center leading-tight">
          <h1 className="text-sm font-semibold text-white">A-Mesob</h1>
          <p className="text-xs text-slate-400">Job Application System</p>
        </div>
      </div>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {links.map(({ to, label, icon: Icon }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === to || location.pathname.startsWith(`${to}/`)}
                    className="h-12 text-base font-bold"
                  >
                    <Link to={to}>
                      <Icon size={20} />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 pb-6 pt-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => logout()}
              className="text-red-400 hover:bg-red-600 hover:text-white"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}







