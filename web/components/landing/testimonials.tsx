
"use client";

import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "I used to spend 20 minutes tweaking prompts. Now it's one click and the output is perfect.",
    name: "Sarah M.",
    role: "Marketing Manager",
    initials: "SM",
    hue: 258,
  },
  {
    quote:
      "The tool recommendations are spot-on. I didn't know Perplexity existed until Promptify suggested it for my research.",
    name: "James K.",
    role: "PhD Student",
    initials: "JK",
    hue: 192,
  },
  {
    quote:
      "Our whole team uses the marketing templates. It's saved us hours every week.",
    name: "David L.",
    role: "Agency Owner",
    initials: "DL",
    hue: 38,
  },
  {
    quote:
      "Finally, I can describe what I want in plain English and get a prompt that actually works. Game changer.",
    name: "Aisha R.",
    role: "Content Strategist",
    initials: "AR",
    hue: 280,
  },
  {
    quote:
      "Went from getting mediocre AI output to professional-grade copy in under a minute. Incredible tool.",
    name: "Marcus G.",
    role: "Freelance Copywriter",
    initials: "MG",
    hue: 210,
  },
  {
    quote:
      "The student mode helped me write better research prompts. My thesis research time dropped by half.",
    name: "Priya S.",
    role: "Graduate Researcher",
    initials: "PS",
    hue: 160,
  },
];

// Duplicate for seamless infinite loop
const ITEMS = [...testimonials, ...testimonials];

function TestimonialCard({ t }: { t: typeof testimonials[0] }) {
  return (
    <div
      className="flex-shrink-0 w-[340px] rounded-2xl p-6 flex flex-col gap-4"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Stars */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />
        ))}
      </div>

      {/* Quote */}
      <p className="text-sm leading-relaxed flex-1" style={{ color: "#94a3b8" }}>
        &ldquo;{t.quote}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ background: `hsl(${t.hue}, 60%, 48%)` }}
        >
          {t.initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{t.name}</p>
          <p className="text-xs" style={{ color: "#475569" }}>{t.role}</p>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  return (
    <section
      className="relative py-28 overflow-hidden"
      style={{ background: "#0B0B16" }}
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(ellipse, rgba(108,58,255,0.1) 0%, transparent 70%)" }}
        />
      </div>

      {/* Header */}
      <div className="relative text-center mb-16 px-4">
        <span
          className="inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-4 px-3 py-1 rounded-full border"
          style={{ color: "#06B6D4", borderColor: "rgba(6,182,212,0.3)", background: "rgba(6,182,212,0.07)" }}
        >
          Testimonials
        </span>
        <h2
          className="text-4xl sm:text-5xl font-bold text-white mb-4"
          style={{ letterSpacing: "-0.02em" }}
        >
          What our users say
        </h2>
        <p className="text-lg" style={{ color: "#475569" }}>
          Trusted by marketers, students, and creators worldwide
        </p>
      </div>

      {/* Row 1 — scrolls left */}
      <div className="relative mb-4">
        {/* Edge fades */}
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 z-10"
          style={{ background: "linear-gradient(to right, #0B0B16, transparent)" }}
        />
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 z-10"
          style={{ background: "linear-gradient(to left, #0B0B16, transparent)" }}
        />

        <div
          className="flex gap-4 w-max"
          style={{ animation: "marquee-left 35s linear infinite" }}
        >
          {ITEMS.map((t, i) => (
            <TestimonialCard key={i} t={t} />
          ))}
        </div>
      </div>

      {/* Row 2 — scrolls right (reversed) */}
      <div className="relative">
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 z-10"
          style={{ background: "linear-gradient(to right, #0B0B16, transparent)" }}
        />
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 z-10"
          style={{ background: "linear-gradient(to left, #0B0B16, transparent)" }}
        />

        <div
          className="flex gap-4 w-max"
          style={{ animation: "marquee-right 40s linear infinite" }}
        >
          {[...ITEMS].reverse().map((t, i) => (
            <TestimonialCard key={i} t={t} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee-left {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }

        /* Pause on hover for accessibility */
        .flex:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}