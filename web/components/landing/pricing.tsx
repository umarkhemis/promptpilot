"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for getting started",
    features: [
      "20 prompt improvements/month",
      "Basic templates",
      "30-day history",
    ],
    cta: "Get started",
    ctaHref: "/register",
    featured: false,
    ctaClass:
      "w-full py-3 rounded-xl font-semibold text-[#6C3AFF] border-2 border-[#6C3AFF] hover:bg-[#6C3AFF]/5 transition-all duration-200",
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    description: "For power users and professionals",
    badge: "Most Popular",
    features: [
      "Unlimited improvements",
      "Full template library",
      "Brand voice memory",
      "Unlimited history",
      "Priority processing",
    ],
    cta: "Start free trial",
    ctaHref: "/register",
    featured: true,
    ctaClass:
      "w-full py-3 rounded-xl font-semibold bg-[#6C3AFF] hover:bg-[#8B5CF6] text-white transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50",
  },
  {
    name: "Team",
    price: "$29",
    period: "/user/month",
    description: "For agencies and growing teams",
    features: [
      "Everything in Pro",
      "Shared workspace",
      "Team templates",
      "Brand guidelines",
      "Admin controls",
    ],
    cta: "Contact us",
    ctaHref: "/contact",
    featured: false,
    ctaClass:
      "w-full py-3 rounded-xl font-semibold text-slate-700 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200",
  },
];

export function Pricing() {
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
    <section id="pricing" className="py-24 px-4 bg-slate-50">
      <div className="max-w-5xl mx-auto" ref={ref}>
        <div className="text-center mb-16 animate-on-scroll">
          <h2 className="text-3xl sm:text-[40px] font-bold text-slate-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg sm:text-xl text-slate-500">
            Start free. Upgrade when you&apos;re ready.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-center">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`animate-on-scroll relative rounded-2xl p-8 border transition-all duration-300 ${
                plan.featured
                  ? "bg-white border-[#6C3AFF]/50 shadow-2xl shadow-purple-500/20 scale-105 z-10"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg"
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              {/* Most Popular Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-[#6C3AFF] to-[#8B5CF6] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-1">{plan.name}</h3>
                <p className="text-slate-500 text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                  <span className="text-slate-500 text-sm">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        plan.featured
                          ? "bg-[#6C3AFF]/10"
                          : "bg-slate-100"
                      }`}
                    >
                      <Check
                        className={`w-3 h-3 ${
                          plan.featured ? "text-[#6C3AFF]" : "text-slate-500"
                        }`}
                      />
                    </div>
                    <span className="text-slate-600 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href={plan.ctaHref} className={plan.ctaClass}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
