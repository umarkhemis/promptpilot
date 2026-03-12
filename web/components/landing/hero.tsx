"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Copy, ExternalLink, RefreshCw, Sparkles } from "lucide-react";

const BEFORE_TEXT = "write me a good ad for shoes";
const AFTER_TEXT =
  "Write a 50-word Instagram ad for premium running shoes targeting fitness enthusiasts aged 18-30. Tone: energetic and aspirational. Include: product benefit, social proof element, and a clear CTA.";
const TOOL_RECOMMENDATION = "🧭 Recommended: ChatGPT — Best for fast ad copy variants";

const AVATARS = ["SM", "JK", "DL", "AR", "MG"];

export function Hero() {
  const [typedBefore, setTypedBefore] = useState("");
  const [showAfter, setShowAfter] = useState(false);
  const [typedAfter, setTypedAfter] = useState("");
  const [showTool, setShowTool] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAll = useCallback(() => {
    intervalsRef.current.forEach(clearInterval);
    timeoutsRef.current.forEach(clearTimeout);
    intervalsRef.current = [];
    timeoutsRef.current = [];
  }, []);

  const startAnimation = useCallback(() => {
    clearAll();
    setIsAnimating(true);
    setTypedBefore("");
    setShowAfter(false);
    setTypedAfter("");
    setShowTool(false);

    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < BEFORE_TEXT.length) {
        setTypedBefore(BEFORE_TEXT.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typeInterval);
        const t1 = setTimeout(() => {
          setShowAfter(true);
          let j = 0;
          const typeAfterInterval = setInterval(() => {
            if (j < AFTER_TEXT.length) {
              setTypedAfter(AFTER_TEXT.slice(0, j + 1));
              j++;
            } else {
              clearInterval(typeAfterInterval);
              const t2 = setTimeout(() => {
                setShowTool(true);
                setIsAnimating(false);
              }, 300);
              timeoutsRef.current.push(t2);
            }
          }, 18);
          intervalsRef.current.push(typeAfterInterval);
        }, 800);
        timeoutsRef.current.push(t1);
      }
    }, 60);
    intervalsRef.current.push(typeInterval);
  }, [clearAll]);

  useEffect(() => {
    const timeout = setTimeout(startAnimation, 800);
    timeoutsRef.current.push(timeout);
    return () => clearAll();
  }, [startAnimation, clearAll]);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden hero-gradient-bg pt-16">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 purple-blob opacity-60 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 cyan-blob opacity-50 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-purple-900/20 to-cyan-900/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 text-slate-300 text-sm font-medium px-4 py-2 rounded-full mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-[#F59E0B]" />
          AI-powered prompt engineering
        </div>

        {/* Headline */}
        <h1 className="text-[40px] sm:text-5xl lg:text-[64px] font-extrabold text-white leading-tight max-w-4xl mx-auto mb-6">
          Stop guessing. Start prompting{" "}
          <span className="gradient-text">like a pro.</span>
        </h1>

        {/* Sub-headline */}
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
          Better prompts. Right AI tool. Perfect results — every time.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 bg-[#6C3AFF] hover:bg-[#8B5CF6] text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60 hover:scale-105"
          >
            Try it free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white font-semibold px-8 py-4 rounded-xl text-lg border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-200"
          >
            See how it works
          </a>
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-3 mb-16">
          <div className="flex -space-x-2">
            {AVATARS.map((initials, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-[#0F0F1A] flex items-center justify-center text-xs font-bold text-white"
                style={{
                  background: `hsl(${250 + i * 20}, 70%, 55%)`,
                }}
              >
                {initials}
              </div>
            ))}
          </div>
          <span className="text-slate-400 text-sm">
            ✨ Trusted by <span className="text-white font-semibold">500+</span> marketers &amp; students
          </span>
        </div>

        {/* Hero Demo Card */}
        <div className="max-w-2xl mx-auto animate-float">
          <div className="bg-[#1A1A2E]/80 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
            {/* Card Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-2 text-xs text-slate-500 font-mono">promptpilot_demo</span>
              {!isAnimating && (typedBefore || showTool) && (
                <button
                  onClick={startAnimation}
                  className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors px-2 py-0.5 rounded hover:bg-white/10"
                  aria-label="Replay demo"
                >
                  <RefreshCw className="w-3 h-3" />
                  Replay
                </button>
              )}
            </div>

            <div className="p-6 space-y-4">
              {/* Before prompt */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">
                    ❌ Your prompt
                  </span>
                </div>
                <div className="bg-[#0F0F1A] rounded-lg p-4 border border-red-500/20">
                  <p className="font-mono text-sm text-slate-400 min-h-[1.5rem]">
                    {typedBefore}
                    {!showAfter && isAnimating && (
                      <span className="inline-block w-0.5 h-4 bg-slate-400 ml-0.5 typing-cursor-blink" />
                    )}
                    {!typedBefore && !isAnimating && (
                      <span className="text-slate-600">Type your prompt...</span>
                    )}
                  </p>
                </div>
              </div>

              {/* After prompt */}
              {showAfter && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                      ✅ PromptPilot improved
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full">
                      Enhanced
                    </span>
                  </div>
                  <div className="bg-[#0F0F1A] rounded-lg p-4 border border-emerald-500/30">
                    <p className="font-mono text-sm text-emerald-300 min-h-[3rem]">
                      {typedAfter}
                      {typedAfter.length < AFTER_TEXT.length && (
                        <span className="inline-block w-0.5 h-4 bg-emerald-400 ml-0.5 typing-cursor-blink" />
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Tool recommendation */}
              {showTool && (
                <div className="flex items-center justify-between bg-[#6C3AFF]/10 border border-[#6C3AFF]/30 rounded-lg p-3 animate-slide-up">
                  <span className="text-sm text-slate-300">{TOOL_RECOMMENDATION}</span>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-md hover:bg-white/10">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-md hover:bg-white/10">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}
