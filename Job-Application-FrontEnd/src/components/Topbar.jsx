import { SidebarTrigger } from "@/components/ui/sidebar";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function TopBar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="mb-4 flex h-16 items-center justify-between rounded-[1.5rem] border border-slate-200 bg-white px-5 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <div>
          <h1 className="text-lg font-semibold">A-Mesob | Job Application</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Applicant dashboard and vacancy management</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600 dark:text-slate-400">Role: Guest</span>
        <button
          onClick={toggleTheme}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}