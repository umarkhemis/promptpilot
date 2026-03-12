"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.querySelectorAll<HTMLElement>(".animate-on-scroll-left, .animate-on-scroll-right").forEach((child, i) => {
              setTimeout(() => child.classList.add("in-view"), i * 200);
            });
            e.target.querySelectorAll<HTMLElement>(".animate-on-scroll").forEach((child, i) => {
              setTimeout(() => child.classList.add("in-view"), i * 100);
            });
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px 50px 0px" }
    );
    observer.observe(el);

    // Immediately trigger for elements already in viewport
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      el.querySelectorAll<HTMLElement>(".animate-on-scroll-left, .animate-on-scroll-right, .animate-on-scroll").forEach((child, i) => {
        setTimeout(() => child.classList.add("in-view"), i * 150);
      });
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 px-4 bg-gradient-to-br from-[#1A0A2E] via-[#0F0F1A] to-[#0A1A2E] relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 purple-blob opacity-30 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 cyan-blob opacity-20 blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10" ref={ref}>
        <div className="text-center mb-16 animate-on-scroll">
          <h2 className="text-3xl sm:text-[40px] font-bold text-white mb-4">
            Built for how you work
          </h2>
          <p className="text-lg text-slate-400">
            Whether you&apos;re growing a business or studying for finals
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Marketing Mode */}
          <div className="animate-on-scroll-left flex flex-col bg-gradient-to-br from-[#6C3AFF]/20 to-[#6C3AFF]/5 border border-[#6C3AFF]/30 rounded-2xl p-8 hover:border-[#6C3AFF]/60 transition-all duration-300">
            <div className="text-4xl mb-4">📢</div>
            <h3 className="text-2xl font-bold text-white mb-2">Marketing Mode</h3>
            <p className="text-slate-400 mb-6">
              For marketers, agencies, and businesses creating content at scale.
            </p>
            <ul className="space-y-3 flex-1">
              {MARKETING_ITEMS.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#6C3AFF]/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-[#8B5CF6]" />
                  </div>
                  <span className="text-slate-300 text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="mt-8 block text-center py-2.5 px-4 rounded-xl font-semibold text-sm border border-[#6C3AFF]/50 text-[#8B5CF6] hover:bg-[#6C3AFF]/20 transition-all duration-200"
            >
              Try Marketing Mode →
            </Link>
          </div>

          {/* Student Mode */}
          <div className="animate-on-scroll-right flex flex-col bg-gradient-to-br from-[#06B6D4]/20 to-[#06B6D4]/5 border border-[#06B6D4]/30 rounded-2xl p-8 hover:border-[#06B6D4]/60 transition-all duration-300">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-white mb-2">Student Mode</h3>
            <p className="text-slate-400 mb-6">
              For students, researchers, and academics getting more from AI.
            </p>
            <ul className="space-y-3 flex-1">
              {STUDENT_ITEMS.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#06B6D4]/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-[#06B6D4]" />
                  </div>
                  <span className="text-slate-300 text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="mt-8 block text-center py-2.5 px-4 rounded-xl font-semibold text-sm border border-[#06B6D4]/50 text-[#06B6D4] hover:bg-[#06B6D4]/20 transition-all duration-200"
            >
              Try Student Mode →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
