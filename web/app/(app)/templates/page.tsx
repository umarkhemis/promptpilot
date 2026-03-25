
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { getTemplates } from "@/lib/api";
import { Loader2, Search, X, FileText, ArrowRight, Sparkles, Tag } from "lucide-react";

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  mode: "marketing" | "student";
  content: string;
}

function useThemeVars() {
  const [dark, setDark] = useState(true);
  useEffect(() => { setDark(localStorage.getItem("pp-theme") !== "light"); }, []);
  return {
    dark,
    bg:      dark ? "#080810"                : "#f8fafc",
    surface: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
    card:    dark ? "rgba(255,255,255,0.04)" : "#ffffff",
    border:  dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    text:    dark ? "#e2e8f0"               : "#0f172a",
    muted:   dark ? "#475569"               : "#64748b",
    hover:   dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)",
  };
}

const CATEGORIES = ["All", "Copywriting", "Social Media", "Email", "Essay", "Research", "SEO", "Video", "Other"];

const CATEGORY_COLORS: Record<string, string> = {
  Copywriting:  "#6C3AFF",
  "Social Media": "#06B6D4",
  Email:        "#f59e0b",
  Essay:        "#34d399",
  Research:     "#a78bfa",
  SEO:          "#f87171",
  Video:        "#fb923c",
  Other:        "#64748b",
};

export default function TemplatesPage() {
  const { dark, bg, surface, card, border, text, muted, hover } = useThemeVars();
  const router = useRouter();
  const { setCurrentPrompt } = useStore();

  const [templates, setTemplates]         = useState<Template[]>([]);
  const [loading, setLoading]             = useState(true);
  const [filterMode, setFilterMode]       = useState("all");
  const [filterCategory, setFilterCategory] = useState("All");
  const [search, setSearch]               = useState("");
  const [previewing, setPreviewing]       = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTemplates(
        filterMode === "all" ? undefined : filterMode,
        filterCategory === "All" ? undefined : filterCategory
      );
      setTemplates(Array.isArray(data) ? data : data.templates ?? []);
    } catch {
      setTemplates(DEMO_TEMPLATES);
    } finally {
      setLoading(false);
    }
  }, [filterMode, filterCategory]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  function handleUse(content: string) {
    setCurrentPrompt(content);
    router.push("/dashboard");
  }

  const filtered = templates.filter(t => {
    if (!search) return true;
    return t.title.toLowerCase().includes(search.toLowerCase()) ||
           t.description.toLowerCase().includes(search.toLowerCase()) ||
           t.category.toLowerCase().includes(search.toLowerCase());
  });

  const catColor = (cat: string) => CATEGORY_COLORS[cat] ?? "#64748b";

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: bg }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.25)" }}>
                <FileText className="w-3.5 h-3.5" style={{ color: "#06B6D4" }} />
              </div>
              <h1 className="text-xl font-bold" style={{ color: text, letterSpacing: "-0.02em" }}>
                Template Library
              </h1>
            </div>
            <p className="text-sm ml-9" style={{ color: muted }}>
              {filtered.length} ready-made prompts — pick one and customize.
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: muted }} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates…"
              className="pl-9 pr-9 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 w-56"
              style={{ background: surface, border: `1px solid ${border}`, color: text }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(6,182,212,0.45)"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = border; }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: muted }}>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode toggle */}
          <div className="flex items-center rounded-xl p-1 gap-0.5"
            style={{ background: surface, border: `1px solid ${border}` }}>
            {["all", "marketing", "student"].map((m) => (
              <button key={m} onClick={() => setFilterMode(m)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 capitalize"
                style={{
                  background: filterMode === m
                    ? (m === "marketing" ? "rgba(108,58,255,0.2)" : m === "student" ? "rgba(6,182,212,0.2)" : "rgba(255,255,255,0.08)")
                    : "transparent",
                  color: filterMode === m
                    ? (m === "marketing" ? "#a78bfa" : m === "student" ? "#06B6D4" : text)
                    : muted,
                  border: filterMode === m
                    ? `1px solid ${m === "marketing" ? "rgba(108,58,255,0.3)" : m === "student" ? "rgba(6,182,212,0.3)" : border}`
                    : "1px solid transparent",
                }}>
                {m === "all" ? "All modes" : m}
              </button>
            ))}
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setFilterCategory(cat)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
                style={{
                  background: filterCategory === cat
                    ? `${catColor(cat)}20`
                    : surface,
                  border: `1px solid ${filterCategory === cat ? `${catColor(cat)}40` : border}`,
                  color: filterCategory === cat ? catColor(cat) : muted,
                }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-7 h-7 animate-spin" style={{ color: "#6C3AFF" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-2xl"
            style={{ background: surface, border: `1px solid ${border}` }}>
            <Sparkles className="w-12 h-12 mb-4" style={{ color: muted, opacity: 0.4 }} />
            <p className="font-semibold mb-1" style={{ color: text }}>No templates found</p>
            <p className="text-sm" style={{ color: muted }}>Try adjusting your filters or search.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t) => (
              <div key={t.id}
                className="rounded-2xl flex flex-col overflow-hidden transition-all duration-200 group"
                style={{ background: card, border: `1px solid ${border}` }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    `${catColor(t.category)}40`;
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    `0 8px 32px ${catColor(t.category)}18`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = border;
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                {/* Card header */}
                <div className="px-5 pt-5 pb-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${catColor(t.category)}15`, border: `1px solid ${catColor(t.category)}30` }}>
                      <Tag className="w-4 h-4" style={{ color: catColor(t.category) }} strokeWidth={1.75} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{
                          background: t.mode === "marketing" ? "rgba(108,58,255,0.12)" : "rgba(6,182,212,0.12)",
                          color: t.mode === "marketing" ? "#a78bfa" : "#06B6D4",
                          border: `1px solid ${t.mode === "marketing" ? "rgba(108,58,255,0.2)" : "rgba(6,182,212,0.2)"}`,
                        }}>
                        {t.mode}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-sm mb-1.5" style={{ color: text }}>{t.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: muted }}>{t.description}</p>
                </div>

                {/* Category tag */}
                <div className="px-5 pb-4">
                  <span className="text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: catColor(t.category) }}>
                    {t.category}
                  </span>
                </div>

                {/* Preview toggle */}
                {previewing === t.id && (
                  <div className="mx-5 mb-4 px-3 py-3 rounded-xl text-xs leading-relaxed"
                    style={{ background: `${catColor(t.category)}08`, border: `1px solid ${catColor(t.category)}20`, color: muted }}>
                    {t.content}
                  </div>
                )}

                {/* Actions */}
                <div className="px-5 pb-5 mt-auto flex gap-2">
                  <button
                    onClick={() => setPreviewing(previewing === t.id ? null : t.id)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                    style={{ background: surface, border: `1px solid ${border}`, color: muted }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = hover; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = surface; }}
                  >
                    {previewing === t.id ? "Hide" : "Preview"}
                  </button>
                  <button
                    onClick={() => handleUse(t.content)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-200"
                    style={{
                      background: `linear-gradient(135deg, ${catColor(t.category)}, ${catColor(t.category)}cc)`,
                      boxShadow: `0 4px 12px ${catColor(t.category)}30`,
                    }}
                  >
                    Use template
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const DEMO_TEMPLATES = [
  { id:"1", title:"Facebook Ad Copy",      description:"High-converting Facebook ad with hook, benefits, and CTA.",          category:"Copywriting",   mode:"marketing" as const, content:"Write a compelling Facebook ad for [product/service] targeting [audience]. Include a hook, benefits, social proof, and a clear call-to-action. Tone: [friendly/professional/urgent]." },
  { id:"2", title:"Academic Essay Outline", description:"Structured essay outline with thesis, body paragraphs, and conclusion.", category:"Essay",          mode:"student"   as const, content:"Create a detailed essay outline on the topic: [topic]. Include a strong thesis statement, 3 main arguments with supporting evidence, counterargument, and conclusion. Academic tone." },
  { id:"3", title:"Email Newsletter",       description:"Engaging newsletter with clear sections and CTA.",                     category:"Email",          mode:"marketing" as const, content:"Write an email newsletter for [brand] about [topic/news]. Include subject line, preview text, intro, main content, and CTA. Brand voice: [describe voice]." },
  { id:"4", title:"Research Summary",       description:"Concise academic summary with findings and implications.",            category:"Research",       mode:"student"   as const, content:"Summarize the key findings and implications of research on [topic]. Include methodology overview, main findings, limitations, and practical applications. Approximately 300 words." },
  { id:"5", title:"Instagram Caption",      description:"Eye-catching caption with hashtags and emojis.",                      category:"Social Media",   mode:"marketing" as const, content:"Write an Instagram caption for [product/moment/campaign]. Include an attention-grabbing first line, 2-3 sentences of value/story, call to action, and 5-10 relevant hashtags." },
  { id:"6", title:"SEO Blog Post",          description:"SEO-optimized blog post targeting a specific keyword.",               category:"SEO",            mode:"marketing" as const, content:"Write a 1500-word SEO-optimized blog post targeting the keyword [keyword]. Include H2/H3 headings, meta description, introduction hook, practical tips, and conclusion with CTA." },
];