
"use client";

import { useState, useEffect } from "react";
import {
  Users, Plus, Copy, Check, Trash2, Crown,
  Shield, User, RefreshCw, X, ChevronRight,
} from "lucide-react";
import {
  getMyWorkspaces, createWorkspace, getWorkspaceMembers,
  removeMember, updateMemberRole, regenerateInvite, deleteWorkspace,
  type Workspace, type WorkspaceMember,
} from "@/lib/api";

const BG      = "#080810";
const SURFACE = "rgba(255,255,255,0.03)";
const BORDER  = "rgba(255,255,255,0.08)";
const MUTED   = "#475569";
const TEXT    = "#e2e8f0";
const ACCENT  = "#6C3AFF";

// ── Small helpers ─────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    owner:  { label: "Owner",  color: "#fbbf24", bg: "rgba(251,191,36,0.12)"  },
    admin:  { label: "Admin",  color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
    member: { label: "Member", color: "#64748b", bg: "rgba(100,116,139,0.12)" },
  };
  const s = map[role] ?? map.member;
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ color: s.color, background: s.bg }}>
      {s.label}
    </span>
  );
}

function RoleIcon({ role }: { role: string }) {
  if (role === "owner") return <Crown className="w-3.5 h-3.5 text-yellow-400" />;
  if (role === "admin") return <Shield className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />;
  return <User className="w-3.5 h-3.5" style={{ color: MUTED }} />;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={copy} className="p-1.5 rounded-lg transition-colors"
      style={{ color: copied ? "#34d399" : MUTED }}>
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

// ── Create modal ──────────────────────────────────────────────────────────────

function CreateModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (ws: Workspace) => void;
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const ws = await createWorkspace(name.trim());
      onCreate(ws);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create workspace");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl p-6 relative"
        style={{ background: "#0f0f1a", border: `1px solid ${BORDER}` }}
        onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4" style={{ color: MUTED }}>
          <X className="w-4 h-4" />
        </button>
        <h2 className="text-base font-bold text-white mb-1">Create workspace</h2>
        <p className="text-sm mb-5" style={{ color: MUTED }}>
          A shared space for your team&apos;s prompts and packs.
        </p>
        <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
          style={{ color: MUTED }}>Workspace name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="e.g. Marketing team"
          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-4"
          style={{ background: SURFACE, border: `1px solid ${BORDER}`, color: TEXT }}
          onFocus={(e) => { e.currentTarget.style.borderColor = `${ACCENT}80`; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = BORDER; }}
          autoFocus
        />
        {error && <p className="text-xs mb-3" style={{ color: "#f87171" }}>{error}</p>}
        <button
          onClick={handleCreate}
          disabled={loading || !name.trim()}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity"
          style={{ background: `linear-gradient(135deg, ${ACCENT}, #8B5CF6)`, opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Creating…" : "Create workspace"}
        </button>
      </div>
    </div>
  );
}

// ── Workspace detail panel ────────────────────────────────────────────────────

function WorkspacePanel({ ws, currentUserId, onClose, onDeleted }: {
  ws: Workspace;
  currentUserId: string;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteLink, setInviteLink] = useState(
    ws.invite_code ? `${window.location.origin}/invite/${ws.invite_code}` : ""
  );
  const [regenerating, setRegenerating] = useState(false);
  const isOwner = ws.role === "owner";
  const isAdmin = ws.role === "admin" || isOwner;

  useEffect(() => {
    getWorkspaceMembers(ws.id).then(setMembers).finally(() => setLoading(false));
  }, [ws.id]);

  async function handleRemove(userId: string) {
    await removeMember(ws.id, userId);
    setMembers((m) => m.filter((x) => x.user_id !== userId));
  }

  async function handleRoleChange(userId: string, role: string) {
    const updated = await updateMemberRole(ws.id, userId, role);
    setMembers((m) => m.map((x) => x.user_id === userId ? { ...x, role: updated.role } : x));
  }

  async function handleRegenerate() {
    setRegenerating(true);
    const updated = await regenerateInvite(ws.id);
    setInviteLink(`${window.location.origin}/invite/${updated.invite_code}`);
    setRegenerating(false);
  }

  async function handleDelete() {
    if (!confirm(`Delete "${ws.name}"? This cannot be undone.`)) return;
    await deleteWorkspace(ws.id);
    onDeleted();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl p-6 relative max-h-[90vh] overflow-y-auto"
        style={{ background: "#0f0f1a", border: `1px solid ${BORDER}` }}
        onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4" style={{ color: MUTED }}>
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(108,58,255,0.15)", border: "1px solid rgba(108,58,255,0.25)" }}>
            <Users className="w-5 h-5" style={{ color: "#a78bfa" }} strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">{ws.name}</h2>
            <p className="text-xs capitalize" style={{ color: MUTED }}>
              {ws.plan} plan · {ws.member_count} {ws.member_count === 1 ? "member" : "members"}
            </p>
          </div>
        </div>

        {/* Invite link */}
        {isAdmin && (
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: MUTED }}>
              Invite link
            </p>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
              <p className="text-xs flex-1 truncate" style={{ color: TEXT }}>{inviteLink}</p>
              <CopyButton text={inviteLink} />
              <button onClick={handleRegenerate} disabled={regenerating}
                className="p-1.5 rounded-lg transition-colors" style={{ color: MUTED }}
                title="Regenerate link">
                <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? "animate-spin" : ""}`} />
              </button>
            </div>
            <p className="text-[11px] mt-1.5" style={{ color: MUTED }}>
              Share this link to invite people. Regenerating invalidates the old link.
            </p>
          </div>
        )}

        {/* Members */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: MUTED }}>
            Members
          </p>
          {loading ? (
            <p className="text-sm" style={{ color: MUTED }}>Loading…</p>
          ) : (
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m.user_id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                  <RoleIcon role={m.role} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: TEXT }}>{m.email}</p>
                    <p className="text-[11px]" style={{ color: MUTED }}>
                      Joined {new Date(m.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                  <RoleBadge role={m.role} />
                  {/* Admin controls — can't change owner */}
                  {isOwner && m.role !== "owner" && (
                    <div className="flex items-center gap-1">
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.user_id, e.target.value)}
                        className="text-xs rounded-lg px-2 py-1 outline-none"
                        style={{ background: "#1a1a2e", border: `1px solid ${BORDER}`, color: TEXT }}>
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button onClick={() => handleRemove(m.user_id)}
                        className="p-1.5 rounded-lg transition-colors" style={{ color: MUTED }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Danger zone */}
        {isOwner && (
          <div className="mt-6 pt-4" style={{ borderTop: `1px solid rgba(239,68,68,0.15)` }}>
            <button onClick={handleDelete}
              className="flex items-center gap-2 text-sm font-medium transition-colors"
              style={{ color: "#f87171" }}>
              <Trash2 className="w-4 h-4" />
              Delete workspace
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Workspace | null>(null);

  // Get current user id from store
  const currentUserId =
    typeof window !== "undefined"
      ? (() => {
          try {
            return JSON.parse(localStorage.getItem("promptpilot-store") || "{}").state?.user?.id ?? "";
          } catch { return ""; }
        })()
      : "";

  useEffect(() => {
    getMyWorkspaces().then(setWorkspaces).finally(() => setLoading(false));
  }, []);

  function handleCreated(ws: Workspace) {
    setWorkspaces((w) => [ws, ...w]);
    setShowCreate(false);
  }

  function handleDeleted() {
    if (selected) setWorkspaces((w) => w.filter((x) => x.id !== selected.id));
    setSelected(null);
  }

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(108,58,255,0.15)", border: "1px solid rgba(108,58,255,0.25)" }}>
                <Users className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />
              </div>
              <h1 className="text-xl font-bold text-white" style={{ letterSpacing: "-0.02em" }}>
                Workspaces
              </h1>
            </div>
            <p className="text-sm ml-9" style={{ color: MUTED }}>
              Shared spaces for your team&apos;s prompts and packs.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, #8B5CF6)` }}>
            <Plus className="w-4 h-4" />
            New workspace
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 rounded-2xl animate-pulse"
                style={{ background: SURFACE, border: `1px solid ${BORDER}` }} />
            ))}
          </div>
        ) : workspaces.length === 0 ? (
          <div className="text-center py-20 rounded-2xl"
            style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(108,58,255,0.1)", border: "1px solid rgba(108,58,255,0.2)" }}>
              <Users className="w-6 h-6" style={{ color: "#a78bfa" }} strokeWidth={1.5} />
            </div>
            <h3 className="font-bold text-base mb-2 text-white">No workspaces yet</h3>
            <p className="text-sm mb-5" style={{ color: MUTED }}>
              Create one and invite your team.
            </p>
            <button onClick={() => setShowCreate(true)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, #8B5CF6)` }}>
              Create your first workspace
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {workspaces.map((ws) => (
              <button key={ws.id}
                onClick={() => setSelected(ws)}
                className="w-full text-left flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-150 group"
                style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(108,58,255,0.3)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(108,58,255,0.12)", border: "1px solid rgba(108,58,255,0.22)" }}>
                  <Users className="w-4.5 h-4.5" style={{ color: "#a78bfa" }} strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white text-sm">{ws.name}</p>
                    <RoleBadge role={ws.role} />
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: MUTED }}>
                    {ws.member_count} {ws.member_count === 1 ? "member" : "members"} · {ws.plan} plan
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-60 transition-opacity"
                  style={{ color: TEXT }} />
              </button>
            ))}
          </div>
        )}
      </main>

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreate={handleCreated} />}
      {selected && (
        <WorkspacePanel
          ws={selected}
          currentUserId={currentUserId}
          onClose={() => setSelected(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}