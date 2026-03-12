"use client";

import { ExternalLink, Zap, ChevronRight } from "lucide-react";

interface ToolCardProps {
  name: string;
  url: string;
  reason: string;
  icon?: string;
  alternatives?: string[];
}

export function ToolCard({ name, url, reason, icon, alternatives }: ToolCardProps) {
  return (
    <div className="rounded-xl border border-brand-100 dark:border-brand-900/50 bg-brand-50 dark:bg-brand-900/20 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-brand-100 dark:border-brand-900/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            {icon ?? name.charAt(0)}
          </div>
          <div>
            <p className="text-xs font-medium text-brand-600 dark:text-brand-400 uppercase tracking-wide">
              Recommended Tool
            </p>
            <p className="font-semibold text-slate-900 dark:text-white">{name}</p>
          </div>
        </div>
      </div>

      {/* Reason */}
      <div className="px-4 py-3">
        <div className="flex items-start gap-2 mb-4">
          <Zap className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{reason}</p>
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Open {name}
          <ExternalLink className="w-4 h-4" />
        </a>

        {alternatives && alternatives.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Alternatives
            </p>
            <div className="space-y-1">
              {alternatives.map((alt) => (
                <div
                  key={alt}
                  className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  {alt}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
