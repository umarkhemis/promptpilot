
"use client";


import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

const STATS = [
  { value: "500+", label: "Active users" },
  { value: "10x", label: "Faster prompting" },
  { value: "98%", label: "Satisfaction rate" },
];

export function FinalCta() {
  return (
    <section
      className="relative py-32 px-4 overflow-hidden"
      style={{ background: "#080810" }}
    >
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0">
        {/* Central purple pool */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full blur-[160px]"
          style={{ background: "radial-gradient(ellipse, rgba(108,58,255,0.28) 0%, transparent 65%)" }}
        />
        {/* Cyan accent left */}
        <div
          className="absolute top-1/2 left-0 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[130px]"
          style={{ background: "radial-gradient(ellipse, rgba(6,182,212,0.1) 0%, transparent 70%)" }}
        />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Noise */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[
          { size: 6, top: "15%", left: "10%", color: "rgba(108,58,255,0.5)", dur: "3.5s", delay: "0s" },
          { size: 4, top: "25%", left: "82%", color: "rgba(6,182,212,0.45)", dur: "4.2s", delay: "0.5s" },
          { size: 7, top: "62%", left: "14%", color: "rgba(139,92,246,0.35)", dur: "5s", delay: "1s" },
          { size: 4, top: "72%", left: "76%", color: "rgba(6,182,212,0.35)", dur: "3.8s", delay: "1.5s" },
          { size: 5, top: "38%", left: "91%", color: "rgba(108,58,255,0.55)", dur: "4.5s", delay: "0.8s" },
          { size: 3, top: "80%", left: "42%", color: "rgba(255,255,255,0.15)", dur: "6s", delay: "2s" },
          { size: 5, top: "18%", left: "52%", color: "rgba(245,158,11,0.25)", dur: "4s", delay: "0.3s" },
          { size: 4, top: "50%", left: "4%", color: "rgba(139,92,246,0.4)", dur: "5.5s", delay: "1.2s" },
        ].map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              top: p.top,
              left: p.left,
              background: p.color,
              animation: `floatParticle ${p.dur} ease-in-out infinite`,
              animationDelay: p.delay,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-3xl mx-auto text-center">

        {/* Star rating */}
        <div className="inline-flex items-center gap-1.5 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-4 h-4 text-amber-400" fill="currentColor" />
          ))}
          <span className="text-sm ml-1" style={{ color: "#475569" }}>
            Loved by 500+ users
          </span>
        </div>

        {/* Headline */}
        <h2
          className="font-extrabold text-white mb-6 leading-tight"
          style={{ fontSize: "clamp(2.2rem, 6vw, 3.75rem)", letterSpacing: "-0.03em" }}
        >
          Ready to prompt{" "}
          <span
            style={{
              background: "linear-gradient(95deg, #a78bfa 0%, #06B6D4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            like a pro?
          </span>
        </h2>

        {/* Sub */}
        <p className="text-lg mb-10 max-w-xl mx-auto leading-relaxed" style={{ color: "#64748b" }}>
          Join marketers, students, and creators getting better AI results — in one click.
        </p>

        {/* CTA button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link
            href="/register"
            className="group inline-flex items-center gap-3 font-bold px-10 py-4 rounded-xl text-lg text-white transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #6C3AFF 0%, #8B5CF6 100%)",
              boxShadow: "0 0 40px rgba(108,58,255,0.55), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 64px rgba(108,58,255,0.75), inset 0 1px 0 rgba(255,255,255,0.2)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px) scale(1.02)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 40px rgba(108,58,255,0.55), inset 0 1px 0 rgba(255,255,255,0.15)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0) scale(1)";
            }}
          >
            Get started free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>

        {/* Trust signals */}
        <p className="text-sm mb-16" style={{ color: "#334155" }}>
          No credit card required &nbsp;·&nbsp; Free forever plan &nbsp;·&nbsp; Cancel anytime
        </p>

        {/* Stats row */}
        <div
          className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.04)" }}
        >
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="py-6 px-4"
              style={{
                borderRight: i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}
            >
              <p
                className="text-2xl sm:text-3xl font-extrabold text-white mb-1"
                style={{ letterSpacing: "-0.02em" }}
              >
                {stat.value}
              </p>
              <p className="text-xs" style={{ color: "#475569" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0px); opacity: 1; }
          50% { transform: translateY(-12px); opacity: 0.6; }
        }
      `}</style>
    </section>
  );
}