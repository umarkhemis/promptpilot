
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Copy, ExternalLink, RefreshCw, Sparkles, CheckCircle2, XCircle } from "lucide-react";

const BEFORE_TEXT = "write me a good ad for shoes";
const AFTER_TEXT =
  "Write a 50-word Instagram ad for premium running shoes targeting fitness enthusiasts aged 18-30. Tone: energetic and aspirational. Include: product benefit, social proof element, and a clear CTA.";
const TOOL_RECOMMENDATION = "Recommended: ChatGPT - Best for fast ad copy variants";

const AVATARS = [
  { initials: "SM", hue: 250 },
  { initials: "JK", hue: 270 },
  { initials: "DL", hue: 200 },
  { initials: "AR", hue: 290 },
  { initials: "MG", hue: 220 },
];

type Phase = "idle" | "typing-before" | "typing-after" | "done" | "resetting";

export function Hero() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [typedBefore, setTypedBefore] = useState("");
  const [showAfter, setShowAfter] = useState(false);
  const [typedAfter, setTypedAfter] = useState("");
  const [showTool, setShowTool] = useState(false);
  const [copied, setCopied] = useState(false);
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAll = useCallback(() => {
    intervalsRef.current.forEach(clearInterval);
    timeoutsRef.current.forEach(clearTimeout);
    intervalsRef.current = [];
    timeoutsRef.current = [];
  }, []);

  const runCycle = useCallback(() => {
    clearAll();
    setPhase("idle");
    setTypedBefore("");
    setShowAfter(false);
    setTypedAfter("");
    setShowTool(false);

    const t0 = setTimeout(() => {
      setPhase("typing-before");
      let i = 0;
      const iv1 = setInterval(() => {
        if (i < BEFORE_TEXT.length) {
          setTypedBefore(BEFORE_TEXT.slice(0, i + 1));
          i++;
        } else {
          clearInterval(iv1);
          const t1 = setTimeout(() => {
            setShowAfter(true);
            setPhase("typing-after");
            let j = 0;
            const iv2 = setInterval(() => {
              if (j < AFTER_TEXT.length) {
                setTypedAfter(AFTER_TEXT.slice(0, j + 1));
                j++;
              } else {
                clearInterval(iv2);
                const t2 = setTimeout(() => {
                  setShowTool(true);
                  setPhase("done");
                  const t3 = setTimeout(() => {
                    setPhase("resetting");
                    const t4 = setTimeout(() => runCycle(), 500);
                    timeoutsRef.current.push(t4);
                  }, 5000);
                  timeoutsRef.current.push(t3);
                }, 350);
                timeoutsRef.current.push(t2);
              }
            }, 16);
            intervalsRef.current.push(iv2);
          }, 700);
          timeoutsRef.current.push(t1);
        }
      }, 55);
      intervalsRef.current.push(iv1);
    }, 600);
    timeoutsRef.current.push(t0);
  }, [clearAll]);

  useEffect(() => {
    runCycle();
    return () => clearAll();
  }, [runCycle, clearAll]);

  const handleCopy = () => {
    navigator.clipboard.writeText(AFTER_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const isResetting = phase === "resetting";

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16"
      style={{ background: "#080810" }}
    >
      {/* Layered ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[160px]"
          style={{ background: "radial-gradient(ellipse, rgba(108,58,255,0.22) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/3 right-[-5%] w-[500px] h-[500px] rounded-full blur-[140px]"
          style={{ background: "radial-gradient(ellipse, rgba(6,182,212,0.12) 0%, transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center">

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-full mb-10"
          style={{
            background: "rgba(108,58,255,0.12)",
            border: "1px solid rgba(108,58,255,0.35)",
            color: "#a78bfa",
          }}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
          AI-powered prompt engineering
        </div>

        {/* Headline */}
        <h1
          className="font-extrabold text-white leading-[1.08] tracking-tight mb-6 max-w-4xl"
          style={{ fontSize: "clamp(2.5rem, 6vw, 4.25rem)", letterSpacing: "-0.03em" }}
        >
          Stop guessing.{" "}
          <br className="hidden sm:block" />
          Start prompting{" "}
          <span
            style={{
              background: "linear-gradient(95deg, #a78bfa 0%, #06B6D4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            like a pro.
          </span>
        </h1>

        {/* Sub-headline */}
        <p
          className="text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed"
          style={{ color: "#94a3b8" }}
        >
          Better prompts. Right AI tool. Perfect results -&nbsp;every time.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 font-semibold px-8 py-3.5 rounded-xl text-base transition-all duration-200 text-white"
            style={{
              background: "linear-gradient(135deg, #6C3AFF 0%, #8B5CF6 100%)",
              boxShadow: "0 0 32px rgba(108,58,255,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 48px rgba(108,58,255,0.65), inset 0 1px 0 rgba(255,255,255,0.2)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 32px rgba(108,58,255,0.45), inset 0 1px 0 rgba(255,255,255,0.15)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            Try it free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 font-semibold px-8 py-3.5 rounded-xl text-base transition-all duration-200"
            style={{
              color: "#cbd5e1",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.22)";
              (e.currentTarget as HTMLElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)";
              (e.currentTarget as HTMLElement).style.color = "#cbd5e1";
            }}
          >
            See how it works
          </a>
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-3 mb-16">
          <div className="flex -space-x-2">
            {AVATARS.map((a, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-white"
                style={{ background: `hsl(${a.hue}, 65%, 52%)`, borderColor: "#080810" }}
              >
                {a.initials}
              </div>
            ))}
          </div>
          <span className="text-sm" style={{ color: "#64748b" }}>
            Trusted by <span className="text-white font-semibold">500+</span> marketers &amp; students
          </span>
        </div>

        {/* Demo card */}
        <div
          className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden"
          style={{
            background: "rgba(18, 18, 34, 0.85)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(108,58,255,0.08)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Window chrome */}
          <div
            className="flex items-center gap-2 px-5 py-3.5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}
          >
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f57" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#febc2e" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#28c840" }} />
            <span className="ml-3 text-xs font-mono" style={{ color: "#475569" }}>
              promptpilot · demo
            </span>
            {phase === "done" && (
              <button
                onClick={runCycle}
                className="ml-auto flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md transition-all"
                style={{ color: "#64748b", background: "rgba(255,255,255,0.05)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#fff";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#64748b";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                }}
              >
                <RefreshCw className="w-3 h-3" />
                Replay
              </button>
            )}
          </div>

          <div className="p-6 space-y-4">
            {/* Before */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <XCircle className="w-3.5 h-3.5" style={{ color: "#f87171" }} />
                <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#f87171" }}>
                  Your prompt
                </span>
              </div>
              <div
                className="rounded-xl p-4"
                style={{
                  background: "rgba(248,113,113,0.05)",
                  border: "1px solid rgba(248,113,113,0.18)",
                  opacity: isResetting ? 0 : 1,
                  transition: "opacity 0.4s ease",
                }}
              >
                <p className="font-mono text-sm min-h-[1.5rem]" style={{ color: "#94a3b8" }}>
                  {typedBefore}
                  {phase === "typing-before" && (
                    <span
                      className="inline-block w-px h-4 ml-0.5 align-middle"
                      style={{ background: "#94a3b8", animation: "blink 1s step-end infinite" }}
                    />
                  )}
                  {phase === "idle" && (
                    <span style={{ color: "#334155" }}>Your raw prompt goes here...</span>
                  )}
                </p>
              </div>
            </div>

            {/* After */}
            {showAfter && (
              <div
                className="space-y-2"
                style={{
                  animation: "fadeSlideUp 0.4s ease forwards",
                  opacity: isResetting ? 0 : 1,
                  transition: "opacity 0.4s ease",
                }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#34d399" }} />
                  <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#34d399" }}>
                    Promptify improved
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: "rgba(52,211,153,0.12)", color: "#34d399" }}
                  >
                    Enhanced
                  </span>
                </div>
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: "rgba(52,211,153,0.05)",
                    border: "1px solid rgba(52,211,153,0.2)",
                  }}
                >
                  <p className="font-mono text-sm min-h-[3rem] leading-relaxed" style={{ color: "#6ee7b7" }}>
                    {typedAfter}
                    {phase === "typing-after" && (
                      <span
                        className="inline-block w-px h-4 ml-0.5 align-middle"
                        style={{ background: "#34d399", animation: "blink 1s step-end infinite" }}
                      />
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Tool recommendation */}
            {showTool && (
              <div
                className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{
                  background: "rgba(108,58,255,0.1)",
                  border: "1px solid rgba(108,58,255,0.28)",
                  animation: "fadeSlideUp 0.35s ease forwards",
                  opacity: isResetting ? 0 : 1,
                  transition: "opacity 0.4s ease",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: "#a78bfa", boxShadow: "0 0 6px #a78bfa" }}
                  />
                  <span className="text-sm" style={{ color: "#c4b5fd" }}>
                    {TOOL_RECOMMENDATION}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg transition-all"
                    style={{ color: copied ? "#34d399" : "#64748b" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
                      if (!copied) (e.currentTarget as HTMLElement).style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      if (!copied) (e.currentTarget as HTMLElement).style.color = "#64748b";
                    }}
                    title="Copy improved prompt"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    className="p-1.5 rounded-lg transition-all"
                    style={{ color: "#64748b" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
                      (e.currentTarget as HTMLElement).style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "#64748b";
                    }}
                    title="Open in ChatGPT"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Progress bar at bottom of card */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div
              style={{
                height: "2px",
                background: "linear-gradient(90deg, #6C3AFF, #06B6D4)",
                width: phase === "done" ? "100%" : "0%",
                transition: phase === "done" ? "width 5s linear" : "width 0s",
              }}
            />
          </div>
        </div>

        {/* Loop status label */}
        <p className="mt-3 text-xs font-mono" style={{ color: "#334155", minHeight: "1rem" }}>
          {phase === "done" && "replaying in 5s..."}
          {phase === "typing-before" && "typing prompt..."}
          {phase === "typing-after" && "improving..."}
        </p>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
        style={{ background: "linear-gradient(to top, #0B0B16, transparent)" }}
      />

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
