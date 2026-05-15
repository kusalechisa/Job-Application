import { Outlet } from "react-router-dom";
import TopBar from "./Topbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./Navbar";

export default function Mainlayout() {
  return (
    <SidebarProvider>

      <div className="flex w-full p-2 h-screen">

        {/* Sidebar */}
        <AppSidebar />

        {/* Main content */}
        <div className="flex flex-col flex-1 w-full">

          <TopBar />

          <main className="flex-1 w-full mt-2 mr-2 bg-slate-200 dark:bg-slate-900 rounded-md">
            <Outlet />
          </main>

        </div>

      </div>

    </SidebarProvider>
  );
}