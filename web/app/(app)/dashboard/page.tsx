
"use client";

import { useState, useCallback, useEffect } from "react";
import { ModeSwitcher } from "@/components/mode-switcher";
import { PromptInput } from "@/components/prompt-input";
import { PromptOutput } from "@/components/prompt-output";
import { ToolCard } from "@/components/tool-card";
import { ClarifyingQuestions } from "@/components/clarifying-questions";
import { PublishModal } from "@/components/publish-modal"; 
import { PromptScore } from "@/components/prompt-score";
import { useStore } from "@/lib/store";
import { improvePromptStream, getToolRecommendation } from "@/lib/api";
import {
  AlertCircle, ChevronDown, ChevronUp,
  Sparkles, Zap, LayoutGrid, Wand2, Globe,
} from "lucide-react";

// ─── SSR-safe theme hook ──────────────────────────────────────────────────────
function useTheme() {
  const [dark, setDark] = useState(true); // safe default — avoids SSR/hydration mismatch

  useEffect(() => {
    // Sync after mount when document is available
    setDark(document.documentElement.classList.contains("dark"));

    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return { dark };
}

// ─── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({ icon: Icon, label, value, accent }: {
  icon: React.ElementType; label: string; value: string; accent: string;
}) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
        <Icon className="w-3.5 h-3.5" style={{ color: accent }} strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-xs font-bold text-white leading-tight">{value}</p>
        <p className="text-[10px] leading-tight" style={{ color: "#475569" }}>{label}</p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const {
    mode, currentPrompt, setCurrentPrompt,
    output, setOutput, appendOutput,
    isStreaming, setIsStreaming,
    recommendedTool, setRecommendedTool,
    clarifyingQuestions, setClarifyingQuestions,
  } = useStore();

  const { dark }                      = useTheme();
  const [error, setError]             = useState<string | null>(null);
  const [context, setContext]         = useState("");
  const [showContext, setShowContext] = useState(false);
  const [promptCount, setPromptCount] = useState(0);
  const [showPublish, setShowPublish] = useState(false);
  const [scores, setScores] = useState(null)
  

  useEffect(() => {
    const stored = parseInt(localStorage.getItem("pp-prompt-count") || "0", 10);
    setPromptCount(stored);
  }, []);

  const handleImprove = useCallback(async () => {
    if (!currentPrompt.trim() || isStreaming) return;
    setError(null);
    setOutput("");
    setRecommendedTool(null);
    setClarifyingQuestions([]);
    setIsStreaming(true);

    try {
      await improvePromptStream(
        currentPrompt, mode, context || undefined,
        (chunk) => appendOutput(chunk),
        async () => {
          setIsStreaming(false);
          const next = promptCount + 1;
          setPromptCount(next);
          localStorage.setItem("pp-prompt-count", String(next));
          try {
            const tool = await getToolRecommendation(currentPrompt);
            setRecommendedTool(tool);
          } catch { /* non-critical */ }
        },
        (err) => { setError(err); setIsStreaming(false); }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsStreaming(false);
    }
  }, [currentPrompt, mode, context, isStreaming, promptCount, setOutput, appendOutput, setIsStreaming, setRecommendedTool, setClarifyingQuestions]);

  const handleClear = useCallback(() => {
    setCurrentPrompt(""); setOutput(""); setRecommendedTool(null);
    setClarifyingQuestions([]); setError(null);
  }, [setCurrentPrompt, setOutput, setRecommendedTool, setClarifyingQuestions]);

  function handleAnswers(answers: Record<string, string>) {
    const answerText = Object.entries(answers).map(([q, a]) => `${q}: ${a}`).join("\n");
    setCurrentPrompt(`${currentPrompt}\n\nAdditional context:\n${answerText}`);
    setClarifyingQuestions([]);
    handleImprove();
  }

  const bg      = dark ? "#080810" : "#f8fafc";
  const surface = dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)";
  const border  = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const text    = dark ? "#e2e8f0" : "#0f172a";
  const muted   = dark ? "#475569" : "#64748b";

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: bg }}>

      {dark && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[160px]"
            style={{ background: "radial-gradient(ellipse, rgba(108,58,255,0.1) 0%, transparent 70%)" }} />
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(108,58,255,0.15)", border: "1px solid rgba(108,58,255,0.25)" }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />
              </div>
              <h1 className="text-xl font-bold" style={{ color: text, letterSpacing: "-0.02em" }}>
                Prompt Workspace
              </h1>
            </div>
            <p className="text-sm ml-9" style={{ color: muted }}>
              Write your idea - we&apos;ll turn it into a powerful prompt.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <StatPill icon={Zap}        label="Improved"  value={`${promptCount}`} accent="#6C3AFF" />
              <StatPill icon={LayoutGrid} label="Templates" value="50+"              accent="#06B6D4" />
            </div>
            <ModeSwitcher />
          </div>
        </div>

        {/* Context panel */}
        <div className="rounded-2xl overflow-hidden" style={{ background: surface, border: `1px solid ${border}` }}>
          <button onClick={() => setShowContext(!showContext)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-left"
            style={{ color: muted }}>
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-medium" style={{ color: text }}>
                Context &amp; brand voice
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "rgba(108,58,255,0.12)", color: "#a78bfa", border: "1px solid rgba(108,58,255,0.2)" }}>
                Optional
              </span>
            </div>
            {showContext ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showContext && (
            <div className="px-5 pb-4" style={{ borderTop: `1px solid ${border}` }}>
              <p className="text-xs mt-3 mb-2" style={{ color: muted }}>
                Add context so the AI tailors the improved prompt to your needs.
              </p>
              <textarea value={context} onChange={(e) => setContext(e.target.value)}
                placeholder={mode === "marketing"
                  ? "e.g. Our brand voice is friendly and energetic. We sell premium organic coffee."
                  : "e.g. I'm a junior studying Environmental Science. Focus on academic tone."}
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none transition-all duration-200"
                style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", border: `1px solid ${border}`, color: text }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(108,58,255,0.45)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(108,58,255,0.1)"; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = border; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>
          )}
        </div>

        {/* Prompt input */}
        <PromptInput
          value={currentPrompt} onChange={setCurrentPrompt}
          onSubmit={handleImprove} onClear={handleClear}
          loading={isStreaming} mode={mode}
        />

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl text-sm"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">Something went wrong</p>
              <p className="text-xs opacity-80">{error}</p>
            </div>
          </div>
        )}

        {/* Output area */}
        {(output || isStreaming) && (
          <div className="grid gap-4"
            style={{ gridTemplateColumns: recommendedTool ? "1fr 320px" : "1fr" }}>

            <div className="space-y-4 min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: border }} />
                <span className="text-xs font-semibold uppercase tracking-widest flex items-center gap-1.5" style={{ color: muted }}>
                  <Wand2 className="w-3 h-3" /> Improved Prompt
                </span>
                <div className="flex-1 h-px" style={{ background: border }} />
              </div>

              <PromptOutput output={output} isStreaming={isStreaming} />
              <ClarifyingQuestions questions={clarifyingQuestions} onSubmit={handleAnswers} loading={isStreaming} />
              <PromptScore scores={scores} isLoading={isStreaming} />


              {output && !isStreaming && (
                <button onClick={() => setShowPublish(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                  style={{ background: "rgba(108,58,255,0.1)", border: "1px solid rgba(108,58,255,0.25)", color: "#a78bfa" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(108,58,255,0.18)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(108,58,255,0.1)"; }}>
                  <Globe className="w-3.5 h-3.5" />
                  Publish to community
                </button>
              )}
            </div>

            {recommendedTool && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: border }} />
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: muted }}>Best Tool</span>
                  <div className="flex-1 h-px" style={{ background: border }} />
                </div>
                <ToolCard
                  name={recommendedTool.name} url={recommendedTool.url}
                  reason={recommendedTool.reason} icon={recommendedTool.icon}
                  alternatives={recommendedTool.alternatives} improvedPrompt={output}
                />
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!output && !isStreaming && !error && (
          <div className="rounded-2xl px-8 py-12 text-center"
            style={{ background: surface, border: `1px solid ${border}` }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(108,58,255,0.1)", border: "1px solid rgba(108,58,255,0.2)" }}>
              <Sparkles className="w-6 h-6" style={{ color: "#a78bfa" }} strokeWidth={1.5} />
            </div>
            <h3 className="font-bold text-base mb-2" style={{ color: text }}>
              Your improved prompt will appear here
            </h3>
            <p className="text-sm max-w-sm mx-auto" style={{ color: muted }}>
              Type your rough idea above, hit{" "}
              <span className="font-semibold" style={{ color: "#a78bfa" }}>Improve Prompt</span>
              , and watch the magic happen.
            </p>
            <div className="flex items-center justify-center gap-6 mt-6">
              {[{ label: "Structured", color: "#6C3AFF" }, { label: "Specific", color: "#06B6D4" }, { label: "Actionable", color: "#34d399" }]
                .map(({ label, color }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: muted }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                    {label}
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>

      {showPublish && (
        <PublishModal
          onClose={() => setShowPublish(false)}
          onPublished={() => setShowPublish(false)}
          prefillContent={output}
        />
      )}
    </div>
  );
}


