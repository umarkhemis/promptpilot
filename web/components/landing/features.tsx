
"use client";

import { useRef, useEffect } from "react";
import { Wand2, Cpu, LayoutGrid } from "lucide-react";

const features = [
  {
    icon: Wand2,
    title: "Prompt Improver",
    description:
      "Paste a messy prompt, get a professional one. Our AI adds structure, specificity, and formatting that gets better results.",
    accent: "#6C3AFF",
    glow: "rgba(108, 58, 255, 0.15)",
    border: "rgba(108, 58, 255, 0.25)",
    hoverBorder: "rgba(108, 58, 255, 0.6)",
    tag: "Core Feature",
  },
  {
    icon: Cpu,
    title: "Smart Tool Router",
    description:
      "We analyze your task and recommend the best AI tool - ChatGPT, Claude, Perplexity, Midjourney, and more. With reasons why.",
    accent: "#06B6D4",
    glow: "rgba(6, 182, 212, 0.15)",
    border: "rgba(6, 182, 212, 0.25)",
    hoverBorder: "rgba(6, 182, 212, 0.6)",
    tag: "AI-Powered",
  },
  {
    icon: LayoutGrid,
    title: "Template Library",
    description:
      "Ready-made prompts for marketing campaigns, research papers, study guides, and more. Just customize and go.",
    accent: "#F59E0B",
    glow: "rgba(245, 158, 11, 0.15)",
    border: "rgba(245, 158, 11, 0.25)",
    hoverBorder: "rgba(245, 158, 11, 0.6)",
    tag: "Ready to Use",
  },
];

export function Features() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const trigger = () => {
      el.querySelectorAll<HTMLElement>(".animate-on-scroll").forEach((child, i) => {
        setTimeout(() => child.classList.add("in-view"), i * 160);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            trigger();
            observer.unobserve(e.target);
          }
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
      id="features"
      className="relative py-28 px-4 overflow-hidden"
      style={{ background: "#0B0B16" }}
    >
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Ambient glow top-center */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full blur-[120px] opacity-30"
        style={{ background: "radial-gradient(ellipse, #6C3AFF 0%, transparent 70%)" }}
      />

      <div className="relative max-w-6xl mx-auto" ref={ref}>
        {/* Section header */}
        <div className="text-center mb-20 animate-on-scroll">
          <span
            className="inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-4 px-3 py-1 rounded-full border"
            style={{ color: "#06B6D4", borderColor: "rgba(6,182,212,0.3)", background: "rgba(6,182,212,0.07)" }}
          >
            What We Offer
          </span>
          <h2
            className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            Everything you need to{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #6C3AFF, #06B6D4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              prompt better
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            Promptify improves your prompts, picks the right AI tool, and gives you
            templates - all in one place.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="animate-on-scroll group relative rounded-2xl p-8 transition-all duration-300 cursor-default"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${feature.border}`,
                  transitionDelay: `${i * 160}ms`,
                  boxShadow: `0 0 0 0 ${feature.glow}`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.border = `1px solid ${feature.hoverBorder}`;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 40px ${feature.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`;
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.border = `1px solid ${feature.border}`;
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                }}
              >
                {/* Top tag */}
                <div className="flex items-center justify-between mb-8">
                  <span
                    className="text-[11px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-md"
                    style={{
                      color: feature.accent,
                      background: `${feature.glow}`,
                    }}
                  >
                    {feature.tag}
                  </span>
                  <span className="text-slate-600 text-xs font-mono">0{i + 1}</span>
                </div>

                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `${feature.glow}`,
                    border: `1px solid ${feature.border}`,
                  }}
                >
                  <Icon className="w-6 h-6" style={{ color: feature.accent }} strokeWidth={1.75} />
                </div>

                {/* Text */}
                <h3 className="text-xl font-bold text-white mb-3" style={{ letterSpacing: "-0.01em" }}>
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed text-sm">{feature.description}</p>

                {/* Bottom accent line */}
                <div
                  className="absolute bottom-0 left-8 right-8 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
                  style={{ background: `linear-gradient(90deg, transparent, ${feature.accent}, transparent)` }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}



