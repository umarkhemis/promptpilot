"use client";

import { useState } from "react";
import { Copy, Check, Hash } from "lucide-react";
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
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
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
              "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors",
              copied
                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
            )}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p
          className={cn(
            "text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap",
            isStreaming && output && "typing-cursor"
          )}
        >
          {output || (
            <span className="text-slate-400 dark:text-slate-500 italic">
              Your improved prompt will appear here…
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
