
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { ArrowUp, GitFork, Globe, BookOpen } from "lucide-react";
import { getUserProfile, upvotePrompt, savePrompt, forkPrompt, type UserProfile, type CommunityPrompt } from "@/lib/api";

const BG      = "#080810";
const SURFACE = "rgba(255,255,255,0.03)";
const BORDER  = "rgba(255,255,255,0.08)";
const MUTED   = "#475569";
const TEXT    = "#e2e8f0";
const ACCENT  = "#6C3AFF";

function StatCard({ icon: Icon, value, label, color }: {
  icon: React.ElementType; value: number | string; label: string; color: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <Icon className="w-4 h-4" style={{ color }} strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-sm font-bold text-white">{value}</p>
        <p className="text-xs" style={{ color: MUTED }}>{label}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const { user } = useStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [prompts, setPrompts] = useState<CommunityPrompt[]>([]);

  useEffect(() => {
    getUserProfile(userId)
      .then((p) => {
        setProfile(p);
        setPrompts(p.prompts);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  function handleChange(updated: CommunityPrompt) {
    setPrompts((prev) => prev.map((p) => p.id === updated.id ? updated : p));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <p className="text-sm" style={{ color: MUTED }}>Loading profile…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <p className="text-sm" style={{ color: MUTED }}>User not found.</p>
      </div>
    );
  }

  const authorName = profile.author_email.split("@")[0];
  const isOwnProfile = user?.id === userId;

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Profile header */}
        <div className="flex items-center gap-5 mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
            style={{ background: "rgba(108,58,255,0.2)", border: "1px solid rgba(108,58,255,0.3)" }}>
            {authorName[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ letterSpacing: "-0.02em" }}>
              @{authorName}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: MUTED }}>{profile.author_email}</p>
            {isOwnProfile && (
              <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                style={{ background: "rgba(108,58,255,0.12)", color: "#a78bfa", border: "1px solid rgba(108,58,255,0.25)" }}>
                Your profile
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          <StatCard icon={BookOpen}  value={profile.published_count} label="Published"     color={ACCENT}    />
          <StatCard icon={ArrowUp}   value={profile.total_upvotes}   label="Total upvotes" color="#a78bfa"   />
          <StatCard icon={GitFork}   value={profile.total_forks}     label="Total forks"   color="#34d399"   />
        </div>

        {/* Prompts */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: MUTED }}>
            Published prompts
          </h2>
          {prompts.length === 0 ? (
            <div className="text-center py-16 rounded-2xl"
              style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
              <Globe className="w-8 h-8 mx-auto mb-3" style={{ color: MUTED }} strokeWidth={1.5} />
              <p className="text-sm" style={{ color: MUTED }}>No published prompts yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {prompts.map((p) => (
                <MiniCard key={p.id} prompt={p} currentUserId={user?.id ?? ""} onChange={handleChange} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function MiniCard({ prompt, currentUserId, onChange }: {
  prompt: CommunityPrompt;
  currentUserId: string;
  onChange: (p: CommunityPrompt) => void;
}) {
  const isOwn = prompt.user_id === currentUserId;

  async function act(action: "upvote" | "save" | "fork") {
    let updated: CommunityPrompt;
    if (action === "upvote") updated = await upvotePrompt(prompt.id);
    else if (action === "save") updated = await savePrompt(prompt.id);
    else updated = await forkPrompt(prompt.id);
    onChange(updated);
  }

  return (
    <div className="rounded-xl p-4 transition-all"
      style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(108,58,255,0.25)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="text-sm font-semibold text-white">{prompt.title}</p>
          {prompt.description && (
            <p className="text-xs mt-0.5" style={{ color: MUTED }}>{prompt.description}</p>
          )}
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full flex-shrink-0 capitalize"
          style={{ background: "rgba(255,255,255,0.05)", color: MUTED }}>
          {prompt.category}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <button onClick={() => act("upvote")}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all"
          style={{
            background: prompt.has_upvoted ? "rgba(167,139,250,0.1)" : "rgba(255,255,255,0.04)",
            color: prompt.has_upvoted ? "#a78bfa" : MUTED,
            border: `1px solid ${prompt.has_upvoted ? "rgba(167,139,250,0.3)" : BORDER}`,
          }}>
          <ArrowUp className="w-3 h-3" /> {prompt.upvote_count}
        </button>
        {!isOwn && (
          <button onClick={() => act("fork")}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all"
            style={{ background: "rgba(255,255,255,0.04)", color: MUTED, border: `1px solid ${BORDER}` }}>
            <GitFork className="w-3 h-3" /> {prompt.fork_count}
          </button>
        )}
      </div>
    </div>
  );
}