
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/api";
import { useStore } from "@/lib/store";
import { Loader2, Mail, Lock, ArrowRight, Sparkles, Wand2, Cpu, LayoutGrid } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const FEATURES = [
  { icon: Wand2,     label: "Prompt Improver",    desc: "Turn vague ideas into precise prompts" },
  { icon: Cpu,       label: "Smart Tool Router",   desc: "Get matched to the perfect AI tool" },
  { icon: LayoutGrid,label: "Template Library",    desc: "Ready-made prompts for every use case" },
];

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setToken } = useStore();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await login(email, password);
      setToken(data.access_token);
      setUser({ id: data.user?.id ?? "", email: data.user?.email ?? email, mode: data.user?.mode ?? "student" });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#080810" }}>

      {/* ── Left panel — branding ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden">

        {/* Layered background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0d0820 0%, #080810 60%, #080d1a 100%)" }} />
          {/* Purple glow */}
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[150px]"
            style={{ background: "radial-gradient(ellipse, rgba(108,58,255,0.3) 0%, transparent 70%)" }} />
          {/* Cyan accent */}
          <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[130px]"
            style={{ background: "radial-gradient(ellipse, rgba(6,182,212,0.15) 0%, transparent 70%)" }} />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }} />
          {/* Noise */}
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <img src="/prompt_logo.jpg" alt="PromptPilot" className="w-9 h-9 rounded-full object-cover" />
          <span className="font-bold text-xl text-white">Promptify</span>
        </div>

        {/* Hero text */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-semibold"
            style={{ background: "rgba(108,58,255,0.15)", border: "1px solid rgba(108,58,255,0.3)", color: "#a78bfa" }}>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            AI-powered prompt engineering
          </div>

          <h1 className="font-extrabold text-white mb-4 leading-tight"
            style={{ fontSize: "clamp(2rem, 3.5vw, 2.75rem)", letterSpacing: "-0.03em" }}>
            Better prompts.<br />
            <span style={{ background: "linear-gradient(95deg, #a78bfa, #06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Better results.
            </span>
          </h1>
          <p className="text-base mb-10 leading-relaxed max-w-sm" style={{ color: "#64748b" }}>
            Transform your rough ideas into precise, powerful AI prompts in one click.
          </p>

          {/* Feature list */}
          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(108,58,255,0.12)", border: "1px solid rgba(108,58,255,0.22)" }}>
                  <Icon className="w-4 h-4" style={{ color: "#a78bfa" }} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs" style={{ color: "#475569" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom social proof */}
        <div className="relative flex items-center gap-3">
          <div className="flex -space-x-2">
            {[250, 270, 200, 290, 220].map((hue, i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[9px] font-bold text-white"
                style={{ background: `hsl(${hue}, 60%, 48%)`, borderColor: "#080810" }}>
                {["SM","JK","DL","AR","MG"][i]}
              </div>
            ))}
          </div>
          <span className="text-xs" style={{ color: "#334155" }}>
            Trusted by <span className="text-white font-semibold">500+</span> users
          </span>
        </div>
      </div>

      {/* ── Right panel — form ────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {/* Subtle right-panel background */}
        <div className="pointer-events-none absolute inset-0"
          style={{ background: "rgba(255,255,255,0.015)", borderLeft: "1px solid rgba(255,255,255,0.05)" }} />

        <div className="relative w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <img src="/prompt_logo.jpg" alt="PromptPilot" className="w-8 h-8 rounded-full object-cover" />
            <span className="font-bold text-lg text-white">Promptify</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1" style={{ letterSpacing: "-0.02em" }}>
              Welcome back
            </h2>
            <p className="text-sm" style={{ color: "#475569" }}>Sign in to your account to continue</p>
          </div>

          {/* Google OAuth */}
          <a
            href={`${API_URL}/api/auth/google`}
            className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 mb-6"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.09)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.18)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
            }}
          >
            {/* Google SVG icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </a>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            <span className="text-xs" style={{ color: "#334155" }}>or sign in with email</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#475569" }}>
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#334155" }} />
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    color: "#e2e8f0",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(108,58,255,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(108,58,255,0.1)"; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#475569" }}>
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs transition-colors" style={{ color: "#6C3AFF" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#a78bfa")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#6C3AFF")}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#334155" }} />
                <input
                  type="password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    color: "#e2e8f0",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(108,58,255,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(108,58,255,0.1)"; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 mt-2"
              style={{
                background: loading ? "#6C3AFF" : "linear-gradient(135deg, #6C3AFF, #8B5CF6)",
                boxShadow: loading ? "none" : "0 0 24px rgba(108,58,255,0.4)",
                opacity: loading ? 0.75 : 1,
              }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.boxShadow = "0 0 36px rgba(108,58,255,0.6)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = loading ? "none" : "0 0 24px rgba(108,58,255,0.4)"; }}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in…</> : <>Sign in<ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center mt-6 text-sm" style={{ color: "#334155" }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold transition-colors" style={{ color: "#a78bfa" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#c4b5fd")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#a78bfa")}>
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}