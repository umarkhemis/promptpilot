
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useStore } from "@/lib/store";
import { publishPrompt, type CommunityPrompt } from "@/lib/api";

const CATEGORIES = ["email", "seo", "coding", "social_media", "writing", "research", "study", "image", "video", "ads", "other"];

const ACCENT  = "#6C3AFF";
const BORDER  = "rgba(255,255,255,0.08)";
const SURFACE = "rgba(255,255,255,0.03)";
const MUTED   = "#475569";
const TEXT    = "#e2e8f0";

interface PublishModalProps {
  onClose: () => void;
  onPublished: (p: CommunityPrompt) => void;
  prefillContent?: string;
}

export function PublishModal({ onClose, onPublished, prefillContent }: PublishModalProps) {
  const { mode } = useStore();
  const [form, setForm] = useState({
    title: "",
    description: "",
    content: prefillContent || "",
    category: "writing",
    mode: mode || "student",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handlePublish() {
    if (!form.title.trim() || !form.content.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const p = await publishPrompt(form);
      onPublished(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to publish");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = { background: SURFACE, border: `1px solid ${BORDER}`, color: TEXT };
  const inputClass = "w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200";
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = `${ACCENT}80`;
    e.currentTarget.style.boxShadow = `0 0 0 3px rgba(108,58,255,0.08)`;
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = BORDER;
    e.currentTarget.style.boxShadow = "none";
  };

  const field = (label: string, node: React.ReactNode) => (
    <div className="mb-4">
      <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
        style={{ color: MUTED }}>{label}</label>
      {node}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6 relative max-h-[90vh] overflow-y-auto"
        style={{ background: "#0f0f1a", border: `1px solid ${BORDER}`, boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 transition-colors hover:text-white"
          style={{ color: MUTED }}>
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-base font-bold text-white mb-1">Publish to community</h2>
        <p className="text-sm mb-5" style={{ color: MUTED }}>
          Share your prompt with the world. Others can upvote, save, and fork it.
        </p>

        {field("Title *", (
          <input value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Cold email that actually converts"
            className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
        ))}

        {field("Description (optional)", (
          <input value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What does this prompt do?"
            className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
        ))}

        {field("Prompt content *", (
          <textarea value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Your prompt text… use [PLACEHOLDERS] for variable parts"
            rows={5} className={`${inputClass} resize-none`} style={inputStyle}
            onFocus={onFocus} onBlur={onBlur} />
        ))}

        <div className="grid grid-cols-2 gap-4">
          {field("Category", (
            <select value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.replace("_", " ")}</option>
              ))}
            </select>
          ))}
          {field("Mode", (
            <select value={form.mode}
              onChange={(e) => setForm({ ...form, mode: e.target.value })}
              className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
              <option value="student">Student</option>
              <option value="marketing">Marketing</option>
              <option value="both">Both</option>
            </select>
          ))}
        </div>

        {error && (
          <p className="text-xs mb-3 px-3 py-2 rounded-lg"
            style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </p>
        )}

        <button
          onClick={handlePublish}
          disabled={loading || !form.title.trim() || !form.content.trim()}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(135deg, ${ACCENT}, #8B5CF6)`,
            boxShadow: "0 4px 16px rgba(108,58,255,0.3)",
          }}
        >
          {loading ? "Publishing…" : "Publish prompt"}
        </button>
      </div>
    </div>
  );
}