
"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { ArrowRight, Sparkles, XCircle, CheckCircle2, Compass } from "lucide-react";

const BEFORE_PROMPT = `write me a good ad for shoes`;
const AFTER_PROMPT = `Write a 50-word Instagram ad for premium running shoes targeting fitness enthusiasts aged 18–30. Tone: energetic and aspirational. Include: product benefit, social proof element, and a clear CTA. Format: headline + body + 3 hashtags.`;

const BEFORE_TAGS = ["Too vague", "No context", "No format"];
const AFTER_TAGS = ["Specific", "Structured", "Actionable"];

export function BeforeAfter() {
  const ref = useRef<HTMLDivElement>(null);
  const [sectionVisible, setSectionVisible] = useState(false);

  // Animation state
  const [phase, setPhase] = useState<"idle" | "typing-after" | "done" | "resetting">("idle");
  const [typedAfter, setTypedAfter] = useState("");
  const [showTool, setShowTool] = useState(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);

  const clearAll = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    intervalsRef.current.forEach(clearInterval);
    timeoutsRef.current = [];
    intervalsRef.current = [];
  }, []);

  const runCycle = useCallback(() => {
    clearAll();
    setPhase("idle");
    setTypedAfter("");
    setShowTool(false);

    // Brief pause before typing starts
    const t1 = setTimeout(() => {
      setPhase("typing-after");
      let j = 0;
      const iv = setInterval(() => {
        if (j < AFTER_PROMPT.length) {
          setTypedAfter(AFTER_PROMPT.slice(0, j + 1));
          j++;
        } else {
          clearInterval(iv);
          const t2 = setTimeout(() => {
            setShowTool(true);
            setPhase("done");
            // After 5s of showing result, reset and loop
            const t3 = setTimeout(() => {
              setPhase("resetting");
              const t4 = setTimeout(() => runCycle(), 600);
              timeoutsRef.current.push(t4);
            }, 10000);
            timeoutsRef.current.push(t3);
          }, 400);
          timeoutsRef.current.push(t2);
        }
      }, 16);
      intervalsRef.current.push(iv);
    }, 900);
    timeoutsRef.current.push(t1);
  }, [clearAll]);

  // Intersection observer to start animation when visible
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setSectionVisible(true);
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) setSectionVisible(true);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (sectionVisible) runCycle();
    return () => clearAll();
  }, [sectionVisible, runCycle, clearAll]);

  const isResetting = phase === "resetting";
  const afterReady = phase === "typing-after" || phase === "done";

  return (
    <section
      className="relative py-28 px-4 overflow-hidden"
      style={{ background: "#0B0B16" }}
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full blur-[130px]"
          style={{ background: "radial-gradient(ellipse, rgba(108,58,255,0.14) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(ellipse, rgba(6,182,212,0.08) 0%, transparent 70%)" }}
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

      <div className="relative max-w-5xl mx-auto mb-8" ref={ref}>
        {/* Header */}
        <div
          className="text-center mb-16"
          style={{ opacity: sectionVisible ? 1 : 0, transform: sectionVisible ? "none" : "translateY(16px)", transition: "all 0.6s ease" }}
        >
          <span
            className="inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-4 px-3 py-1 rounded-full border"
            style={{ color: "#06B6D4", borderColor: "rgba(6,182,212,0.3)", background: "rgba(6,182,212,0.07)" }}
          >
            Live Demo
          </span>
          <h2
            className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            See the difference
          </h2>
          <p className="text-lg" style={{ color: "#64748b" }}>
            One click transforms a vague prompt into a powerful one
          </p>
        </div>

        {/* Cards grid */}
        <div className="relative grid md:grid-cols-2 gap-6 items-start mb-8">

          {/* BEFORE card */}
          <div
            style={{
              opacity: sectionVisible ? 1 : 0,
              transform: sectionVisible ? "none" : "translateX(-24px)",
              transition: "all 0.6s ease 0.1s",
            }}
          >
            <div
              className="rounded-2xl overflow-hidden h-full"
              style={{
                background: "rgba(248,113,113,0.04)",
                border: "1px solid rgba(248,113,113,0.22)",
                backdropFilter: "blur(10px)",
              }}
            >
              {/* Card header */}
              <div
                className="flex items-center gap-2.5 px-5 py-3.5"
                style={{ borderBottom: "1px solid rgba(248,113,113,0.15)", background: "rgba(248,113,113,0.06)" }}
              >
                <XCircle className="w-4 h-4" style={{ color: "#f87171" }} />
                <span className="text-sm font-semibold" style={{ color: "#f87171" }}>
                  Your prompt
                </span>
              </div>
              <div className="p-6">
                <p className="font-mono text-sm leading-relaxed mb-5" style={{ color: "#64748b" }}>
                  {BEFORE_PROMPT}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {BEFORE_TAGS.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{
                        background: "rgba(248,113,113,0.1)",
                        color: "#f87171",
                        border: "1px solid rgba(248,113,113,0.22)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Center sparkle — desktop */}
          <div
            className="hidden md:flex absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #6C3AFF, #06B6D4)",
              boxShadow: "0 0 24px rgba(108,58,255,0.5)",
              animation: "floatBob 3s ease-in-out infinite",
            }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>

          {/* AFTER card */}
          <div
            style={{
              opacity: sectionVisible ? 1 : 0,
              transform: sectionVisible ? "none" : "translateX(24px)",
              transition: "all 0.6s ease 0.25s",
            }}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(52,211,153,0.04)",
                border: `1px solid ${afterReady ? "rgba(52,211,153,0.3)" : "rgba(52,211,153,0.1)"}`,
                backdropFilter: "blur(10px)",
                transition: "border-color 0.4s ease",
              }}
            >
              {/* Card header */}
              <div
                className="flex items-center gap-2.5 px-5 py-3.5"
                style={{
                  borderBottom: "1px solid rgba(52,211,153,0.15)",
                  background: afterReady ? "rgba(52,211,153,0.07)" : "rgba(52,211,153,0.03)",
                  transition: "background 0.4s ease",
                }}
              >
                <CheckCircle2 className="w-4 h-4" style={{ color: "#34d399", opacity: afterReady ? 1 : 0.3, transition: "opacity 0.4s ease" }} />
                <span className="text-sm font-semibold" style={{ color: "#34d399", opacity: afterReady ? 1 : 0.35, transition: "opacity 0.4s ease" }}>
                  Promptify improved
                </span>
                {afterReady && (
                  <span
                    className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", animation: "fadeIn 0.3s ease" }}
                  >
                    Enhanced
                  </span>
                )}
              </div>
              <div className="p-6 min-h-[140px]">
                <p
                  className="font-mono text-sm leading-relaxed mb-5"
                  style={{
                    color: "#6ee7b7",
                    opacity: isResetting ? 0 : 1,
                    transition: "opacity 0.4s ease",
                    minHeight: "4.5rem",
                  }}
                >
                  {typedAfter}
                  {phase === "typing-after" && (
                    <span
                      className="inline-block w-px h-[14px] ml-0.5 align-middle"
                      style={{ background: "#34d399", animation: "blink 1s step-end infinite" }}
                    />
                  )}
                  {phase === "idle" && (
                    <span style={{ color: "#1e3a2e" }}>Improving your prompt...</span>
                  )}
                </p>
                <div
                  className="flex gap-2 flex-wrap"
                  style={{ opacity: phase === "done" && !isResetting ? 1 : 0, transition: "opacity 0.5s ease" }}
                >
                  {AFTER_TAGS.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{
                        background: "rgba(52,211,153,0.1)",
                        color: "#34d399",
                        border: "1px solid rgba(52,211,153,0.22)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sparkle */}
        <div className="flex md:hidden items-center justify-center mb-6">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #6C3AFF, #06B6D4)",
              boxShadow: "0 0 20px rgba(108,58,255,0.45)",
              animation: "floatBob 3s ease-in-out infinite",
            }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Tool recommendation */}
        <div
          style={{
            opacity: showTool && !isResetting ? 1 : 0,
            transform: showTool && !isResetting ? "translateY(0)" : "translateY(10px)",
            transition: "all 0.4s ease",
          }}
        >
          <div className="flex items-center justify-center">
            <div
              className="inline-flex items-center gap-3 rounded-xl px-6 py-3"
              style={{
                background: "rgba(108,58,255,0.1)",
                border: "1px solid rgba(108,58,255,0.3)",
              }}
            >
              <Compass className="w-4 h-4" style={{ color: "#a78bfa" }} />
              <span className="text-sm" style={{ color: "#c4b5fd" }}>
                Recommended:{" "}
                <span className="font-semibold text-white">ChatGPT</span>
                <span style={{ color: "#64748b" }}> - Best for fast ad copy variants</span>
              </span>
              <ArrowRight className="w-4 h-4" style={{ color: "#6C3AFF" }} />
            </div>
          </div>
        </div>

        {/* Loop progress bar */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <div
            className="h-px rounded-full overflow-hidden"
            style={{ width: "120px", background: "rgba(255,255,255,0.07)" }}
          >
            <div
              style={{
                height: "100%",
                background: "linear-gradient(90deg, #6C3AFF, #06B6D4)",
                width: phase === "done" ? "100%" : "0%",
                transition: phase === "done" ? "width 5s linear" : "width 0s",
                borderRadius: "9999px",
              }}
            />
          </div>
          <span className="text-xs font-mono" style={{ color: "#334155" }}>
            {phase === "done" ? "replaying in 10s..." : phase === "idle" ? "loading..." : "improving..."}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes floatBob {
          0%, 100% { transform: translateY(0) translateX(-50%); }
          50% { transform: translateY(-6px) translateX(-50%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </section>
  );
}