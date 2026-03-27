
"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";

export interface ScoreDimension {
  specificity: number;
  clarity: number;
  context: number;
  structure: number;
  overall: number;
}

export interface ScoreData {
  original: ScoreDimension;
  improved: ScoreDimension;
}

interface PromptScoreProps {
  scores: ScoreData | null;
  isLoading?: boolean;
}

const DIMENSIONS: { key: keyof Omit<ScoreDimension, "overall">; label: string; color: string }[] = [
  { key: "specificity", label: "Specificity", color: "#6C3AFF" },
  { key: "clarity",     label: "Clarity",     color: "#06B6D4" },
  { key: "context",     label: "Context",     color: "#34d399" },
  { key: "structure",   label: "Structure",   color: "#f59e0b" },
];

function ScoreRing({ value, size = 60, color }: { value: number; size?: number; color: string }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(value), 150);
    return () => clearTimeout(t);
  }, [value]);

  const dash = (animated / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circumference}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.85s cubic-bezier(0.4,0,0.2,1)" }} />
    </svg>
  );
}

function scoreColor(n: number) {
  if (n >= 80) return "#34d399";
  if (n >= 60) return "#f59e0b";
  return "#f87171";
}

function scoreLabel(n: number) {
  if (n >= 85) return "Excellent";
  if (n >= 70) return "Good";
  if (n >= 50) return "Fair";
  return "Weak";
}

export function PromptScore({ scores, isLoading }: PromptScoreProps) {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains("dark"))
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const surface = dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)";
  const border  = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const text    = dark ? "#e2e8f0" : "#0f172a";
  const muted   = dark ? "#475569" : "#64748b";

  if (isLoading) {
    return (
      <div className="rounded-2xl p-5 space-y-3 animate-pulse"
        style={{ background: surface, border: `1px solid ${border}` }}>
        <div className="h-4 w-28 rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-16 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }} />
          ))}
        </div>
      </div>
    );
  }

  if (!scores) return null;

  const improvement = scores.improved.overall - scores.original.overall;

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: surface, border: `1px solid ${border}` }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: `1px solid ${border}` }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.25)" }}>
            <TrendingUp className="w-3.5 h-3.5" style={{ color: "#34d399" }} />
          </div>
          <span className="text-sm font-semibold" style={{ color: text }}>Prompt Score</span>
        </div>
        {improvement > 0 && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}>
            +{improvement} pts improvement
          </span>
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* Before / After rings */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center gap-2 p-3 rounded-xl"
            style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.15)" }}>
            <div className="relative w-[60px] h-[60px]">
              <ScoreRing value={scores.original.overall} color="#f87171" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold" style={{ color: "#f87171" }}>
                  {scores.original.overall}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: muted }}>
              Before
            </span>
          </div>

          <div className="flex flex-col items-center gap-2 p-3 rounded-xl"
            style={{ background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.15)" }}>
            <div className="relative w-[60px] h-[60px]">
              <ScoreRing value={scores.improved.overall} color={scoreColor(scores.improved.overall)} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold" style={{ color: scoreColor(scores.improved.overall) }}>
                  {scores.improved.overall}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: "#34d399" }}>
              After · {scoreLabel(scores.improved.overall)}
            </span>
          </div>
        </div>

        {/* Dimension bars */}
        <div className="space-y-3">
          {DIMENSIONS.map(({ key, label, color }) => {
            const before = scores.original[key];
            const after  = scores.improved[key];
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs" style={{ color: muted }}>{label}</span>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span style={{ color: muted }}>{before}</span>
                    <span style={{ color: muted }}>→</span>
                    <span className="font-bold" style={{ color }}>{after}</span>
                  </div>
                </div>
                <div className="relative h-1.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.06)" }}>
                  {/* Ghost bar (before) */}
                  <div className="absolute left-0 top-0 h-full rounded-full opacity-25"
                    style={{ width: `${before}%`, background: color, transition: "width 0.6s ease" }} />
                  {/* Active bar (after) */}
                  <div className="absolute left-0 top-0 h-full rounded-full"
                    style={{ width: `${after}%`, background: color, transition: "width 0.8s ease 0.15s" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}