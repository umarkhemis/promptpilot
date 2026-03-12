"use client";

import { useRef, useEffect } from "react";

const LOGOS = [
  "Stanford University",
  "Harvard Med",
  "TechCorp Inc.",
  "CreativeAgency",
  "StartupHub",
  "GrowthCo",
  "MediaLabs",
  "DigitalFirst",
];

export function SocialProof() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.querySelectorAll<HTMLElement>(".animate-on-scroll").forEach((child, i) => {
              setTimeout(() => child.classList.add("in-view"), i * 80);
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
    <section className="py-16 px-4 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto" ref={ref}>
        <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-widest mb-10 animate-on-scroll">
          Trusted by teams and students worldwide
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {LOGOS.map((name, i) => (
            <div
              key={name}
              className="animate-on-scroll text-slate-300 font-semibold text-sm md:text-base whitespace-nowrap hover:text-slate-500 transition-colors duration-300"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
