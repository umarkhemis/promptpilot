
"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import {
  GitFork, Globe, Edit2, X, Check, ArrowUp,
  Bookmark, ExternalLink, Save,
} from "lucide-react";
import {
  getMyCommunityPrompts, publishPrompt, upvotePrompt,
  savePrompt, type CommunityPrompt,
} from "@/lib/api";

const BG      = "#080810";
const SURFACE = "rgba(255,255,255,0.03)";
const BORDER  = "rgba(255,255,255,0.08)";
const MUTED   = "#475569";
const TEXT    = "#e2e8f0";
const ACCENT  = "#6C3AFF";

const CATEGORIES = ["email", "seo", "coding", "social_media", "writing", "research", "study", "image"];

// ── Fork editor modal ─────────────────────────────────────────────────────────

function ForkEditor({ prompt, onClose, onSaved }: {
  prompt: CommunityPrompt;
  onClose: () => void;
  onSaved: (updated: CommunityPrompt) => void;
}) {
  const [form, setForm] = useState({
    title: prompt.title,
    description: prompt.description || "",
    content: prompt.content,
    category: prompt.category,
    mode: prompt.mode,
  });
  const [publishing, setPublishing] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [saved, setSaved]           = useState(false);

  // Save to localStorage as draft so edits persist across sessions
  useEffect(() => {
    const key = `pp-fork-draft-${prompt.id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try { setForm(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, [prompt.id]);

  function handleChange(field: string, value: string) {
    const updated = { ...form, [field]: value };
    setForm(updated);
    localStorage.setItem(`pp-fork-draft-${prompt.id}`, JSON.stringify(updated));
  }

  async function handlePublish() {
    if (!form.title.trim() || !form.content.trim()) return;
    setPublishing(true);
    setError(null);
    try {
      // publishPrompt creates a NEW community prompt — this makes the fork public
      // In a fuller implementation you'd PATCH the existing fork
      // but since forked prompts start private, publishing creates the public version
      const published = await publishPrompt({
        title: form.title,
        description: form.description || undefined,
        content: form.content,
        category: form.category,
        mode: form.mode,
      });
      localStorage.removeItem(`pp-fork-draft-${prompt.id}`);
      setSaved(true);
      setTimeout(() => onSaved(published), 800);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to publish");
    } finally {
      setPublishing(false);
    }
  }

  const inputStyle = { background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, color: TEXT };
  const inputClass = "w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all";
  const focus = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor = `${ACCENT}80`; };
  const blur  = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor = BORDER; };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.8)" }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl relative max-h-[92vh] overflow-y-auto"
        style={{ background: "#0f0f1a", border: `1px solid ${BORDER}` }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4"
          style={{ borderBottom: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-2">
            <GitFork className="w-4 h-4" style={{ color: "#34d399" }} />
            <h2 className="text-base font-bold text-white">Edit your fork</h2>
          </div>
          <button onClick={onClose} style={{ color: MUTED }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Original reference */}
        <div className="mx-6 mt-4 px-3 py-2.5 rounded-xl flex items-center gap-2"
          style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }}>
          <GitFork className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#34d399" }} />
          <p className="text-xs" style={{ color: "#34d399" }}>
            Forked from a community prompt · Edit freely, then publish your version
          </p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: MUTED }}>Title</label>
            <input value={form.title} onChange={(e) => handleChange("title", e.target.value)}
              className={inputClass} style={inputStyle} onFocus={focus} onBlur={blur}
              placeholder="Give your fork a title" />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: MUTED }}>Description</label>
            <input value={form.description} onChange={(e) => handleChange("description", e.target.value)}
              className={inputClass} style={inputStyle} onFocus={focus} onBlur={blur}
              placeholder="What makes your version different?" />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: MUTED }}>Prompt content</label>
            <textarea
              value={form.content}
              onChange={(e) => handleChange("content", e.target.value)}
              rows={7}
              className={`${inputClass} resize-none`}
              style={inputStyle}
              onFocus={focus}
              onBlur={blur}
              placeholder="Edit the prompt…"
            />
            <p className="text-[11px] mt-1" style={{ color: MUTED }}>
              Use [PLACEHOLDERS] for variable parts others can fill in.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: MUTED }}>Category</label>
              <select value={form.category} onChange={(e) => handleChange("category", e.target.value)}
                className={inputClass} style={inputStyle} onFocus={focus} onBlur={blur}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: MUTED }}>Mode</label>
              <select value={form.mode} onChange={(e) => handleChange("mode", e.target.value)}
                className={inputClass} style={inputStyle} onFocus={focus} onBlur={blur}>
                <option value="student">Student</option>
                <option value="marketing">Marketing</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>

          {error && <p className="text-xs" style={{ color: "#f87171" }}>{error}</p>}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              style={{ background: SURFACE, border: `1px solid ${BORDER}`, color: MUTED }}>
              Save as draft
            </button>
            <button
              onClick={handlePublish}
              disabled={publishing || !form.title.trim() || !form.content.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity"
              style={{
                background: saved ? "rgba(52,211,153,0.2)" : `linear-gradient(135deg, ${ACCENT}, #8B5CF6)`,
                border: saved ? "1px solid rgba(52,211,153,0.3)" : "none",
                color: saved ? "#34d399" : "white",
                opacity: publishing || !form.title.trim() || !form.content.trim() ? 0.5 : 1,
              }}>
              {publishing
                ? "Publishing…"
                : saved
                ? <><Check className="w-4 h-4" /> Published!</>
                : <><Globe className="w-4 h-4" /> Publish fork</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Fork card ─────────────────────────────────────────────────────────────────

function ForkCard({ prompt, onEdit, onChange }: {
  prompt: CommunityPrompt;
  onEdit: () => void;
  onChange: (p: CommunityPrompt) => void;
}) {
  async function handleUpvote() {
    const updated = await upvotePrompt(prompt.id);
    onChange(updated);
  }

  return (
    <div className="rounded-2xl p-5 transition-all"
      style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(52,211,153,0.25)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}>

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <GitFork className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#34d399" }} />
            <h3 className="text-sm font-semibold text-white">{prompt.title}</h3>
            <span
              className="text-[11px] px-2 py-0.5 rounded-full"
              style={{
                background: prompt.is_public ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.05)",
                color: prompt.is_public ? "#34d399" : MUTED,
              }}>
              {prompt.is_public ? "Public" : "Draft"}
            </span>
          </div>
          {prompt.description && (
            <p className="text-xs" style={{ color: MUTED }}>{prompt.description}</p>
          )}
        </div>
        <button onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 transition-all"
          style={{ background: "rgba(108,58,255,0.1)", border: "1px solid rgba(108,58,255,0.25)", color: "#a78bfa" }}>
          <Edit2 className="w-3 h-3" />
          Edit
        </button>
      </div>

      {/* Content preview */}
      <pre className="text-xs whitespace-pre-wrap leading-relaxed rounded-xl p-3 mb-4 line-clamp-3"
        style={{ background: "rgba(255,255,255,0.02)", color: "#94a3b8", fontFamily: "inherit" }}>
        {prompt.content}
      </pre>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-xs" style={{ color: MUTED }}>
        <span className="flex items-center gap-1">
          <ArrowUp className="w-3 h-3" /> {prompt.upvote_count}
        </span>
        <span className="flex items-center gap-1">
          <Bookmark className="w-3 h-3" /> {prompt.save_count}
        </span>
        <span className="capitalize px-1.5 py-0.5 rounded"
          style={{ background: "rgba(255,255,255,0.04)" }}>
          {prompt.category}
        </span>
        <span className="ml-auto text-[11px]">
          {new Date(prompt.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MyForksPage() {
  const { user } = useStore();
  const [prompts, setPrompts]   = useState<CommunityPrompt[]>([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState<CommunityPrompt | null>(null);

  useEffect(() => {
    getMyCommunityPrompts()
      .then((all) => {
        // Show only forked prompts — those with a forked_from reference
        setPrompts(all.filter((p) => p.forked_from !== null));
      })
      .finally(() => setLoading(false));
  }, []);

  function handleChange(updated: CommunityPrompt) {
    setPrompts((prev) => prev.map((p) => p.id === updated.id ? updated : p));
  }

  function handlePublished(published: CommunityPrompt) {
    // Mark the original fork as public in our local list
    if (editing) {
      setPrompts((prev) =>
        prev.map((p) => p.id === editing.id ? { ...p, is_public: true } : p)
      );
    }
    setEditing(null);
  }

  const draftCount   = prompts.filter((p) => !p.is_public).length;
  const publishedCount = prompts.filter((p) => p.is_public).length;

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)" }}>
              <GitFork className="w-3.5 h-3.5" style={{ color: "#34d399" }} />
            </div>
            <h1 className="text-xl font-bold text-white" style={{ letterSpacing: "-0.02em" }}>
              My forks
            </h1>
          </div>
          <p className="text-sm ml-9" style={{ color: MUTED }}>
            Prompts you&apos;ve forked from the community. Edit and publish your version.
          </p>

          {/* Stats pills */}
          {prompts.length > 0 && (
            <div className="flex gap-3 mt-4 ml-9">
              <span className="text-xs px-3 py-1.5 rounded-lg"
                style={{ background: "rgba(255,255,255,0.04)", color: MUTED, border: `1px solid ${BORDER}` }}>
                {draftCount} draft{draftCount !== 1 ? "s" : ""}
              </span>
              <span className="text-xs px-3 py-1.5 rounded-lg"
                style={{ background: "rgba(52,211,153,0.08)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}>
                {publishedCount} published
              </span>
            </div>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-2xl animate-pulse"
                style={{ background: SURFACE, border: `1px solid ${BORDER}` }} />
            ))}
          </div>
        ) : prompts.length === 0 ? (
          <div className="text-center py-20 rounded-2xl"
            style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
              <GitFork className="w-6 h-6" style={{ color: "#34d399" }} strokeWidth={1.5} />
            </div>
            <h3 className="font-bold text-base mb-2 text-white">No forks yet</h3>
            <p className="text-sm mb-5" style={{ color: MUTED }}>
              Browse the community feed and fork a prompt you like.
            </p>
            <a href="/community"
              className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, #8B5CF6)` }}>
              Browse community
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {prompts.map((p) => (
              <ForkCard
                key={p.id}
                prompt={p}
                onEdit={() => setEditing(p)}
                onChange={handleChange}
              />
            ))}
          </div>
        )}
      </main>

      {editing && (
        <ForkEditor
          prompt={editing}
          onClose={() => setEditing(null)}
          onSaved={handlePublished}
        />
      )}
    </div>
  );
}