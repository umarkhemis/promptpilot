"use client";

import { ArrowRight, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  mode: "marketing" | "student";
  content: string;
  onUse: (content: string) => void;
}

const modeColors = {
  marketing: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  student: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
};

export function TemplateCard({ title, description, category, mode, content, onUse }: TemplateCardProps) {
  return (
    <div className="flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md transition-all overflow-hidden group">
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug">
            {title}
          </h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-3">
          {description}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full",
              modeColors[mode]
            )}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            <Tag className="w-3 h-3" />
            {category}
          </span>
        </div>
      </div>
      <div className="px-5 pb-4">
        <button
          onClick={() => onUse(content)}
          className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded-lg transition-colors group-hover:border-brand-400"
        >
          Use Template
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
