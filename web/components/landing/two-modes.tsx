
"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { Check, Megaphone, GraduationCap, ArrowRight } from "lucide-react";

const MARKETING_ITEMS = [
  "Ad copy & campaigns",
  "Email sequences",
  "SEO content briefs",
  "Social media posts",
  "Brand voice matching",
  "Product descriptions",
];

const STUDENT_ITEMS = [
  "Research summaries",
  "Essay outlines",
  "Study guides",
  "Literature reviews",
  "Citation formatting",
  "Thesis statements",
];

export function TwoModes() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const trigger = () => {
      el.querySelectorAll<HTMLElement>(".animate-on-scroll-left, .animate-on-scroll-right, .animate-on-scroll").forEach((child, i) => {
        setTimeout(() => child.classList.add("in-view"), i * 180);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { trigger(); observer.unobserve(e.target); }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px 50px 0px" }
    );
    observer.observe(el);

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) trigger();

    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="relative py-28 px-4 overflow-hidden"
      style={{ background: "#080810" }}
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[130px]"
          style={{ background: "radial-gradient(ellipse, rgba(108,58,255,0.13) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(ellipse, rgba(6,182,212,0.1) 0%, transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative max-w-5xl mx-auto" ref={ref}>
        {/* Header */}
        <div className="text-center mb-20 animate-on-scroll">
          <span
            className="inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-4 px-3 py-1 rounded-full border"
            style={{ color: "#06B6D4", borderColor: "rgba(6,182,212,0.3)", background: "rgba(6,182,212,0.07)" }}
          >
            Two Modes
          </span>
          <h2
            className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            Built for how you work
          </h2>
          <p className="text-lg" style={{ color: "#64748b" }}>
            Whether you&apos;re growing a business or studying for finals
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* Marketing Mode */}
          <div
            className="animate-on-scroll-left group flex flex-col rounded-2xl p-8 transition-all duration-300 relative overflow-hidden"
            style={{
              background: "rgba(108,58,255,0.05)",
              border: "1px solid rgba(108,58,255,0.2)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(108,58,255,0.5)";
              (e.currentTarget as HTMLElement).style.background = "rgba(108,58,255,0.08)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(108,58,255,0.15)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(108,58,255,0.2)";
              (e.currentTarget as HTMLElement).style.background = "rgba(108,58,255,0.05)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            {/* Glow corner */}
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-20 pointer-events-none"
              style={{ background: "#6C3AFF" }}
            />

            {/* Icon */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
              style={{ background: "rgba(108,58,255,0.15)", border: "1px solid rgba(108,58,255,0.25)" }}
            >
              <Megaphone className="w-5 h-5" style={{ color: "#a78bfa" }} strokeWidth={1.75} />
            </div>

            {/* Label */}
            <span
              className="text-xs font-semibold tracking-[0.15em] uppercase mb-2"
              style={{ color: "#7c5cfc" }}
            >
              For Marketers
            </span>

            <h3
              className="text-2xl font-bold text-white mb-3"
              style={{ letterSpacing: "-0.01em" }}
            >
              Marketing Mode
            </h3>
            <p className="text-sm mb-8 leading-relaxed" style={{ color: "#64748b" }}>
              For marketers, agencies, and businesses creating content at scale.
            </p>

            <ul className="space-y-3 flex-1 mb-8">
              {MARKETING_ITEMS.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(108,58,255,0.18)", border: "1px solid rgba(108,58,255,0.3)" }}
                  >
                    <Check className="w-3 h-3" style={{ color: "#a78bfa" }} strokeWidth={2.5} />
                  </div>
                  <span className="text-sm" style={{ color: "#94a3b8" }}>{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="group/btn flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-sm transition-all duration-200"
              style={{
                background: "rgba(108,58,255,0.15)",
                border: "1px solid rgba(108,58,255,0.35)",
                color: "#a78bfa",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(108,58,255,0.28)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(108,58,255,0.6)";
                (e.currentTarget as HTMLElement).style.color = "#c4b5fd";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(108,58,255,0.15)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(108,58,255,0.35)";
                (e.currentTarget as HTMLElement).style.color = "#a78bfa";
              }}
            >
              Try Marketing Mode
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Student Mode */}
          <div
            className="animate-on-scroll-right group flex flex-col rounded-2xl p-8 transition-all duration-300 relative overflow-hidden"
            style={{
              background: "rgba(6,182,212,0.04)",
              border: "1px solid rgba(6,182,212,0.18)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(6,182,212,0.45)";
              (e.currentTarget as HTMLElement).style.background = "rgba(6,182,212,0.07)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(6,182,212,0.12)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(6,182,212,0.18)";
              (e.currentTarget as HTMLElement).style.background = "rgba(6,182,212,0.04)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            {/* Glow corner */}
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-15 pointer-events-none"
              style={{ background: "#06B6D4" }}
            />

            {/* Icon */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
              style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.22)" }}
            >
              <GraduationCap className="w-5 h-5" style={{ color: "#06B6D4" }} strokeWidth={1.75} />
            </div>

            {/* Label */}
            <span
              className="text-xs font-semibold tracking-[0.15em] uppercase mb-2"
              style={{ color: "#0891b2" }}
            >
              For Students
            </span>

            <h3
              className="text-2xl font-bold text-white mb-3"
              style={{ letterSpacing: "-0.01em" }}
            >
              Student Mode
            </h3>
            <p className="text-sm mb-8 leading-relaxed" style={{ color: "#64748b" }}>
              For students, researchers, and academics getting more from AI.
            </p>

            <ul className="space-y-3 flex-1 mb-8">
              {STUDENT_ITEMS.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.28)" }}
                  >
                    <Check className="w-3 h-3" style={{ color: "#06B6D4" }} strokeWidth={2.5} />
                  </div>
                  <span className="text-sm" style={{ color: "#94a3b8" }}>{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-sm transition-all duration-200"
              style={{
                background: "rgba(6,182,212,0.12)",
                border: "1px solid rgba(6,182,212,0.3)",
                color: "#06B6D4",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(6,182,212,0.22)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(6,182,212,0.55)";
                (e.currentTarget as HTMLElement).style.color = "#22d3ee";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(6,182,212,0.12)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(6,182,212,0.3)";
                (e.currentTarget as HTMLElement).style.color = "#06B6D4";
              }}
            >
              Try Student Mode
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}