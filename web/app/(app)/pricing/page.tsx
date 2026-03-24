

"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { Check, Zap, Users, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Free",
    icon: Sparkles,
    price: "$0",
    period: "/month",
    description: "Perfect for getting started with AI prompting.",
    features: [
      "20 prompt improvements/month",
      "Basic template library",
      "30-day prompt history",
      "Smart tool recommendations",
    ],
    cta: "Get started free",
    ctaHref: "/register",
    featured: false,
  },
  {
    name: "Pro",
    icon: Zap,
    price: "$12",
    period: "/month",
    description: "For professionals who need unlimited power.",
    badge: "Most Popular",
    features: [
      "Unlimited prompt improvements",
      "Full template library",
      "Brand voice memory",
      "Unlimited history",
      "Priority processing",
      "Early access to new features",
    ],
    cta: "Start 7-day free trial",
    ctaHref: "/register",
    featured: true,
  },
  {
    name: "Team",
    icon: Users,
    price: "$29",
    period: "/user/month",
    description: "For agencies and teams creating at scale.",
    features: [
      "Everything in Pro",
      "Shared team workspace",
      "Collaborative templates",
      "Brand guidelines vault",
      "Admin controls & analytics",
      "Dedicated onboarding",
    ],
    cta: "Contact sales",
    ctaHref: "/contact",
    featured: false,
  },
];

export default function Pricing() {
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
      id="pricing"
      className="relative py-28 px-4 overflow-hidden"
      style={{ background: "#080810" }}
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full blur-[140px]"
          style={{ background: "radial-gradient(ellipse, rgba(108,58,255,0.14) 0%, transparent 70%)" }}
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
            Pricing
          </span>
          <h2
            className="text-4xl sm:text-5xl font-bold text-white mb-4"
            style={{ letterSpacing: "-0.02em" }}
          >
            Simple, transparent pricing
          </h2>
          <p className="text-lg" style={{ color: "#475569" }}>
            Start free. Upgrade when you&apos;re ready. Cancel anytime.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5 items-start">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className="animate-on-scroll relative flex flex-col rounded-2xl"
                style={{
                  transitionDelay: `${i * 150}ms`,
                  background: plan.featured
                    ? "linear-gradient(160deg, rgba(108,58,255,0.22) 0%, rgba(108,58,255,0.08) 100%)"
                    : "rgba(255,255,255,0.03)",
                  border: `1px solid ${plan.featured ? "rgba(108,58,255,0.5)" : "rgba(255,255,255,0.07)"}`,
                  boxShadow: plan.featured
                    ? "0 0 60px rgba(108,58,255,0.2), inset 0 1px 0 rgba(255,255,255,0.08)"
                    : "none",
                  padding: "2rem",
                  marginTop: plan.featured ? "0" : "1.5rem",
                }}
              >
                {/* Popular badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span
                      className="text-xs font-bold px-4 py-1.5 rounded-full text-white whitespace-nowrap"
                      style={{
                        background: "linear-gradient(90deg, #6C3AFF, #8B5CF6)",
                        boxShadow: "0 4px 16px rgba(108,58,255,0.5)",
                      }}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan icon + name */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: plan.featured ? "rgba(108,58,255,0.25)" : "rgba(255,255,255,0.06)",
                      border: `1px solid ${plan.featured ? "rgba(108,58,255,0.4)" : "rgba(255,255,255,0.1)"}`,
                    }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{ color: plan.featured ? "#a78bfa" : "#64748b" }}
                      strokeWidth={1.75}
                    />
                  </div>
                  <p
                    className="text-xs font-semibold tracking-widest uppercase"
                    style={{ color: plan.featured ? "#a78bfa" : "#475569" }}
                  >
                    {plan.name}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-3">
                  <div className="flex items-baseline gap-1">
                    <span
                      className="font-extrabold"
                      style={{
                        fontSize: "clamp(2.25rem, 5vw, 3rem)",
                        color: plan.featured ? "#fff" : "#94a3b8",
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {plan.price}
                    </span>
                    <span className="text-sm" style={{ color: "#475569" }}>
                      {plan.period}
                    </span>
                  </div>
                </div>

                <p
                  className="text-sm leading-relaxed mb-6"
                  style={{ color: plan.featured ? "#94a3b8" : "#475569" }}
                >
                  {plan.description}
                </p>

                {/* Divider */}
                <div
                  className="mb-6"
                  style={{ height: "1px", background: plan.featured ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)" }}
                />

                {/* Features */}
                <ul className="space-y-3.5 flex-1 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background: plan.featured ? "rgba(108,58,255,0.2)" : "rgba(255,255,255,0.05)",
                          border: `1px solid ${plan.featured ? "rgba(108,58,255,0.35)" : "rgba(255,255,255,0.08)"}`,
                        }}
                      >
                        <Check
                          className="w-3 h-3"
                          style={{ color: plan.featured ? "#a78bfa" : "#475569" }}
                          strokeWidth={2.5}
                        />
                      </div>
                      <span className="text-sm" style={{ color: plan.featured ? "#cbd5e1" : "#64748b" }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={plan.ctaHref}
                  className="block text-center py-3 px-5 rounded-xl font-semibold text-sm transition-all duration-200"
                  style={
                    plan.featured
                      ? {
                          background: "linear-gradient(135deg, #6C3AFF, #8B5CF6)",
                          color: "#fff",
                          boxShadow: "0 0 24px rgba(108,58,255,0.45)",
                        }
                      : {
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#94a3b8",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (plan.featured) {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 36px rgba(108,58,255,0.65)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                    } else {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.09)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.18)";
                      (e.currentTarget as HTMLElement).style.color = "#fff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (plan.featured) {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px rgba(108,58,255,0.45)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    } else {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
                      (e.currentTarget as HTMLElement).style.color = "#94a3b8";
                    }
                  }}
                >
                  {plan.cta}
                </Link>

                {plan.featured && (
                  <p className="text-center text-xs mt-3" style={{ color: "#475569" }}>
                    No credit card required
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Trust line */}
        <p className="text-center text-xs mt-14 animate-on-scroll" style={{ color: "#2d3748", letterSpacing: "0.05em" }}>
          SSL encrypted &nbsp;·&nbsp; GDPR compliant &nbsp;·&nbsp; Cancel anytime &nbsp;·&nbsp; 24/7 support
        </p>
      </div>
    </section>
  );
}