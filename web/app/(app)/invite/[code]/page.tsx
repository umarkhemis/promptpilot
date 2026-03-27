
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { joinWorkspace, type Workspace } from "@/lib/api";
import { Users, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

const BG     = "#080810";
const BORDER = "rgba(255,255,255,0.08)";
const MUTED  = "#475569";
const ACCENT = "#6C3AFF";

type State = "loading" | "joining" | "success" | "already_member" | "invalid" | "needs_login";

export default function InvitePage() {
  const params   = useParams();
  const router   = useRouter();
  const { token, user } = useStore();
  const code     = params.code as string;

  const [state, setState]       = useState<State>("loading");
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      // Not logged in — save the invite code so we redirect back after login
      if (typeof window !== "undefined") {
        sessionStorage.setItem("pp-pending-invite", code);
      }
      setState("needs_login");
      return;
    }
    handleJoin();
  }, [token, code]);

  async function handleJoin() {
    setState("joining");
    try {
      const ws = await joinWorkspace(code);
      setWorkspace(ws);
      setState("success");
    } catch (e: any) {
      const msg = e?.message || "";
      if (msg.toLowerCase().includes("already")) {
        setState("already_member");
      } else if (msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("not found")) {
        setState("invalid");
      } else {
        setError(msg);
        setState("invalid");
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: BG }}>
      <div className="w-full max-w-sm rounded-2xl p-8 text-center"
        style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}` }}>

        {/* Loading */}
        {(state === "loading" || state === "joining") && (
          <>
            <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin" style={{ color: "#a78bfa" }} />
            <p className="text-sm text-white font-medium">Joining workspace…</p>
            <p className="text-xs mt-1" style={{ color: MUTED }}>Just a moment</p>
          </>
        )}

        {/* Success */}
        {state === "success" && workspace && (
          <>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)" }}>
              <CheckCircle className="w-7 h-7" style={{ color: "#34d399" }} />
            </div>
            <h2 className="text-lg font-bold text-white mb-1">You&apos;re in!</h2>
            <p className="text-sm mb-2" style={{ color: MUTED }}>
              You&apos;ve joined <span className="text-white font-semibold">{workspace.name}</span>
            </p>
            <p className="text-xs mb-6" style={{ color: MUTED }}>
              {workspace.member_count} member{workspace.member_count !== 1 ? "s" : ""} · {workspace.plan} plan
            </p>
            <Link href="/workspaces"
              className="block w-full py-2.5 rounded-xl text-sm font-semibold text-white text-center transition-opacity hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, #8B5CF6)` }}>
              Go to workspace
            </Link>
          </>
        )}

        {/* Already a member */}
        {state === "already_member" && (
          <>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(108,58,255,0.1)", border: "1px solid rgba(108,58,255,0.25)" }}>
              <Users className="w-7 h-7" style={{ color: "#a78bfa" }} />
            </div>
            <h2 className="text-lg font-bold text-white mb-1">Already a member</h2>
            <p className="text-sm mb-6" style={{ color: MUTED }}>
              You&apos;re already in this workspace.
            </p>
            <Link href="/workspaces"
              className="block w-full py-2.5 rounded-xl text-sm font-semibold text-white text-center"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, #8B5CF6)` }}>
              View workspaces
            </Link>
          </>
        )}

        {/* Invalid / expired */}
        {state === "invalid" && (
          <>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>
              <XCircle className="w-7 h-7" style={{ color: "#f87171" }} />
            </div>
            <h2 className="text-lg font-bold text-white mb-1">Invalid invite</h2>
            <p className="text-sm mb-6" style={{ color: MUTED }}>
              {error || "This invite link is invalid or has expired. Ask the workspace owner to send a new one."}
            </p>
            <Link href="/dashboard"
              className="block w-full py-2.5 rounded-xl text-sm font-semibold text-white text-center"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, #8B5CF6)` }}>
              Go to dashboard
            </Link>
          </>
        )}

        {/* Needs login */}
        {state === "needs_login" && (
          <>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(108,58,255,0.1)", border: "1px solid rgba(108,58,255,0.25)" }}>
              <Users className="w-7 h-7" style={{ color: "#a78bfa" }} />
            </div>
            <h2 className="text-lg font-bold text-white mb-1">You&apos;ve been invited</h2>
            <p className="text-sm mb-6" style={{ color: MUTED }}>
              Sign in or create an account to accept this workspace invitation.
            </p>
            <Link href={`/login?redirect=/invite/${code}`}
              className="block w-full py-2.5 rounded-xl text-sm font-semibold text-white text-center mb-3"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, #8B5CF6)` }}>
              Sign in to accept
            </Link>
            <Link href={`/register?redirect=/invite/${code}`}
              className="block w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`, color: "#e2e8f0" }}>
              Create account
            </Link>
          </>
        )}

      </div>
    </div>
  );
}