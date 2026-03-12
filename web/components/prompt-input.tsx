"use client";

import { useRef } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading?: boolean;
  mode?: "marketing" | "student";
  placeholder?: string;
}

const MAX_CHARS = 2000;

export function PromptInput({
  value,
  onChange,
  onSubmit,
  loading = false,
  mode = "student",
  placeholder,
}: PromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const defaultPlaceholder =
    mode === "marketing"
      ? "e.g. Write a Facebook ad for my coffee subscription box targeting millennials…"
      : "e.g. Help me write an essay about climate change for my AP Environmental Science class…";

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !loading) {
      onSubmit();
    }
  }

  const remaining = MAX_CHARS - value.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? defaultPlaceholder}
          maxLength={MAX_CHARS}
          rows={6}
          className={cn(
            "w-full resize-none px-4 py-3 pr-16 rounded-xl border bg-white dark:bg-slate-800",
            "text-slate-900 dark:text-white placeholder-slate-400",
            "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
            "border-slate-300 dark:border-slate-600 transition",
            "text-sm leading-relaxed"
          )}
        />
        <span
          className={cn(
            "absolute bottom-3 right-3 text-xs",
            remaining < 200 ? "text-amber-500" : "text-slate-400"
          )}
        >
          {remaining}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Tip: Press{" "}
          <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300 font-mono text-xs">
            ⌘↵
          </kbd>{" "}
          to improve
        </p>
        <button
          onClick={onSubmit}
          disabled={loading || !value.trim()}
          className={cn(
            "inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors",
            "bg-brand-500 hover:bg-brand-600 text-white",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Improving…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Improve Prompt
            </>
          )}
        </button>
      </div>
    </div>
  );
}
