"use client";

import { useRef, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

const BEFORE_PROMPT = `"write me a good ad for shoes"`;
const AFTER_PROMPT = `Write a 50-word Instagram ad for premium running shoes targeting fitness enthusiasts aged 18-30. Tone: energetic and aspirational. Include: product benefit, social proof element, and a clear CTA. Format: headline + body + 3 hashtags.`;

export function BeforeAfter() {
  const ref = useRef<HTMLDivElement>(null);
  const [afterVisible, setAfterVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.querySelectorAll<HTMLElement>(".animate-on-scroll-left, .animate-on-scroll-right").forEach((child, i) => {
              setTimeout(() => child.classList.add("in-view"), i * 200);
            });
            setTimeout(() => setAfterVisible(true), 600);
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 px-4 hero-gradient-bg relative overflow-hidden">
      {/* Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-80 h-80 purple-blob opacity-40 blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-72 h-72 cyan-blob opacity-30 blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10" ref={ref}>
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-[40px] font-bold text-white mb-4">See the difference</h2>
          <p className="text-lg text-slate-400">
            One click transforms a vague prompt into a powerful one
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-start mb-8">
          {/* Before */}
          <div className="animate-on-scroll-left">
            <div className="bg-[#1A1A2E]/80 backdrop-blur-sm border border-red-500/30 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-red-500/20 bg-red-500/5">
                <span className="text-sm font-semibold text-red-400">❌ Your prompt</span>
              </div>
              <div className="p-6">
                <p className="font-mono text-slate-500 text-sm leading-relaxed">{BEFORE_PROMPT}</p>
                <div className="mt-4 flex gap-2 flex-wrap">
                  <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-full border border-red-500/20">Too vague</span>
                  <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-full border border-red-500/20">No context</span>
                  <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-full border border-red-500/20">No format</span>
                </div>
              </div>
            </div>
          </div>

          {/* After */}
          <div className="animate-on-scroll-right">
            <div className="bg-[#1A1A2E]/80 backdrop-blur-sm border border-emerald-500/30 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-emerald-500/20 bg-emerald-500/5">
                <span className="text-sm font-semibold text-emerald-400">✅ PromptPilot improved</span>
              </div>
              <div className="p-6">
                <p className="font-mono text-emerald-300 text-sm leading-relaxed">{AFTER_PROMPT}</p>
                <div className="mt-4 flex gap-2 flex-wrap">
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20">Specific</span>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20">Structured</span>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20">Actionable</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tool recommendation */}
        {afterVisible && (
          <div className="flex items-center justify-center animate-slide-up">
            <div className="inline-flex items-center gap-3 bg-[#6C3AFF]/20 border border-[#6C3AFF]/40 rounded-xl px-6 py-3">
              <span className="text-slate-300 text-sm">
                🧭 <span className="font-semibold text-white">Recommended: ChatGPT</span> — Best for fast ad copy variants
              </span>
              <ArrowRight className="w-4 h-4 text-[#6C3AFF]" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
