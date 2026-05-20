import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const popupTypes = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-emerald-500",
    borderColor: "border-emerald-500",
    iconColor: "text-emerald-500",
  },
  error: {
    icon: AlertCircle,
    bgColor: "bg-rose-500",
    borderColor: "border-rose-500",
    iconColor: "text-rose-500",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-500",
    borderColor: "border-blue-500",
    iconColor: "text-blue-500",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-amber-500",
    borderColor: "border-amber-500",
    iconColor: "text-amber-500",
  },
};

let popupQueue = [];
let listeners = [];

export const showPopup = (message, type = "info", duration = 4000) => {
  const id = Date.now() + Math.random();
  const popup = { id, message, type, duration };
  popupQueue.push(popup);
  listeners.forEach((listener) => listener([...popupQueue]));
  
  if (duration > 0) {
    setTimeout(() => {
      hidePopup(id);
    }, duration);
  }
  
  return id;
};

export const hidePopup = (id) => {
  popupQueue = popupQueue.filter((p) => p.id !== id);
  listeners.forEach((listener) => listener([...popupQueue]));
};

export default function FloatingPopup() {
  const [popups, setPopups] = useState([]);

  useEffect(() => {
    const listener = (newPopups) => setPopups(newPopups);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      {popups.map((popup) => {
        const config = popupTypes[popup.type] || popupTypes.info;
        const Icon = config.icon;

        return (
          <div
            key={popup.id}
            className={cn(
              "pointer-events-auto min-w-[320px] max-w-md bg-white dark:bg-slate-900 rounded-lg shadow-2xl border-l-4",
              config.borderColor,
              "animate-in slide-in-from-right-full duration-300 ease-out"
            )}
          >
            <div className="flex items-start gap-3 p-4">
              <div className={cn("flex-shrink-0", config.iconColor)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {popup.message}
                </p>
              </div>
              <button
                onClick={() => hidePopup(popup.id)}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
