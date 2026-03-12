"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TemplateCard } from "@/components/template-card";
import { useStore } from "@/lib/store";
import { getTemplates } from "@/lib/api";
import { Loader2, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  mode: "marketing" | "student";
  content: string;
}

const CATEGORIES = ["All", "Copywriting", "Social Media", "Email", "Essay", "Research", "SEO", "Other"];

export default function TemplatesPage() {
  const router = useRouter();
  const { mode, setCurrentPrompt } = useStore();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState("All");

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTemplates(
        filterMode === "all" ? undefined : filterMode,
        filterCategory === "All" ? undefined : filterCategory
      );
      setTemplates(Array.isArray(data) ? data : data.templates ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load templates");
      // Show demo templates on error
      setTemplates(DEMO_TEMPLATES);
    } finally {
      setLoading(false);
    }
  }, [filterMode, filterCategory]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  function handleUseTemplate(content: string) {
    setCurrentPrompt(content);
    router.push("/dashboard");
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Templates</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Start fast with curated prompt templates.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Mode filter */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 gap-1">
          {["all", "marketing", "student"].map((m) => (
            <button
              key={m}
              onClick={() => setFilterMode(m)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize",
                filterMode === m
                  ? "bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              )}
            >
              {m === "all" ? "All modes" : m}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border",
                filterCategory === cat
                  ? "bg-brand-500 border-brand-500 text-white"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-brand-300"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : error && templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <SearchX className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">{error}</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <SearchX className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No templates found for these filters.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <TemplateCard
              key={t.id}
              id={t.id}
              title={t.title}
              description={t.description}
              category={t.category}
              mode={t.mode}
              content={t.content}
              onUse={handleUseTemplate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Demo data shown when API is unavailable
const DEMO_TEMPLATES: Template[] = [
  {
    id: "1",
    title: "Facebook Ad Copy",
    description: "High-converting Facebook ad for a product or service with a clear CTA.",
    category: "Copywriting",
    mode: "marketing",
    content:
      "Write a compelling Facebook ad for [product/service] targeting [audience]. Include a hook, benefits, social proof, and a clear call-to-action. Tone: [friendly/professional/urgent].",
  },
  {
    id: "2",
    title: "Academic Essay Outline",
    description: "Structured essay outline with thesis, body paragraphs, and conclusion.",
    category: "Essay",
    mode: "student",
    content:
      "Create a detailed essay outline on the topic: [topic]. Include a strong thesis statement, 3 main arguments with supporting evidence, counterargument, and conclusion. Academic tone.",
  },
  {
    id: "3",
    title: "Email Newsletter",
    description: "Engaging email newsletter for your subscribers with clear sections.",
    category: "Email",
    mode: "marketing",
    content:
      "Write an email newsletter for [brand] about [topic/news]. Include subject line, preview text, intro, main content, and CTA. Brand voice: [describe voice].",
  },
  {
    id: "4",
    title: "Research Summary",
    description: "Concise summary of a research paper or topic for academic purposes.",
    category: "Research",
    mode: "student",
    content:
      "Summarize the key findings and implications of research on [topic]. Include methodology overview, main findings, limitations, and practical applications. Approximately 300 words.",
  },
  {
    id: "5",
    title: "Instagram Caption",
    description: "Eye-catching Instagram caption with hashtags and emojis.",
    category: "Social Media",
    mode: "marketing",
    content:
      "Write an Instagram caption for [product/moment/campaign]. Include an attention-grabbing first line, 2-3 sentences of value/story, call to action, and 5-10 relevant hashtags.",
  },
  {
    id: "6",
    title: "SEO Blog Post",
    description: "SEO-optimized blog post targeting a specific keyword.",
    category: "SEO",
    mode: "marketing",
    content:
      "Write a 1500-word SEO-optimized blog post targeting the keyword [keyword]. Include H2/H3 headings, meta description, introduction hook, practical tips, and conclusion with CTA.",
  },
];
