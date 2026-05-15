import { Outlet } from "react-router-dom";
import TopBar from "./Topbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./Navbar";

export default function Mainlayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <AppSidebar />

        <div className="flex flex-col flex-1 w-full">
          <TopBar />

          <main className="flex-1 w-full mt-2 p-4 bg-slate-50 dark:bg-slate-900/90 rounded-[1.5rem] shadow-inner shadow-slate-300/20 transition-colors duration-300">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}