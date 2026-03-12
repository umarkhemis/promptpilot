"use client";

import { useRef, useEffect } from "react";
import { Target, Compass, BookOpen } from "lucide-react";

const features = [
  {
    icon: Target,
    emoji: "🎯",
    title: "Prompt Improver",
    description:
      "Paste a messy prompt, get a professional one. Our AI adds structure, specificity, and formatting that gets better results.",
    color: "from-purple-500/20 to-purple-500/5",
    border: "border-purple-500/20 hover:border-purple-500/50",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-400",
  },
  {
    icon: Compass,
    emoji: "🧭",
    title: "Smart Tool Router",
    description:
      "We analyze your task and recommend the best AI tool — ChatGPT, Claude, Perplexity, Midjourney, and more. With reasons why.",
    color: "from-cyan-500/20 to-cyan-500/5",
    border: "border-cyan-500/20 hover:border-cyan-500/50",
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
  },
  {
    icon: BookOpen,
    emoji: "📋",
    title: "Template Library",
    description:
      "Ready-made prompts for marketing campaigns, research papers, study guides, and more. Just customize and go.",
    color: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/20 hover:border-amber-500/50",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
  },
];

export function Features() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.querySelectorAll<HTMLElement>(".animate-on-scroll").forEach((child, i) => {
              setTimeout(() => child.classList.add("in-view"), i * 150);
            });
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto" ref={ref}>
        <div className="text-center mb-16 animate-on-scroll">
          <h2 className="text-3xl sm:text-[40px] font-bold text-slate-900 mb-4">
            Everything you need to prompt better
          </h2>
          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto">
            PromptPilot improves your prompts, picks the right AI tool, and gives you templates —
            all in one place.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`animate-on-scroll group relative bg-gradient-to-br ${feature.color} rounded-2xl p-8 border ${feature.border} hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/10 transition-all duration-300`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div
                  className={`w-14 h-14 ${feature.iconBg} rounded-xl flex items-center justify-center mb-6`}
                >
                  <Icon className={`w-7 h-7 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
