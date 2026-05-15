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
  LogIn,
  UserPlus,
  ShieldCheck,
  User,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logoImage from "../assets/Logo.png";

export default function AppSidebar() {
  const location = useLocation();
  const { logout } = useAuth()
  return (
    <Sidebar className="bg-slate-950 text-slate-100 shadow-xl shadow-slate-900/30">
      <div className="flex flex-col items-center gap-3 px-4 py-6 border-b border-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 p-2 flex items-center justify-center shadow-inner shadow-slate-900/30">
          <img
            src={logoImage}
            alt="Logo"
            className="w-full h-full object-contain"
          />
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

              {/* LOGIN */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/app-dashboard"} className="h-12 text-base font-bold">
                  <Link to="/app-dashboard">
                    <LogIn size={20} />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* REGISTER */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/register"} className="h-12 text-base font-bold">
                  <Link to="/register">
                    <UserPlus size={20} />
                    <span>Applicant Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* ADMIN */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/joblist"} className="h-12 text-base font-bold">
                  <Link to="/joblist">
                    <ShieldCheck size={20} />
                    <span>Job List</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* EMPLOYEE */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/appliedjobs"} className="h-12 text-base font-bold">
                  <Link to="/appliedjobs">
                    <User size={20} />
                    <span>Your Applied Job Status</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

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