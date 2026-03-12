"use client";

import { useStore } from "@/lib/store";
import { Megaphone, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export function ModeSwitcher() {
  const { mode, setMode } = useStore();

  return (
    <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
      <button
        onClick={() => setMode("marketing")}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
          mode === "marketing"
            ? "bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        )}
      >
        <Megaphone className="w-4 h-4" />
        Marketing
      </button>
      <button
        onClick={() => setMode("student")}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
          mode === "student"
            ? "bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        )}
      >
        <GraduationCap className="w-4 h-4" />
        Student
      </button>
    </div>
  );
}
