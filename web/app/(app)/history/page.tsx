
"use client";

import { useEffect, useState, useCallback } from "react";
import { getHistory } from "@/lib/api";
import {
  Loader2, ChevronLeft, ChevronRight, Clock,
  Copy, Check, ArrowUpRight, Wand2, Hash,
  Search, X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";

interface HistoryEntry {
  id: string;
  raw_prompt: string;
  improved_prompt: string;
  intent?: string;
  recommended_tool?: string;
  mode: "marketing" | "student";
  created_at: string;
}

function useThemeVars() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const stored = localStorage.getItem("pp-theme");
    setDark(stored !== "light");
  }, []);
  return {
    dark,
    bg:      dark ? "#080810"                      : "#f8fafc",
    surface: dark ? "rgba(255,255,255,0.03)"        : "rgba(0,0,0,0.03)",
    card:    dark ? "rgba(255,255,255,0.04)"        : "#ffffff",
    border:  dark ? "rgba(255,255,255,0.08)"        : "rgba(0,0,0,0.08)",
    text:    dark ? "#e2e8f0"                       : "#0f172a",
    muted:   dark ? "#475569"                       : "#64748b",
    hover:   dark ? "rgba(255,255,255,0.05)"        : "rgba(0,0,0,0.03)",
  };
}

const LIMIT = 15;

export default function HistoryPage() {
  const { dark, bg, surface, card, border, text, muted, hover } = useThemeVars();
  const { setCurrentPrompt } = useStore();
  const router = useRouter();

  const [entries, setEntries]   = useState<HistoryEntry[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied]     = useState<string | null>(null);
  const [search, setSearch]     = useState("");

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistory(page, LIMIT);
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

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const totalPages = Math.ceil(total / LIMIT);

  function formatDate(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000)    return "Just now";
    if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function handleCopy(id: string, text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleReuse(prompt: string) {
    setCurrentPrompt(prompt);
    router.push("/dashboard");
  }

  const filtered = entries.filter(e =>
    !search || e.raw_prompt.toLowerCase().includes(search.toLowerCase()) ||
    e.improved_prompt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: bg }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(108,58,255,0.15)", border: "1px solid rgba(108,58,255,0.25)" }}>
                <Clock className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />
              </div>
              <h1 className="text-xl font-bold" style={{ color: text, letterSpacing: "-0.02em" }}>
                Prompt History
              </h1>
            </div>
            <p className="text-sm ml-9" style={{ color: muted }}>
              All your past prompt improvements - click any to expand.
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: muted }} />
            <input
              type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search history…"
              className="pl-9 pr-9 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 w-56"
              style={{ background: surface, border: `1px solid ${border}`, color: text }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(108,58,255,0.45)"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = border; }}
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: muted }}>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-7 h-7 animate-spin" style={{ color: "#6C3AFF" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl"
            style={{ background: surface, border: `1px solid ${border}` }}>
            <Clock className="w-12 h-12 mb-4" style={{ color: muted, opacity: 0.4 }} />
            <p className="font-semibold mb-1" style={{ color: text }}>
              {search ? "No results found" : "No history yet"}
            </p>
            <p className="text-sm" style={{ color: muted }}>
              {search ? "Try a different search term." : "Start by improving a prompt on the Workspace."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((entry) => (
              <div key={entry.id} className="rounded-2xl overflow-hidden transition-all duration-200"
                style={{ background: card, border: `1px solid ${border}` }}>

                {/* Row header */}
                <button
                  onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                  className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 transition-colors duration-150"
                  style={{ color: text }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = hover; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      {/* Mode badge */}
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{
                          background: entry.mode === "marketing"
                            ? "rgba(108,58,255,0.12)" : "rgba(6,182,212,0.12)",
                          color: entry.mode === "marketing" ? "#a78bfa" : "#06B6D4",
                          border: `1px solid ${entry.mode === "marketing" ? "rgba(108,58,255,0.2)" : "rgba(6,182,212,0.2)"}`,
                        }}>
                        {entry.mode}
                      </span>
                      {entry.intent && (
                        <span className="text-xs" style={{ color: muted }}>{entry.intent}</span>
                      )}
                    </div>
                    <p className="text-sm font-medium truncate" style={{ color: text }}>
                      {entry.raw_prompt}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {entry.recommended_tool && (
                      <span className="text-xs px-2.5 py-1 rounded-lg font-semibold hidden sm:block"
                        style={{ background: "rgba(108,58,255,0.1)", color: "#a78bfa", border: "1px solid rgba(108,58,255,0.2)" }}>
                        {entry.recommended_tool}
                      </span>
                    )}
                    <span className="text-xs whitespace-nowrap" style={{ color: muted }}>
                      {formatDate(entry.created_at)}
                    </span>
                    <div className="w-5 h-5 flex items-center justify-center transition-transform duration-200"
                      style={{ transform: expanded === entry.id ? "rotate(90deg)" : "none", color: muted }}>
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>

                {/* Expanded body */}
                {expanded === entry.id && (
                  <div className="px-5 pb-5 space-y-4"
                    style={{ borderTop: `1px solid ${border}` }}>

                    {/* Original */}
                    <div className="pt-4">
                      <p className="text-[11px] font-semibold uppercase tracking-widest mb-2"
                        style={{ color: muted }}>Original prompt</p>
                      <div className="rounded-xl p-4"
                        style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.15)" }}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#f87171", opacity: 0.8 }}>
                          {entry.raw_prompt}
                        </p>
                      </div>
                    </div>

                    {/* Improved */}
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-widest mb-2"
                        style={{ color: muted }}>Improved prompt</p>
                      <div className="rounded-xl p-4"
                        style={{ background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.15)" }}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#6ee7b7" }}>
                          {entry.improved_prompt}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleCopy(entry.id, entry.improved_prompt)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                        style={{
                          background: copied === entry.id ? "rgba(52,211,153,0.12)" : surface,
                          border: `1px solid ${copied === entry.id ? "rgba(52,211,153,0.3)" : border}`,
                          color: copied === entry.id ? "#34d399" : muted,
                        }}
                      >
                        {copied === entry.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied === entry.id ? "Copied!" : "Copy improved"}
                      </button>

                      <button
                        onClick={() => handleReuse(entry.improved_prompt)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 text-white"
                        style={{
                          background: "linear-gradient(135deg, #6C3AFF, #8B5CF6)",
                          boxShadow: "0 4px 12px rgba(108,58,255,0.3)",
                        }}
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        Use in Workspace
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30"
              style={{ background: surface, border: `1px solid ${border}`, color: muted }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm" style={{ color: muted }}>
              Page <span style={{ color: text, fontWeight: 600 }}>{page}</span> of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30"
              style={{ background: surface, border: `1px solid ${border}`, color: muted }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const DEMO_HISTORY: HistoryEntry[] = [
  {
    id: "1",
    raw_prompt: "write me a facebook ad",
    improved_prompt: "Create a high-converting Facebook ad for [Product Name] targeting [Audience]. Open with a pain-point hook, highlight 3 key benefits, add social proof, and close with an urgency-driven CTA.",
    intent: "ads",
    recommended_tool: "ChatGPT",
    mode: "marketing",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "2",
    raw_prompt: "help me write an essay about climate change",
    improved_prompt: "Write a 5-paragraph argumentative essay on the human causes and economic consequences of climate change. Use an academic tone, cite IPCC data, and conclude with policy recommendations.",
    intent: "academic",
    recommended_tool: "Claude",
    mode: "student",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];