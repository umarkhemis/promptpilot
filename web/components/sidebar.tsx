
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, History, Settings,
  ChevronLeft, ChevronRight, Wand2, LogOut, Sun, Moon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard",  label: "Workspace",  icon: Wand2          },
  { href: "/templates",  label: "Templates",  icon: FileText        },
  { href: "/history",    label: "History",    icon: History         },
  { href: "/settings",   label: "Settings",   icon: Settings        },
];

// ─── Theme hook (shared with dashboard) ──────────────────────────────────────
function useTheme() {
  // Read from DOM immediately — no flicker
  const [dark, setDark] = useState(
    () => document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("pp-theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  }

  return { dark, toggle };
}

export function Sidebar() {
  const pathname    = usePathname();
  const router      = useRouter();
  const { dark, toggle: toggleTheme } = useTheme();
  const { user, setToken, setUser }   = useStore();

  // Collapsed state — persisted
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("pp-sidebar-collapsed");
    if (stored) setCollapsed(stored === "true");
  }, []);

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("pp-sidebar-collapsed", String(next));
  }

  function handleLogout() {
    setToken(null);
    setUser(null);
    router.push("/login");
  }

  // Theme-aware values
  const bg         = dark ? "#0c0c18"                     : "#ffffff";
  const borderCol  = dark ? "rgba(255,255,255,0.07)"      : "rgba(0,0,0,0.08)";
  const textMain   = dark ? "#e2e8f0"                     : "#0f172a";
  const textMuted  = dark ? "#475569"                     : "#64748b";
  const hoverBg    = dark ? "rgba(255,255,255,0.05)"      : "rgba(0,0,0,0.04)";
  const activeBg   = dark ? "rgba(108,58,255,0.15)"       : "rgba(108,58,255,0.08)";
  const activeText = "#a78bfa";
  const activeBdr  = dark ? "rgba(108,58,255,0.35)"       : "rgba(108,58,255,0.25)";

  const w = collapsed ? "72px" : "240px";

  return (
    <>
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className="fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out"
        style={{
          width: w,
          background: bg,
          borderRight: `1px solid ${borderCol}`,
          boxShadow: dark ? "4px 0 24px rgba(0,0,0,0.3)" : "4px 0 16px rgba(0,0,0,0.06)",
        }}
      >
        {/* ── Logo ──────────────────────────────────────────────────────── */}
        <div
          className="h-14 flex items-center px-4 flex-shrink-0 relative"
          style={{ borderBottom: `1px solid ${borderCol}` }}
        >
          <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
            <img
              src="/prompt_logo.jpg"
              alt="PromptPilot"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            {!collapsed && (
              <span
                className="font-bold text-base truncate transition-all duration-200"
                style={{ color: textMain }}
              >
                Promptify
              </span>
            )}
          </Link>

          {/* Collapse toggle */}
          <button
            onClick={toggleCollapse}
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 z-50"
            style={{
              background: bg,
              border: `1px solid ${borderCol}`,
              color: textMuted,
              boxShadow: dark ? "0 2px 8px rgba(0,0,0,0.4)" : "0 2px 8px rgba(0,0,0,0.1)",
            }}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed
              ? <ChevronRight className="w-3.5 h-3.5" />
              : <ChevronLeft  className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* ── Nav links ─────────────────────────────────────────────────── */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative"
                style={{
                  background:   active ? activeBg   : "transparent",
                  color:        active ? activeText : textMuted,
                  border:       active ? `1px solid ${activeBdr}` : "1px solid transparent",
                  justifyContent: collapsed ? "center" : "flex-start",
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = hoverBg;
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <Icon
                  className="flex-shrink-0"
                  style={{
                    width: "1.1rem", height: "1.1rem",
                    color: active ? activeText : textMuted,
                  }}
                  strokeWidth={active ? 2 : 1.75}
                />
                {!collapsed && (
                  <span className="truncate transition-all duration-200">{label}</span>
                )}

                {/* Tooltip for collapsed mode */}
                {collapsed && (
                  <div
                    className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50"
                    style={{
                      background: dark ? "#1e1e30" : "#fff",
                      color: textMain,
                      border: `1px solid ${borderCol}`,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                    }}
                  >
                    {label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Bottom section ─────────────────────────────────────────────── */}
        <div
          className="flex-shrink-0 px-3 py-3 space-y-1"
          style={{ borderTop: `1px solid ${borderCol}` }}
        >
          {/* User info */}
          {!collapsed && user?.email && (
            <div
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1"
              style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #6C3AFF, #06B6D4)" }}
              >
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: textMain }}>
                  {user.email.split("@")[0]}
                </p>
                <p className="text-[10px] truncate" style={{ color: textMuted }}>
                  {user.email}
                </p>
              </div>
            </div>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              color: textMuted,
              justifyContent: collapsed ? "center" : "flex-start",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = hoverBg; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            title={dark ? "Light mode" : "Dark mode"}
          >
            {dark
              ? <Sun  className="w-4 h-4 flex-shrink-0" />
              : <Moon className="w-4 h-4 flex-shrink-0" />}
            {!collapsed && <span>{dark ? "Light mode" : "Dark mode"}</span>}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              color: textMuted,
              justifyContent: collapsed ? "center" : "flex-start",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)";
              (e.currentTarget as HTMLElement).style.color = "#f87171";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = textMuted;
            }}
            title="Log out"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Log out</span>}
          </button>

          {/* Version */}
          {!collapsed && (
            <p className="text-center text-[10px] pt-1" style={{ color: dark ? "#1e293b" : "#cbd5e1" }}>
              v0.1.0
            </p>
          )}
        </div>
      </aside>

      {/* ── Push content right ─────────────────────────────────────────── */}
      
      <div
        className="flex-shrink-0 transition-all duration-300"
        style={{ width: w }}
        aria-hidden
      />
    </>
  );
}