import { SidebarTrigger } from "@/components/ui/sidebar";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function TopBar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-14 flex items-center justify-between px-4 py-4 dark:bg-slate-950 dark:text-white border-b-4 border-slate-300 dark:border-slate-700 shadow-md">

      <SidebarTrigger />

      <h1 className="font-semibold">
        A-Mesob | Job Application
      </h1>

      <div className="flex items-center gap-3">

        <span className="text-sm text-slate-600 dark:text-slate-300">
          Role: Guest
        </span>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition"
        >
          {theme === "dark"? <Sun size={18} /> : <Moon size={18} />}
        </button>

      </div>

    </header>
  );
}