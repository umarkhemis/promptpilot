
"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { ModeSwitcher } from "@/components/mode-switcher";
import {
  Save, CheckCircle2, User, Loader2, Settings,
  Shield, Bell, Trash2, LogOut, Sun, Moon,
} from "lucide-react";
import { useRouter } from "next/navigation";

function useThemeVars() {
  const [dark, setDark] = useState(true);
  useEffect(() => { setDark(localStorage.getItem("pp-theme") !== "light"); }, []);
  function toggleTheme() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("pp-theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  }
  return {
    dark, toggleTheme,
    bg:      dark ? "#080810"                : "#f8fafc",
    surface: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
    card:    dark ? "rgba(255,255,255,0.04)" : "#ffffff",
    border:  dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    text:    dark ? "#e2e8f0"               : "#0f172a",
    muted:   dark ? "#475569"               : "#64748b",
    input:   dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
  };
}

function Section({ title, description, icon: Icon, accent = "#6C3AFF", children }: {
  title: string; description?: string; icon: React.ElementType;
  accent?: string; children: React.ReactNode;
}) {
  const { card, border, text, muted } = useThemeVars();
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: card, border: `1px solid ${border}` }}>
      <div className="flex items-start gap-3 px-6 py-5" style={{ borderBottom: `1px solid ${border}` }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
          <Icon className="w-4 h-4" style={{ color: accent }} strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="font-bold text-sm" style={{ color: text }}>{title}</h2>
          {description && <p className="text-xs mt-0.5" style={{ color: muted }}>{description}</p>}
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { dark, toggleTheme, bg, border, text, muted, input } = useThemeVars();
  const { user, mode, setToken, setUser } = useStore();
  const router = useRouter();

  const [context, setContext] = useState("");
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null); setSaved(false);
    try {
      await new Promise(res => setTimeout(res, 600));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    setToken(null); setUser(null);
    router.push("/login");
  }

  const contextPlaceholder = mode === "marketing"
    ? "e.g. Our brand voice is approachable and energetic. We sell premium organic coffee to health-conscious millennials."
    : "e.g. I'm a junior studying Environmental Science. I prefer academic tone with APA citations.";

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: bg }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(108,58,255,0.15)", border: "1px solid rgba(108,58,255,0.25)" }}>
            <Settings className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />
          </div>
          <h1 className="text-xl font-bold" style={{ color: text, letterSpacing: "-0.02em" }}>Settings</h1>
        </div>

        {/* Profile */}
        <Section title="Profile" description="Your account information." icon={User} accent="#6C3AFF">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #6C3AFF, #06B6D4)" }}>
              {user?.email?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: text }}>
                {user?.email?.split("@")[0] ?? "User"}
              </p>
              <p className="text-xs" style={{ color: muted }}>{user?.email ?? ""}</p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: muted }}>
              Email address
            </label>
            <input type="email" value={user?.email ?? ""} disabled
              className="w-full px-4 py-3 rounded-xl text-sm cursor-not-allowed"
              style={{ background: input, border: `1px solid ${border}`, color: muted }}
            />
            <p className="mt-1.5 text-xs" style={{ color: muted }}>Email cannot be changed.</p>
          </div>
        </Section>

        {/* Appearance */}
        <Section title="Appearance" description="Customize how PromptPilot looks." icon={Sun} accent="#f59e0b">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold" style={{ color: text }}>Theme</p>
              <p className="text-xs mt-0.5" style={{ color: muted }}>
                Currently using {dark ? "dark" : "light"} mode
              </p>
            </div>
            <button onClick={toggleTheme}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: dark ? "rgba(245,158,11,0.1)" : "rgba(108,58,255,0.1)",
                border: `1px solid ${dark ? "rgba(245,158,11,0.25)" : "rgba(108,58,255,0.25)"}`,
                color: dark ? "#f59e0b" : "#a78bfa",
              }}>
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              Switch to {dark ? "light" : "dark"} mode
            </button>
          </div>
        </Section>

        {/* Mode */}
        <Section title="Prompt Mode" description="Choose your primary use case to tailor prompt improvements." icon={CheckCircle2} accent="#06B6D4">
          <ModeSwitcher />
          <p className="mt-3 text-xs" style={{ color: muted }}>
            {mode === "marketing"
              ? "Marketing mode optimizes prompts for ads, emails, social media, and brand content."
              : "Student mode optimizes prompts for essays, research, summaries, and academic tasks."}
          </p>
        </Section>

        {/* Context Profile */}
        <form onSubmit={handleSave}>
          <Section title="Context Profile" description="Background info included with every prompt you improve." icon={Shield} accent="#34d399">
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                {error}
              </div>
            )}
            <textarea value={context} onChange={(e) => setContext(e.target.value)}
              placeholder={contextPlaceholder} rows={4}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none transition-all duration-200"
              style={{ background: input, border: `1px solid ${border}`, color: text }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(52,211,153,0.45)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(52,211,153,0.08)"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = border; e.currentTarget.style.boxShadow = "none"; }}
            />
            <div className="flex justify-end mt-4">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60"
                style={{
                  background: saved ? "linear-gradient(135deg, #059669, #34d399)" : "linear-gradient(135deg, #6C3AFF, #8B5CF6)",
                  boxShadow: saved ? "0 4px 16px rgba(52,211,153,0.3)" : "0 4px 16px rgba(108,58,255,0.3)",
                }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" />
                  : saved  ? <CheckCircle2 className="w-4 h-4" />
                  : <Save className="w-4 h-4" />}
                {saving ? "Saving…" : saved ? "Saved!" : "Save settings"}
              </button>
            </div>
          </Section>
        </form>

        {/* Notifications placeholder */}
        <Section title="Notifications" description="Manage your notification preferences." icon={Bell} accent="#a78bfa">
          <div className="space-y-3">
            {[
              { label: "Product updates",    desc: "New features and improvements" },
              { label: "Usage alerts",       desc: "When you're close to your monthly limit" },
              { label: "Tips & tutorials",   desc: "Learn to get more from PromptPilot" },
            ].map(({ label, desc }) => (
              <div key={label} className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium" style={{ color: text }}>{label}</p>
                  <p className="text-xs" style={{ color: muted }}>{desc}</p>
                </div>
                <div className="w-10 h-6 rounded-full flex items-center px-1 cursor-pointer transition-all duration-200"
                  style={{ background: "rgba(108,58,255,0.2)", border: "1px solid rgba(108,58,255,0.3)" }}>
                  <div className="w-4 h-4 rounded-full" style={{ background: "#a78bfa", marginLeft: "auto" }} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Danger zone */}
        <Section title="Account" description="Manage your account and session." icon={Trash2} accent="#f87171">
          <div className="space-y-3">
            <button onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.14)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; }}
            >
              <LogOut className="w-4 h-4" />
              Sign out of this account
            </button>
            <button
              className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.12)", color: "#f87171", opacity: 0.6 }}
              disabled>
              <Trash2 className="w-4 h-4" />
              Delete account (contact support)
            </button>
          </div>
        </Section>

        <p className="text-center text-xs pb-4" style={{ color: muted }}>PromptPilot v0.1.0</p>
      </div>
    </div>
  );
}