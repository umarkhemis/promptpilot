"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Settings, LogOut, User } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Header() {
  const { user, logout } = useStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6">
      <div className="md:hidden" /> {/* spacer for mobile hamburger */}
      <div className="hidden md:block">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Welcome back,{" "}
          <span className="font-medium text-slate-900 dark:text-white">
            {user?.email?.split("@")[0] ?? "there"}
          </span>
        </p>
      </div>

      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="w-8 h-8 bg-brand-100 dark:bg-brand-900/40 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[160px] truncate hidden sm:block">
            {user?.email ?? "Account"}
          </span>
          <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", open && "rotate-180")} />
        </button>

        {open && (
          <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg py-1 z-50">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400">Signed in as</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.email}</p>
            </div>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
