
"use client";

import { useState } from "react";
import { ExternalLink, Zap, ChevronRight, Compass, Check, Copy } from "lucide-react";

interface ToolCardProps {
  name: string;
  url: string;
  reason: string;
  icon?: string;
  alternatives?: string[];
  improvedPrompt?: string;
}

// Tools that support pre-filling via URL query param
const PREFILL_URLS: Record<string, (prompt: string) => string> = {
  perplexity: (p) => `https://perplexity.ai/search?q=${encodeURIComponent(p)}`,
  phind:      (p) => `https://phind.com/search?q=${encodeURIComponent(p)}`,
  "you.com":  (p) => `https://you.com/search?q=${encodeURIComponent(p)}`,
  bing:       (p) => `https://bing.com/search?q=${encodeURIComponent(p)}`,
  google:     (p) => `https://google.com/search?q=${encodeURIComponent(p)}`,
};

function buildLaunchUrl(name: string, fallbackUrl: string, prompt: string): string {
  const nameLower = name.toLowerCase();
  const match = Object.entries(PREFILL_URLS).find(([key]) => nameLower.includes(key));
  return match ? match[1](prompt) : fallbackUrl;
}

export function ToolCard({ name, url, reason, icon, alternatives, improvedPrompt }: ToolCardProps) {
  const [launched, setLaunched] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleOpen() {
    const launchUrl = buildLaunchUrl(name, url, improvedPrompt || "");

    // Always copy improved prompt to clipboard
    if (improvedPrompt) {
      navigator.clipboard.writeText(improvedPrompt).catch(() => {});
    }

    window.open(launchUrl, "_blank", "noopener,noreferrer");

    setLaunched(true);
    setTimeout(() => setLaunched(false), 3000);
  }

  function handleCopyOnly() {
    if (!improvedPrompt) return;
    navigator.clipboard.writeText(improvedPrompt).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Does this tool support direct URL pre-fill?
  const supportsPreFill = Object.keys(PREFILL_URLS).some((key) =>
    name.toLowerCase().includes(key)
  );

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "rgba(108,58,255,0.05)",
        border: "1px solid rgba(108,58,255,0.2)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3.5"
        style={{ borderBottom: "1px solid rgba(108,58,255,0.12)", background: "rgba(108,58,255,0.07)" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #6C3AFF, #8B5CF6)" }}
        >
          {icon ?? name.charAt(0)}
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#7c5cfc" }}>
            Recommended Tool
          </p>
          <p className="font-bold text-slate-900 dark:text-white text-sm">{name}</p>
        </div>
          {/* <img
            src="/prompt_logo.jpg"
            alt="Promptify Logo"
            className="w-4 h-4 mb-7 rounded-full object-cover"
          /> */}
      </div>

      {/* Body */}
      <div className="px-4 py-4 flex flex-col gap-4 flex-1">
        {/* Reason */}
        <div className="flex items-start gap-2.5">
          <Zap className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#6C3AFF" }} strokeWidth={2} />
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{reason}</p>
        </div>

        {/* How prompt will be delivered */}
        {improvedPrompt && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
            style={{
              background: supportsPreFill ? "rgba(52,211,153,0.08)" : "rgba(245,158,11,0.08)",
              border: `1px solid ${supportsPreFill ? "rgba(52,211,153,0.2)" : "rgba(245,158,11,0.2)"}`,
              color: supportsPreFill ? "#34d399" : "#f59e0b",
            }}
          >
            {supportsPreFill ? (
              <>
                <Check className="w-3.5 h-3.5 flex-shrink-0" />
                Prompt will open pre-filled
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 flex-shrink-0" />
                Prompt will be copied - just paste
              </>
            )}
          </div>
        )}

        {/* Open button */}
        <button
          onClick={handleOpen}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
          style={{
            background: launched
              ? "linear-gradient(135deg, #059669, #34d399)"
              : "linear-gradient(135deg, #6C3AFF, #8B5CF6)",
            boxShadow: launched
              ? "0 4px 16px rgba(52,211,153,0.3)"
              : "0 4px 16px rgba(108,58,255,0.3)",
          }}
          onMouseEnter={(e) => {
            if (!launched) {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(108,58,255,0.5)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = launched
              ? "0 4px 16px rgba(52,211,153,0.3)"
              : "0 4px 16px rgba(108,58,255,0.3)";
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          }}
        >
          {launched ? (
            <>
              <Check className="w-3.5 h-3.5" />
              {supportsPreFill ? "Opened with prompt!" : "Copied & opened!"}
            </>
          ) : (
            <>
              Open {name}
              <ExternalLink className="w-3.5 h-3.5" />
            </>
          )}
        </button>

        {/* Copy-only button (for tools without pre-fill) */}
        {improvedPrompt && !supportsPreFill && (
          <button
            onClick={handleCopyOnly}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-semibold transition-all duration-200"
            style={{
              background: copied ? "rgba(52,211,153,0.1)" : "rgba(108,58,255,0.08)",
              border: `1px solid ${copied ? "rgba(52,211,153,0.3)" : "rgba(108,58,255,0.2)"}`,
              color: copied ? "#34d399" : "#a78bfa",
            }}
          >
            {copied ? (
              <><Check className="w-3.5 h-3.5" /> Prompt copied!</>
            ) : (
              <><Copy className="w-3.5 h-3.5" /> Copy prompt only</>
            )}
          </button>
        )}

        {/* Alternatives */}
        {alternatives && alternatives.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-2 text-slate-400 dark:text-slate-500">
              Alternatives
            </p>
            <div className="space-y-1.5">
              {alternatives.map((alt) => (
                <div key={alt} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-slate-300 dark:text-slate-600" />
                  {alt}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}