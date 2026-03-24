
"use client";

import { useState } from "react";
import { Copy, Check, Hash, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptOutputProps {
  output: string;
  isStreaming?: boolean;
  tokenCount?: number;
}

export function PromptOutput({ output, isStreaming = false, tokenCount }: PromptOutputProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!output && !isStreaming) return null;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2.5">
          {isStreaming ? (
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                background: "#6C3AFF",
                boxShadow: "0 0 6px #6C3AFF",
                animation: "pulse 1.2s ease-in-out infinite",
              }}
            />
          ) : (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#34d399" }} />
          )}
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {isStreaming ? "Generating improved prompt…" : "Improved Prompt"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {tokenCount !== undefined && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Hash className="w-3.5 h-3.5" />
              {tokenCount} tokens
            </div>
          )}
          <button
            onClick={handleCopy}
            disabled={!output}
            className={cn(
              "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200",
              copied
                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600",
              !output && "opacity-40 cursor-not-allowed"
            )}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {output ? (
          <p
            className={cn(
              "text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap",
              isStreaming && "after:content-['|'] after:ml-0.5 after:animate-pulse after:text-purple-500"
            )}
          >
            {output}
          </p>
        ) : (
          <p className="text-sm text-slate-400 dark:text-slate-500 italic">
            Your improved prompt will appear here…
          </p>
        )}
      </div>

      {/* Bottom progress bar while streaming */}
      {isStreaming && (
        <div className="h-0.5 w-full overflow-hidden" style={{ background: "rgba(108,58,255,0.1)" }}>
          <div
            className="h-full"
            style={{
              background: "linear-gradient(90deg, #6C3AFF, #06B6D4)",
              animation: "progressPulse 1.5s ease-in-out infinite",
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes progressPulse {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 60%; margin-left: 20%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}


