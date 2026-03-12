"use client";

import { useEffect, useState, useCallback } from "react";
import { getHistory } from "@/lib/api";
import { Loader2, ChevronLeft, ChevronRight, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoryEntry {
  id: string;
  raw_prompt: string;
  improved_prompt: string;
  intent?: string;
  recommended_tool?: string;
  mode: string;
  created_at: string;
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const limit = 20;

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistory(page, limit);
      setEntries(Array.isArray(data) ? data : data.items ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
      setEntries(DEMO_HISTORY);
      setTotal(DEMO_HISTORY.length);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const totalPages = Math.ceil(total / limit);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Prompt History</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          All your past prompt improvements.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : error && entries.length === 0 ? (
        <div className="text-center py-20 text-slate-500 dark:text-slate-400">{error}</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20">
          <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No history yet. Start by improving a prompt!</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                  className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full capitalize",
                          entry.mode === "marketing"
                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                            : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        )}
                      >
                        {entry.mode}
                      </span>
                      {entry.intent && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {entry.intent}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 truncate font-medium">
                      {entry.raw_prompt}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {entry.recommended_tool && (
                      <span className="text-xs bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 px-2 py-1 rounded-lg font-medium">
                        {entry.recommended_tool}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">{formatDate(entry.created_at)}</span>
                    <ExternalLink
                      className={cn(
                        "w-4 h-4 text-slate-400 transition-transform",
                        expanded === entry.id && "rotate-90"
                      )}
                    />
                  </div>
                </button>

                {expanded === entry.id && (
                  <div className="border-t border-slate-100 dark:border-slate-700 px-5 py-4 space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                        Original
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {entry.raw_prompt}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                        Improved
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {entry.improved_prompt}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const DEMO_HISTORY: HistoryEntry[] = [
  {
    id: "1",
    raw_prompt: "write me a facebook ad",
    improved_prompt:
      "Create a high-converting Facebook ad for [Product Name] targeting [Audience]. Open with a pain-point hook, highlight 3 key benefits, add social proof, and close with an urgency-driven CTA.",
    intent: "Marketing copy",
    recommended_tool: "ChatGPT",
    mode: "marketing",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "2",
    raw_prompt: "help me write an essay about climate change",
    improved_prompt:
      "Write a 5-paragraph argumentative essay on the human causes and economic consequences of climate change. Use an academic tone, cite IPCC data, and conclude with policy recommendations.",
    intent: "Academic writing",
    recommended_tool: "Claude",
    mode: "student",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];
