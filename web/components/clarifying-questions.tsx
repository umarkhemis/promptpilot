"use client";

import { useState } from "react";
import { HelpCircle, Send, Loader2 } from "lucide-react";

interface ClarifyingQuestionsProps {
  questions: string[];
  onSubmit: (answers: Record<string, string>) => void;
  loading?: boolean;
}

export function ClarifyingQuestions({ questions, onSubmit, loading = false }: ClarifyingQuestionsProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(
    Object.fromEntries(questions.map((q, i) => [i.toString(), ""]))
  );

  if (!questions.length) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const keyed: Record<string, string> = {};
    questions.forEach((q, i) => {
      keyed[q] = answers[i.toString()] ?? "";
    });
    onSubmit(keyed);
  }

  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-100 dark:border-amber-800">
        <HelpCircle className="w-5 h-5 text-amber-500" />
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          A few questions to refine your prompt
        </span>
      </div>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {questions.map((q, i) => (
          <div key={i}>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {i + 1}. {q}
            </label>
            <input
              type="text"
              value={answers[i.toString()] ?? ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [i.toString()]: e.target.value }))}
              placeholder="Your answer…"
              className="w-full px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {loading ? "Submitting…" : "Submit Answers"}
        </button>
      </form>
    </div>
  );
}
