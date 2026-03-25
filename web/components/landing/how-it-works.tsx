
"use client";

import { useRef, useEffect } from "react";
import { MessageSquare, Sparkles, Rocket, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MessageSquare,
    title: "Describe your task",
    description:
      "Type what you need in plain English. No prompt engineering skills required.",
    accent: "#6C3AFF",
    glow: "rgba(108,58,255,0.18)",
    border: "rgba(108,58,255,0.25)",
    rgb: "108,58,255",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "We improve & route",
    description:
      "Our AI rewrites your prompt and picks the best tool for your task. You'll see exactly why.",
    accent: "#06B6D4",
    glow: "rgba(6,182,212,0.15)",
    border: "rgba(6,182,212,0.22)",
    rgb: "6,182,212",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Copy & go",
    description:
      "One-click copy or open directly in the recommended tool. Perfect output, every time.",
    accent: "#a78bfa",
    glow: "rgba(167,139,250,0.15)",
    border: "rgba(167,139,250,0.22)",
    rgb: "167,139,250",
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const trigger = () => {
      el.querySelectorAll<HTMLElement>(".animate-on-scroll").forEach((child, i) => {
        setTimeout(() => child.classList.add("in-view"), i * 150);
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
      id="how-it-works"
      className="relative py-20 px-4 overflow-hidden"
      style={{ background: "#0B0B16" }}
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-[130px]"
          style={{ background: "radial-gradient(ellipse, rgba(108,58,255,0.12) 0%, transparent 70%)" }}
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
        <div className="text-center mb-14 animate-on-scroll">
          <span
            className="inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-4 px-3 py-1 rounded-full border"
            style={{ color: "#06B6D4", borderColor: "rgba(6,182,212,0.3)", background: "rgba(6,182,212,0.07)" }}
          >
            How it works
          </span>
          <h2
            className="text-4xl sm:text-5xl font-bold text-white mb-4"
            style={{ letterSpacing: "-0.02em" }}
          >
            Three steps to perfect prompts
          </h2>
          <p className="text-lg" style={{ color: "#475569" }}>
            From vague idea to polished, powerful prompt in seconds
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid md:grid-cols-3 gap-6">

          {/* Connector line — desktop only */}
          <div
            className="hidden md:block absolute top-[3.25rem] left-[calc(16.67%+2.5rem)] right-[calc(16.67%+2.5rem)] h-px"
            style={{
              background: "linear-gradient(90deg, rgba(108,58,255,0.4), rgba(6,182,212,0.4), rgba(167,139,250,0.4))",
            }}
          >
            <div className="absolute left-1/4 top-1/2 -translate-y-1/2 -translate-x-1/2">
              <ArrowRight className="w-3 h-3" style={{ color: "rgba(108,58,255,0.5)" }} />
            </div>
            <div className="absolute left-3/4 top-1/2 -translate-y-1/2 -translate-x-1/2">
              <ArrowRight className="w-3 h-3" style={{ color: "rgba(6,182,212,0.5)" }} />
            </div>
          </div>

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="animate-on-scroll flex flex-col items-center text-center group"
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                {/* Icon circle */}
                <div className="relative mb-6">
                  <div
                    className="absolute inset-0 rounded-2xl blur-[16px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: step.glow, transform: "scale(1.3)" }}
                  />
                  <div
                    className="relative w-24 h-24 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-1"
                    style={{
                      background: `rgba(${step.rgb}, 0.1)`,
                      border: `1px solid ${step.border}`,
                      boxShadow: `0 8px 32px ${step.glow}`,
                    }}
                  >
                    <Icon className="w-9 h-9" style={{ color: step.accent }} strokeWidth={1.5} />
                  </div>

                  {/* Step number badge */}
                  <div
                    className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{
                      background: step.accent,
                      boxShadow: `0 0 12px ${step.glow}`,
                    }}
                  >
                    {i + 1}
                  </div>
                </div>

                <span
                  className="text-xs font-semibold tracking-[0.15em] uppercase mb-2"
                  style={{ color: step.accent, opacity: 0.7 }}
                >
                  Step {step.number}
                </span>

                <h3
                  className="text-xl font-bold text-white mb-2"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed max-w-[220px]" style={{ color: "#64748b" }}>
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 animate-on-scroll">
          <p className="text-sm mb-4" style={{ color: "#334155" }}>
            Ready to try it yourself?
          </p>
          <a
            href="/register"
            className="inline-flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-200 text-white"
            style={{
              background: "linear-gradient(135deg, #6C3AFF, #8B5CF6)",
              boxShadow: "0 0 24px rgba(108,58,255,0.4)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 36px rgba(108,58,255,0.65)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px rgba(108,58,255,0.4)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            Get started free
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      <style>{`
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .animate-on-scroll.in-view {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  );
}


