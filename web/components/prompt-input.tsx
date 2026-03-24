
"use client";

import { useRef } from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear?: () => void;   // ← clears both prompt + output
  loading?: boolean;
  mode?: "marketing" | "student";
  placeholder?: string;
}

const MAX_CHARS = 2000;

export function PromptInput({
  value,
  onChange,
  onSubmit,
  onClear,
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

  function handleClear() {
    onChange("");
    onClear?.();
    textareaRef.current?.focus();
  }

  const remaining = MAX_CHARS - value.length;
  const isNearLimit = remaining < 200;
  const isEmpty = !value.trim();

  return (
    <div className="flex flex-col gap-3">
      <div className="relative group">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? defaultPlaceholder}
          maxLength={MAX_CHARS}
          rows={6}
          disabled={loading}
          className={cn(
            "w-full resize-none px-4 py-3.5 rounded-xl border transition-all duration-200",
            "bg-white dark:bg-slate-800/60",
            "text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500",
            "text-sm leading-relaxed",
            "focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 dark:focus:border-purple-500",
            "border-slate-200 dark:border-slate-700",
            "hover:border-slate-300 dark:hover:border-slate-600",
            // leave room for both the clear button and char counter
            !isEmpty ? "pr-20" : "pr-16",
            loading && "opacity-70 cursor-not-allowed"
          )}
        />

        {/* Clear button — only shown when there's text */}
        {!isEmpty && !loading && (
          <button
            type="button"
            onClick={handleClear}
            title="Clear prompt"
            className={cn(
              "absolute top-3 right-3",
              "w-6 h-6 rounded-full flex items-center justify-center",
              "transition-all duration-150",
              "bg-slate-100 dark:bg-slate-700",
              "text-slate-400 dark:text-slate-500",
              "hover:bg-red-50 dark:hover:bg-red-900/30",
              "hover:text-red-400 dark:hover:text-red-400",
            )}
          >
            <X className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
        )}

        {/* Char counter */}
        <span
          className={cn(
            "absolute bottom-3 right-3 text-xs font-medium tabular-nums transition-colors pointer-events-none",
            isNearLimit ? "text-amber-500" : "text-slate-300 dark:text-slate-600"
          )}
        >
          {remaining}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400 dark:text-slate-500 select-none">
          Press{" "}
          <kbd className="inline-flex items-center px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
            ⌘↵
          </kbd>{" "}
          to improve
        </p>

        <button
          onClick={onSubmit}
          disabled={loading || isEmpty}
          className={cn(
            "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm",
            "text-white transition-all duration-200",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none",
            !loading && !isEmpty && "hover:-translate-y-0.5"
          )}
          style={
            loading || isEmpty
              ? { background: "#6C3AFF" }
              : {
                  background: "linear-gradient(135deg, #6C3AFF, #8B5CF6)",
                  boxShadow: "0 4px 16px rgba(108,58,255,0.35)",
                }
          }
          onMouseEnter={(e) => {
            if (!loading && !isEmpty)
              (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(108,58,255,0.55)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              loading || isEmpty ? "none" : "0 4px 16px rgba(108,58,255,0.35)";
          }}
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






