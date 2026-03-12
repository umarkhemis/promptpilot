"use client";

import { useRef, useEffect } from "react";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "I used to spend 20 minutes tweaking prompts. Now it's one click and the output is perfect.",
    name: "Sarah M.",
    role: "Marketing Manager",
    initials: "SM",
    color: "from-purple-600 to-purple-400",
  },
  {
    quote:
      "The tool recommendations are spot-on. I didn't know Perplexity existed until PromptPilot suggested it for my research.",
    name: "James K.",
    role: "PhD Student",
    initials: "JK",
    color: "from-cyan-600 to-cyan-400",
  },
  {
    quote:
      "Our whole team uses the marketing templates. It's saved us hours every week.",
    name: "David L.",
    role: "Agency Owner",
    initials: "DL",
    color: "from-amber-600 to-amber-400",
  },
];

export function Testimonials() {
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
    <section className="py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto" ref={ref}>
        <div className="text-center mb-16 animate-on-scroll">
          <h2 className="text-3xl sm:text-[40px] font-bold text-slate-900 mb-4">
            What our users say
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="animate-on-scroll bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300"
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <Quote className="w-8 h-8 text-[#6C3AFF]/30 mb-4" />
              <p className="text-slate-700 leading-relaxed mb-6 text-[17px]">{`"${t.quote}"`}</p>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-sm font-bold`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                  <p className="text-slate-500 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
