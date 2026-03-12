"use client";

import { useRef, useEffect } from "react";
import { MessageSquare, Sparkles, Rocket } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: MessageSquare,
    title: "Describe your task",
    description:
      "Type what you need in plain English. No prompt engineering skills required.",
  },
  {
    number: "2",
    icon: Sparkles,
    title: "We improve + route",
    description:
      "Our AI rewrites your prompt and picks the best tool. You'll see exactly why.",
  },
  {
    number: "3",
    icon: Rocket,
    title: "Copy & go",
    description:
      "One-click copy or open directly in the recommended tool. Done.",
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.querySelectorAll<HTMLElement>(".animate-on-scroll").forEach((child, i) => {
              setTimeout(() => child.classList.add("in-view"), i * 200);
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
    <section id="how-it-works" className="py-24 px-4 bg-slate-50">
      <div className="max-w-5xl mx-auto" ref={ref}>
        <div className="text-center mb-16 animate-on-scroll">
          <h2 className="text-3xl sm:text-[40px] font-bold text-slate-900 mb-4">How it works</h2>
          <p className="text-lg sm:text-xl text-slate-500">Three steps to perfect prompts</p>
        </div>

        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-0.5 border-t-2 border-dashed border-[#6C3AFF]/30" />

          <div className="grid md:grid-cols-3 gap-10 relative">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="animate-on-scroll flex flex-col items-center text-center"
                  style={{ transitionDelay: `${i * 200}ms` }}
                >
                  {/* Number badge */}
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#6C3AFF] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#6C3AFF] border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-md">
                      {step.number}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
