
"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import {
  Globe, ArrowUp, Bookmark, GitFork, Plus, Search,
  Flame, Clock, X, Copy, Check,
} from "lucide-react";
import {
  getCommunityPrompts, upvotePrompt, savePrompt,
  forkPrompt, type CommunityPrompt,
} from "@/lib/api";
import { PublishModal } from "@/components/publish-modal"; // ✅ correct import
import Link from "next/link";

// ─── SSR-safe theme hook ──────────────────────────────────────────────────────
function useTheme() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return { dark };
}

const CATEGORIES = ["all", "email", "seo", "coding", "social_media", "writing", "research", "study", "image", "video", "ads"];

// ── Feed card ─────────────────────────────────────────────────────────────────
function FeedCard({ prompt, currentUserId, onChange, dark }: {
  prompt: CommunityPrompt;
  currentUserId: string;
  onChange: (updated: CommunityPrompt) => void;
  dark: boolean;
}) {
  const [copied, setCopied]           = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const isOwn = prompt.user_id === currentUserId;

  const surface = dark ? "rgba(255,255,255,0.03)" : "#ffffff";
  const border  = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const muted   = dark ? "#475569" : "#64748b";
  const text    = dark ? "#e2e8f0" : "#0f172a";

  async function act(action: "upvote" | "save" | "fork") {
    setLoadingAction(action);
    try {
      let updated: CommunityPrompt;
      if (action === "upvote")      updated = await upvotePrompt(prompt.id);
      else if (action === "save")   updated = await savePrompt(prompt.id);
      else                          updated = await forkPrompt(prompt.id);
      onChange(updated);
    } catch {
      // silently fail — non-critical action
    } finally {
      setLoadingAction(null);
    }
  }

  function copy() {
    navigator.clipboard.writeText(prompt.content).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="rounded-2xl p-5 transition-all duration-200"
      style={{ background: surface, border: `1px solid ${border}` }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(108,58,255,0.25)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = border)}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-sm font-semibold" style={{ color: text }}>{prompt.title}</h3>
            {prompt.forked_from && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(108,58,255,0.1)", color: "#a78bfa" }}>
                fork
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/profile/${prompt.user_id}`}
              className="text-xs transition-colors hover:text-white"
              style={{ color: muted }}>
              @{prompt.author_email.split("@")[0]}
            </Link>
            <span style={{ color: muted }} className="text-xs">·</span>
            <span className="text-xs capitalize px-1.5 py-0.5 rounded"
              style={{ background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", color: muted }}>
              {prompt.category.replace("_", " ")}
            </span>
            <span className="text-xs capitalize px-1.5 py-0.5 rounded"
              style={{
                background: prompt.mode === "marketing" ? "rgba(108,58,255,0.1)" : "rgba(6,182,212,0.1)",
                color: prompt.mode === "marketing" ? "#a78bfa" : "#06B6D4",
              }}>
              {prompt.mode}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      {prompt.description && (
        <p className="text-xs mb-3 leading-relaxed" style={{ color: muted }}>{prompt.description}</p>
      )}

      {/* Content preview */}
      <div className="mb-4 rounded-xl p-3"
        style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", border: `1px solid ${border}` }}>
        <pre className="text-xs whitespace-pre-wrap leading-relaxed line-clamp-4"
          style={{ color: dark ? "#94a3b8" : "#64748b", fontFamily: "inherit" }}>
          {prompt.content}
        </pre>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <ActionBtn icon={<ArrowUp className="w-3.5 h-3.5" />}
          count={prompt.upvote_count} active={prompt.has_upvoted}
          activeColor="#a78bfa" loading={loadingAction === "upvote"}
          onClick={() => act("upvote")} label="Upvote" dark={dark} />

        <ActionBtn icon={<Bookmark className="w-3.5 h-3.5" />}
          count={prompt.save_count} active={prompt.has_saved}
          activeColor="#06B6D4" loading={loadingAction === "save"}
          onClick={() => act("save")} label="Save" dark={dark} />

        {!isOwn && (
          <ActionBtn icon={<GitFork className="w-3.5 h-3.5" />}
            count={prompt.fork_count} active={false}
            activeColor="#34d399" loading={loadingAction === "fork"}
            onClick={() => act("fork")} label="Fork" dark={dark} />
        )}

        <button onClick={copy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ml-auto transition-all duration-200"
          style={{
            background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
            border: `1px solid ${border}`,
            color: copied ? "#34d399" : muted,
          }}>
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

function ActionBtn({ icon, count, active, activeColor, loading, onClick, label, dark }: {
  icon: React.ReactNode; count: number; active: boolean; activeColor: string;
  loading: boolean; onClick: () => void; label: string; dark: boolean;
}) {
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const muted  = dark ? "#475569" : "#64748b";
  return (
    <button onClick={onClick} disabled={loading} title={label}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
      style={{
        background: active ? `${activeColor}18` : dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
        border: `1px solid ${active ? `${activeColor}40` : border}`,
        color: active ? activeColor : muted,
        opacity: loading ? 0.5 : 1,
      }}>
      {icon}{count}
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CommunityPage() {
  const { user, mode } = useStore();
  const { dark }       = useTheme();

  const [prompts, setPrompts]       = useState<CommunityPrompt[]>([]);
  const [loading, setLoading]       = useState(true);
  const [sort, setSort]             = useState<"top" | "new">("top");
  const [category, setCategory]     = useState("all");
  const [search, setSearch]         = useState("");
  const [showPublish, setShowPublish] = useState(false);

  const currentUserId = user?.id ?? "";

  const bg      = dark ? "#080810" : "#f8fafc";
  const surface = dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)";
  const border  = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const text    = dark ? "#e2e8f0" : "#0f172a";
  const muted   = dark ? "#475569" : "#64748b";

  useEffect(() => {
    setLoading(true);
    getCommunityPrompts({
      sort,
      category: category !== "all" ? category : undefined,
      mode: mode !== "student" ? mode : undefined,
    })
      .then(setPrompts)
      .catch(() => setPrompts([]))
      .finally(() => setLoading(false));
  }, [sort, category, mode]);

  function handleChange(updated: CommunityPrompt) {
    setPrompts((prev) => prev.map((p) => p.id === updated.id ? updated : p));
  }

  function handlePublished(p: CommunityPrompt) {
    setPrompts((prev) => [p, ...prev]);
    setShowPublish(false);
  }

  const filtered = prompts.filter(
    (p) => !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: bg }}>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(240,153,123,0.15)", border: "1px solid rgba(240,153,123,0.25)" }}>
                <Globe className="w-3.5 h-3.5" style={{ color: "#F0997B" }} />
              </div>
              <h1 className="text-xl font-bold" style={{ color: text, letterSpacing: "-0.02em" }}>
                Community
              </h1>
            </div>
            <p className="text-sm ml-9" style={{ color: muted }}>
              Discover, upvote, and fork prompts from the community.
            </p>
          </div>
          <button onClick={() => setShowPublish(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #6C3AFF, #8B5CF6)",
              boxShadow: "0 4px 16px rgba(108,58,255,0.3)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(108,58,255,0.5)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(108,58,255,0.3)"; }}>
            <Plus className="w-4 h-4" />
            Publish
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: muted }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search community prompts…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
              style={{ background: surface, border: `1px solid ${border}`, color: text }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(108,58,255,0.45)")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = border)} />
          </div>
          <div className="flex gap-2">
            {([["top", Flame], ["new", Clock]] as const).map(([s, Icon]) => (
              <button key={s} onClick={() => setSort(s)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all duration-200"
                style={{
                  background: sort === s ? "rgba(108,58,255,0.15)" : surface,
                  border: `1px solid ${sort === s ? "rgba(108,58,255,0.3)" : border}`,
                  color: sort === s ? "#a78bfa" : muted,
                }}>
                <Icon className="w-3.5 h-3.5" />{s}
              </button>
            ))}
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200"
              style={{
                background: category === cat ? "rgba(108,58,255,0.15)" : surface,
                border: `1px solid ${category === cat ? "rgba(108,58,255,0.3)" : border}`,
                color: category === cat ? "#a78bfa" : muted,
              }}>
              {cat === "all" ? "All" : cat.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Feed */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-2xl animate-pulse"
                style={{ background: surface, border: `1px solid ${border}` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 rounded-2xl"
            style={{ background: surface, border: `1px solid ${border}` }}>
            <Globe className="w-10 h-10 mx-auto mb-3" style={{ color: muted, opacity: 0.4 }} strokeWidth={1.5} />
            <p className="text-sm font-semibold mb-1" style={{ color: text }}>
              {search ? "No results found" : "Nothing here yet"}
            </p>
            <p className="text-xs mb-5" style={{ color: muted }}>
              {search ? "Try a different search." : "Be the first to publish a prompt."}
            </p>
            {!search && (
              <button onClick={() => setShowPublish(true)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #6C3AFF, #8B5CF6)" }}>
                Publish first prompt
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((p) => (
              <FeedCard key={p.id} prompt={p} currentUserId={currentUserId}
                onChange={handleChange} dark={dark} />
            ))}
          </div>
        )}
      </main>

      {showPublish && (
        <PublishModal
          onClose={() => setShowPublish(false)}
          onPublished={handlePublished}
        />
      )}
    </div>
  );
}






























// "use client";

// import { useState, useEffect } from "react";
// import { useStore } from "@/lib/store";
// import {
//   Globe, ArrowUp, Bookmark, GitFork, Plus, Search,
//   Flame, Clock, X, ChevronRight, Copy, Check,
// } from "lucide-react";
// import {
//   getCommunityPrompts, upvotePrompt, savePrompt,
//   forkPrompt, publishPrompt, deleteCommunityPrompt,
//   type CommunityPrompt,
// } from "@/lib/api";
// import Link from "next/link";

// const BG      = "#080810";
// const SURFACE = "rgba(255,255,255,0.03)";
// const BORDER  = "rgba(255,255,255,0.08)";
// const MUTED   = "#475569";
// const TEXT    = "#e2e8f0";
// const ACCENT  = "#6C3AFF";

// const CATEGORIES = ["all", "email", "seo", "coding", "social_media", "writing", "research", "study", "image"];

// // ── Publish modal ─────────────────────────────────────────────────────────────

// function PublishModal({ onClose, onPublished, prefillContent }: {
//   onClose: () => void;
//   onPublished: (p: CommunityPrompt) => void;
//   prefillContent?: string;
// }) {
//   const { mode } = useStore();
//   const [form, setForm] = useState({
//     title: "",
//     description: "",
//     content: prefillContent || "",
//     category: "writing",
//     mode: mode || "student",
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   async function handlePublish() {
//     if (!form.title.trim() || !form.content.trim()) return;
//     setLoading(true);
//     try {
//       const p = await publishPrompt(form);
//       onPublished(p);
//     } catch (e) {
//       setError(e instanceof Error ? e.message : "Failed to publish");
//     } finally {
//       setLoading(false);
//     }
//   }

//   const field = (label: string, node: React.ReactNode) => (
//     <div className="mb-4">
//       <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
//         style={{ color: MUTED }}>{label}</label>
//       {node}
//     </div>
//   );

//   const inputStyle = {
//     background: SURFACE, border: `1px solid ${BORDER}`, color: TEXT,
//   };
//   const inputClass = "w-full px-4 py-2.5 rounded-xl text-sm outline-none";
//   const focusHandler = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     e.currentTarget.style.borderColor = `${ACCENT}80`;
//   };
//   const blurHandler = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     e.currentTarget.style.borderColor = BORDER;
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
//       style={{ background: "rgba(0,0,0,0.75)" }} onClick={onClose}>
//       <div className="w-full max-w-lg rounded-2xl p-6 relative max-h-[90vh] overflow-y-auto"
//         style={{ background: "#0f0f1a", border: `1px solid ${BORDER}` }}
//         onClick={(e) => e.stopPropagation()}>
//         <button onClick={onClose} className="absolute top-4 right-4" style={{ color: MUTED }}>
//           <X className="w-4 h-4" />
//         </button>
//         <h2 className="text-base font-bold text-white mb-1">Publish to community</h2>
//         <p className="text-sm mb-5" style={{ color: MUTED }}>
//           Share your prompt with the world. Others can upvote, save, and fork it.
//         </p>

//         {field("Title", (
//           <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
//             placeholder="e.g. Cold email that actually converts"
//             className={inputClass} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} />
//         ))}
//         {field("Description (optional)", (
//           <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
//             placeholder="What does this prompt do?"
//             className={inputClass} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} />
//         ))}
//         {field("Prompt content", (
//           <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
//             placeholder="Your prompt text here… use [PLACEHOLDERS] for variable parts"
//             rows={5} className={`${inputClass} resize-none`} style={inputStyle}
//             onFocus={focusHandler} onBlur={blurHandler} />
//         ))}
//         <div className="grid grid-cols-2 gap-4">
//           {field("Category", (
//             <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
//               className={inputClass} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler}>
//               {CATEGORIES.filter((c) => c !== "all").map((c) => (
//                 <option key={c} value={c}>{c.replace("_", " ")}</option>
//               ))}
//             </select>
//           ))}
//           {field("Mode", (
//             <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}
//               className={inputClass} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler}>
//               <option value="student">Student</option>
//               <option value="marketing">Marketing</option>
//               <option value="both">Both</option>
//             </select>
//           ))}
//         </div>

//         {error && <p className="text-xs mb-3" style={{ color: "#f87171" }}>{error}</p>}
//         <button onClick={handlePublish}
//           disabled={loading || !form.title.trim() || !form.content.trim()}
//           className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity"
//           style={{
//             background: `linear-gradient(135deg, ${ACCENT}, #8B5CF6)`,
//             opacity: loading || !form.title.trim() || !form.content.trim() ? 0.5 : 1,
//           }}>
//           {loading ? "Publishing…" : "Publish prompt"}
//         </button>
//       </div>
//     </div>
//   );
// }

// // ── Prompt feed card ──────────────────────────────────────────────────────────

// function FeedCard({ prompt, currentUserId, onChange }: {
//   prompt: CommunityPrompt;
//   currentUserId: string;
//   onChange: (updated: CommunityPrompt) => void;
// }) {
//   const [copied, setCopied] = useState(false);
//   const [loadingAction, setLoadingAction] = useState<string | null>(null);
//   const isOwn = prompt.user_id === currentUserId;

//   async function act(action: "upvote" | "save" | "fork") {
//     setLoadingAction(action);
//     try {
//       let updated: CommunityPrompt;
//       if (action === "upvote") updated = await upvotePrompt(prompt.id);
//       else if (action === "save") updated = await savePrompt(prompt.id);
//       else updated = await forkPrompt(prompt.id);
//       onChange(updated);
//     } finally {
//       setLoadingAction(null);
//     }
//   }

//   function copy() {
//     navigator.clipboard.writeText(prompt.content);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   }

//   const authorName = prompt.author_email.split("@")[0];

//   return (
//     <div className="rounded-2xl p-5 transition-all duration-150"
//       style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
//       onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(108,58,255,0.25)")}
//       onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}>

//       {/* Top row */}
//       <div className="flex items-start justify-between gap-3 mb-3">
//         <div className="flex-1 min-w-0">
//           <div className="flex items-center gap-2 mb-1 flex-wrap">
//             <h3 className="text-sm font-semibold text-white">{prompt.title}</h3>
//             {prompt.forked_from && (
//               <span className="text-[11px] px-1.5 py-0.5 rounded-full"
//                 style={{ background: "rgba(108,58,255,0.1)", color: "#a78bfa" }}>
//                 fork
//               </span>
//             )}
//           </div>
//           <div className="flex items-center gap-2">
//             <Link href={`/profile/${prompt.user_id}`}
//               className="text-xs transition-colors hover:text-white"
//               style={{ color: MUTED }}>
//               @{authorName}
//             </Link>
//             <span style={{ color: MUTED }} className="text-xs">·</span>
//             <span className="text-xs capitalize px-1.5 py-0.5 rounded"
//               style={{ background: "rgba(255,255,255,0.05)", color: MUTED }}>
//               {prompt.category}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Description */}
//       {prompt.description && (
//         <p className="text-xs mb-3 leading-relaxed" style={{ color: MUTED }}>{prompt.description}</p>
//       )}

//       {/* Content preview */}
//       <div className="relative mb-4">
//         <pre className="text-xs whitespace-pre-wrap leading-relaxed rounded-xl p-3 line-clamp-4"
//           style={{ background: "rgba(255,255,255,0.03)", color: "#94a3b8", fontFamily: "inherit" }}>
//           {prompt.content}
//         </pre>
//       </div>

//       {/* Actions */}
//       <div className="flex items-center gap-1 flex-wrap">
//         {/* Upvote */}
//         <ActionBtn
//           icon={<ArrowUp className="w-3.5 h-3.5" />}
//           count={prompt.upvote_count}
//           active={prompt.has_upvoted}
//           activeColor="#a78bfa"
//           loading={loadingAction === "upvote"}
//           onClick={() => act("upvote")}
//           label="Upvote"
//         />
//         {/* Save */}
//         <ActionBtn
//           icon={<Bookmark className="w-3.5 h-3.5" />}
//           count={prompt.save_count}
//           active={prompt.has_saved}
//           activeColor="#06B6D4"
//           loading={loadingAction === "save"}
//           onClick={() => act("save")}
//           label="Save"
//         />
//         {/* Fork */}
//         {!isOwn && (
//           <ActionBtn
//             icon={<GitFork className="w-3.5 h-3.5" />}
//             count={prompt.fork_count}
//             active={false}
//             activeColor="#34d399"
//             loading={loadingAction === "fork"}
//             onClick={() => act("fork")}
//             label="Fork"
//           />
//         )}
//         {/* Copy */}
//         <button onClick={copy}
//           className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ml-auto transition-colors"
//           style={{
//             background: "rgba(255,255,255,0.04)",
//             border: `1px solid ${BORDER}`,
//             color: copied ? "#34d399" : MUTED,
//           }}>
//           {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
//           {copied ? "Copied" : "Copy"}
//         </button>
//       </div>
//     </div>
//   );
// }

// function ActionBtn({ icon, count, active, activeColor, loading, onClick, label }: {
//   icon: React.ReactNode; count: number; active: boolean; activeColor: string;
//   loading: boolean; onClick: () => void; label: string;
// }) {
//   return (
//     <button onClick={onClick} disabled={loading}
//       title={label}
//       className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
//       style={{
//         background: active ? `${activeColor}18` : "rgba(255,255,255,0.04)",
//         border: `1px solid ${active ? `${activeColor}40` : BORDER}`,
//         color: active ? activeColor : MUTED,
//         opacity: loading ? 0.5 : 1,
//       }}>
//       {icon}
//       {count}
//     </button>
//   );
// }

// // ── Main page ─────────────────────────────────────────────────────────────────

// export default function CommunityPage() {
//   const { user, mode } = useStore();
//   const [prompts, setPrompts] = useState<CommunityPrompt[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [sort, setSort] = useState<"top" | "new">("top");
//   const [category, setCategory] = useState("all");
//   const [search, setSearch] = useState("");
//   const [showPublish, setShowPublish] = useState(false);

//   const currentUserId = user?.id ?? "";

//   useEffect(() => {
//     setLoading(true);
//     getCommunityPrompts({
//       sort,
//       category: category !== "all" ? category : undefined,
//       mode: mode !== "student" ? mode : undefined,
//     })
//       .then(setPrompts)
//       .finally(() => setLoading(false));
//   }, [sort, category, mode]);

//   function handleChange(updated: CommunityPrompt) {
//     setPrompts((prev) => prev.map((p) => p.id === updated.id ? updated : p));
//   }

//   function handlePublished(p: CommunityPrompt) {
//     setPrompts((prev) => [p, ...prev]);
//     setShowPublish(false);
//   }

//   const filtered = prompts.filter(
//     (p) => !search || p.title.toLowerCase().includes(search.toLowerCase())
//       || p.description?.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className="min-h-screen" style={{ background: BG }}>
//       <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <div className="flex items-center gap-2 mb-1">
//               <div className="w-7 h-7 rounded-lg flex items-center justify-center"
//                 style={{ background: "rgba(217,70,48,0.15)", border: "1px solid rgba(217,70,48,0.25)" }}>
//                 <Globe className="w-3.5 h-3.5" style={{ color: "#F0997B" }} />
//               </div>
//               <h1 className="text-xl font-bold text-white" style={{ letterSpacing: "-0.02em" }}>
//                 Community
//               </h1>
//             </div>
//             <p className="text-sm ml-9" style={{ color: MUTED }}>
//               Discover, upvote, and fork prompts from the community.
//             </p>
//           </div>
//           <button onClick={() => setShowPublish(true)}
//             className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
//             style={{ background: `linear-gradient(135deg, ${ACCENT}, #8B5CF6)` }}>
//             <Plus className="w-4 h-4" />
//             Publish
//           </button>
//         </div>

//         {/* Toolbar */}
//         <div className="flex flex-col sm:flex-row gap-3 mb-6">
//           {/* Search */}
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: MUTED }} />
//             <input value={search} onChange={(e) => setSearch(e.target.value)}
//               placeholder="Search community prompts…"
//               className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
//               style={{ background: SURFACE, border: `1px solid ${BORDER}`, color: TEXT }}
//               onFocus={(e) => (e.currentTarget.style.borderColor = `${ACCENT}80`)}
//               onBlur={(e) => (e.currentTarget.style.borderColor = BORDER)} />
//           </div>
//           {/* Sort */}
//           <div className="flex gap-2">
//             {([["top", Flame], ["new", Clock]] as const).map(([s, Icon]) => (
//               <button key={s} onClick={() => setSort(s)}
//                 className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all"
//                 style={{
//                   background: sort === s ? "rgba(108,58,255,0.15)" : SURFACE,
//                   border: `1px solid ${sort === s ? "rgba(108,58,255,0.3)" : BORDER}`,
//                   color: sort === s ? "#a78bfa" : MUTED,
//                 }}>
//                 <Icon className="w-3.5 h-3.5" />{s}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Category pills */}
//         <div className="flex gap-2 flex-wrap mb-6">
//           {CATEGORIES.map((cat) => (
//             <button key={cat} onClick={() => setCategory(cat)}
//               className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
//               style={{
//                 background: category === cat ? "rgba(108,58,255,0.15)" : SURFACE,
//                 border: `1px solid ${category === cat ? "rgba(108,58,255,0.3)" : BORDER}`,
//                 color: category === cat ? "#a78bfa" : MUTED,
//               }}>
//               {cat === "all" ? "All" : cat.replace("_", " ")}
//             </button>
//           ))}
//         </div>

//         {/* Feed */}
//         {loading ? (
//           <div className="space-y-4">
//             {[1, 2, 3].map((i) => (
//               <div key={i} className="h-44 rounded-2xl animate-pulse"
//                 style={{ background: SURFACE, border: `1px solid ${BORDER}` }} />
//             ))}
//           </div>
//         ) : filtered.length === 0 ? (
//           <div className="text-center py-20 rounded-2xl"
//             style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
//             <Globe className="w-10 h-10 mx-auto mb-3" style={{ color: MUTED }} strokeWidth={1.5} />
//             <p className="text-sm font-medium text-white mb-1">Nothing here yet</p>
//             <p className="text-xs mb-5" style={{ color: MUTED }}>Be the first to publish a prompt.</p>
//             <button onClick={() => setShowPublish(true)}
//               className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
//               style={{ background: `linear-gradient(135deg, ${ACCENT}, #8B5CF6)` }}>
//               Publish first prompt
//             </button>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {filtered.map((p) => (
//               <FeedCard key={p.id} prompt={p} currentUserId={currentUserId} onChange={handleChange} />
//             ))}
//           </div>
//         )}
//       </main>

//       {showPublish && (
//         <PublishModal
//           onClose={() => setShowPublish(false)}
//           onPublished={handlePublished}
//         />
//       )}
//     </div>
//   );
// }