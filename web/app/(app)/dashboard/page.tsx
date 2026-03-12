"use client";

import { useState, useCallback } from "react";
import { ModeSwitcher } from "@/components/mode-switcher";
import { PromptInput } from "@/components/prompt-input";
import { PromptOutput } from "@/components/prompt-output";
import { ToolCard } from "@/components/tool-card";
import { ClarifyingQuestions } from "@/components/clarifying-questions";
import { useStore } from "@/lib/store";
import { improvePromptStream } from "@/lib/api";
import { AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const {
    mode,
    currentPrompt,
    setCurrentPrompt,
    output,
    setOutput,
    appendOutput,
    isStreaming,
    setIsStreaming,
    recommendedTool,
    setRecommendedTool,
    clarifyingQuestions,
    setClarifyingQuestions,
  } = useStore();

  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState("");
  const [showContext, setShowContext] = useState(false);

  const handleImprove = useCallback(async () => {
    if (!currentPrompt.trim() || isStreaming) return;
    setError(null);
    setOutput("");
    setRecommendedTool(null);
    setClarifyingQuestions([]);
    setIsStreaming(true);

    try {
      await improvePromptStream(
        currentPrompt,
        mode,
        context || undefined,
        (chunk) => appendOutput(chunk),
        () => setIsStreaming(false),
        (err) => {
          setError(err);
          setIsStreaming(false);
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsStreaming(false);
    }
  }, [currentPrompt, mode, context, isStreaming, setOutput, appendOutput, setIsStreaming, setRecommendedTool, setClarifyingQuestions]);

  function handleAnswers(answers: Record<string, string>) {
    const answerText = Object.entries(answers)
      .map(([q, a]) => `${q}: ${a}`)
      .join("\n");
    const enriched = `${currentPrompt}\n\nAdditional context:\n${answerText}`;
    setCurrentPrompt(enriched);
    setClarifyingQuestions([]);
    handleImprove();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Prompt Workspace</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Write your idea, we&apos;ll make it work.
          </p>
        </div>
        <ModeSwitcher />
      </div>

      {/* Context toggle */}
      <div>
        <button
          onClick={() => setShowContext(!showContext)}
          className="text-sm text-brand-500 hover:text-brand-600 font-medium transition-colors"
        >
          {showContext ? "Hide context" : "+ Add context (brand voice, subject area)"}
        </button>
        {showContext && (
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder={
              mode === "marketing"
                ? "e.g. Our brand voice is friendly and energetic. We sell premium organic coffee."
                : "e.g. I'm a junior studying Environmental Science. Focus on academic tone."
            }
            rows={3}
            className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition resize-none"
          />
        )}
      </div>

      {/* Prompt input */}
      <PromptInput
        value={currentPrompt}
        onChange={setCurrentPrompt}
        onSubmit={handleImprove}
        loading={isStreaming}
        mode={mode}
      />

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Output area */}
      {(output || isStreaming) && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <PromptOutput output={output} isStreaming={isStreaming} />
            <ClarifyingQuestions
              questions={clarifyingQuestions}
              onSubmit={handleAnswers}
              loading={isStreaming}
            />
          </div>
          {recommendedTool && (
            <div>
              <ToolCard
                name={recommendedTool.name}
                url={recommendedTool.url}
                reason={recommendedTool.reason}
                icon={recommendedTool.icon}
                alternatives={recommendedTool.alternatives}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
