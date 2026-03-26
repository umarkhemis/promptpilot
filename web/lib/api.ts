const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("promptpilot-store");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.state?.token || null;
  } catch {
    return null;
  }
}

async function fetchWithAuth(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Request failed");
  }
  return response;
}

export async function login(email: string, password: string) {
  const res = await fetchWithAuth("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function register(email: string, password: string) {
  const res = await fetchWithAuth("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function getMe() {
  const res = await fetchWithAuth("/api/auth/me");
  return res.json();
}

export async function improvePrompt(rawPrompt: string, mode: string, context?: string) {
  const res = await fetchWithAuth("/api/prompts/improve", {
    method: "POST",
    body: JSON.stringify({ raw_prompt: rawPrompt, mode, context }),
  });
  return res.json();
}

export async function improvePromptStream(
  rawPrompt: string,
  mode: string,
  context: string | undefined,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (err: string) => void
) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/prompts/improve/stream`, {
      method: "POST",
      headers,
      body: JSON.stringify({ raw_prompt: rawPrompt, mode, context }),
    });
  } catch (err) {
    onError("Network error - could not reach server");
    return;
  }

  if (!response.ok) {
    onError(`Server error: ${response.status}`);
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    onError("No response body");
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let currentEvent = "message";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed === "") {
          // blank line = end of SSE event, reset event type
          currentEvent = "message";
          continue;
        }

        if (trimmed.startsWith("event:")) {
          currentEvent = trimmed.slice(6).trim();
          if (currentEvent === "done") {
            onDone();
            return;
          }
          if (currentEvent === "error") {
            onError("Streaming error from server");
            return;
          }
          continue;
        }

        if (trimmed.startsWith("data:")) {
          const raw = trimmed.slice(5).trim();
          if (!raw || raw === "{}") continue;
          try {
            const data = JSON.parse(raw);
            if (data.content) onChunk(data.content);
            if (data.error) { onError(data.error); return; }
          } catch {
            // not JSON — treat as raw text chunk
            if (raw) onChunk(raw);
          }
          continue;
        }
      }
    }
  } catch (err) {
    onError(err instanceof Error ? err.message : "Stream read error");
    return;
  } finally {
    reader.releaseLock();
  }

  onDone();
}
export async function getTemplates(mode?: string, category?: string) {
  const params = new URLSearchParams();
  if (mode) params.set("mode", mode);
  if (category) params.set("category", category);
  const res = await fetchWithAuth(`/api/templates?${params.toString()}`);
  return res.json();
}

export async function getHistory(page = 1, limit = 20) {
  const res = await fetchWithAuth(`/api/history?page=${page}&limit=${limit}`);
  return res.json();
}

export async function getToolRecommendation(intent: string) {
  const res = await fetchWithAuth(`/api/tools/recommend?intent=${encodeURIComponent(intent)}`);
  return res.json();
}

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  plan: string;
  invite_code: string | null;
  created_at: string;
  member_count: number;
  role: string;
}
 
export interface WorkspaceMember {
  user_id: string;
  email: string;
  role: string;
  joined_at: string;
}
 
export interface Pack {
  id: string;
  title: string;
  description: string | null;
  category: string;
  mode: string;
  is_free: boolean;
  cover_emoji: string | null;
  prompt_count: number;
  is_installed: boolean;
  created_at: string;
}
 
export interface PackPrompt {
  id: string;
  title: string;
  description: string | null;
  content: string;
  category: string;
  sort_order: number;
}
 
export interface PackDetail extends Pack {
  prompts: PackPrompt[];
}
 
export interface CommunityPrompt {
  id: string;
  user_id: string;
  author_email: string;
  title: string;
  description: string | null;
  content: string;
  category: string;
  mode: string;
  upvote_count: number;
  save_count: number;
  fork_count: number;
  forked_from: string | null;
  is_public: boolean;
  has_upvoted: boolean;
  has_saved: boolean;
  created_at: string;
}
 
export interface UserProfile {
  user_id: string;
  author_email: string;
  total_upvotes: number;
  total_forks: number;
  published_count: number;
  prompts: CommunityPrompt[];
}
 
// ── Workspaces ────────────────────────────────────────────────────────────────
 
export async function getMyWorkspaces(): Promise<Workspace[]> {
  const res = await fetchWithAuth("/api/workspaces/me");
  return res.json();
}
 
export async function createWorkspace(name: string): Promise<Workspace> {
  const res = await fetchWithAuth("/api/workspaces", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  return res.json();
}
 
export async function getWorkspace(id: string): Promise<Workspace> {
  const res = await fetchWithAuth(`/api/workspaces/${id}`);
  return res.json();
}
 
export async function deleteWorkspace(id: string): Promise<void> {
  await fetchWithAuth(`/api/workspaces/${id}`, { method: "DELETE" });
}
 
export async function getWorkspaceMembers(id: string): Promise<WorkspaceMember[]> {
  const res = await fetchWithAuth(`/api/workspaces/${id}/members`);
  return res.json();
}
 
export async function removeMember(workspaceId: string, userId: string): Promise<void> {
  await fetchWithAuth(`/api/workspaces/${workspaceId}/members/${userId}`, { method: "DELETE" });
}
 
export async function updateMemberRole(
  workspaceId: string,
  userId: string,
  role: string
): Promise<WorkspaceMember> {
  const res = await fetchWithAuth(`/api/workspaces/${workspaceId}/members/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
  return res.json();
}
 
export async function regenerateInvite(workspaceId: string): Promise<Workspace> {
  const res = await fetchWithAuth(`/api/workspaces/${workspaceId}/invite`, { method: "POST" });
  return res.json();
}
 
export async function joinWorkspace(inviteCode: string): Promise<Workspace> {
  const res = await fetchWithAuth(`/api/workspaces/join/${inviteCode}`, { method: "POST" });
  return res.json();
}
 
// ── Packs ─────────────────────────────────────────────────────────────────────
 
export async function getPacks(filters?: {
  category?: string;
  mode?: string;
  is_free?: boolean;
}): Promise<Pack[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.set("category", filters.category);
  if (filters?.mode) params.set("mode", filters.mode);
  if (filters?.is_free !== undefined) params.set("is_free", String(filters.is_free));
  const res = await fetchWithAuth(`/api/packs?${params.toString()}`);
  return res.json();
}
 
export async function getPack(id: string): Promise<PackDetail> {
  const res = await fetchWithAuth(`/api/packs/${id}`);
  return res.json();
}
 
export async function getInstalledPacks(workspaceId?: string): Promise<PackDetail[]> {
  const params = workspaceId ? `?workspace_id=${workspaceId}` : "";
  const res = await fetchWithAuth(`/api/packs/installed${params}`);
  return res.json();
}
 
export async function installPack(packId: string, workspaceId?: string): Promise<Pack> {
  const res = await fetchWithAuth(`/api/packs/${packId}/install`, {
    method: "POST",
    body: JSON.stringify({ workspace_id: workspaceId ?? null }),
  });
  return res.json();
}
 
export async function uninstallPack(packId: string, workspaceId?: string): Promise<void> {
  const params = workspaceId ? `?workspace_id=${workspaceId}` : "";
  await fetchWithAuth(`/api/packs/${packId}/uninstall${params}`, { method: "DELETE" });
}
 
// ── Community ─────────────────────────────────────────────────────────────────
 
export async function getCommunityPrompts(params?: {
  category?: string;
  mode?: string;
  sort?: "top" | "new";
  page?: number;
}): Promise<CommunityPrompt[]> {
  const p = new URLSearchParams();
  if (params?.category) p.set("category", params.category);
  if (params?.mode) p.set("mode", params.mode);
  if (params?.sort) p.set("sort", params.sort);
  if (params?.page) p.set("page", String(params.page));
  const res = await fetchWithAuth(`/api/community?${p.toString()}`);
  return res.json();
}
 
export async function getCommunityPrompt(id: string): Promise<CommunityPrompt> {
  const res = await fetchWithAuth(`/api/community/${id}`);
  return res.json();
}

 
export async function getMyCommunityPrompts(): Promise<CommunityPrompt[]> {
  const res = await fetchWithAuth("/api/community/my");
  return res.json();
}
 
export async function getSavedPrompts(): Promise<CommunityPrompt[]> {
  const res = await fetchWithAuth("/api/community/saved");
  return res.json();
}
 
export async function publishPrompt(data: {
  title: string;
  description?: string;
  content: string;
  category: string;
  mode: string;
}): Promise<CommunityPrompt> {
  const res = await fetchWithAuth("/api/community", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}
 
export async function upvotePrompt(id: string): Promise<CommunityPrompt> {
  const res = await fetchWithAuth(`/api/community/${id}/upvote`, { method: "POST" });
  return res.json();
}
 
export async function savePrompt(id: string): Promise<CommunityPrompt> {
  const res = await fetchWithAuth(`/api/community/${id}/save`, { method: "POST" });
  return res.json();
}
 
export async function forkPrompt(id: string): Promise<CommunityPrompt> {
  const res = await fetchWithAuth(`/api/community/${id}/fork`, { method: "POST" });
  return res.json();
}
 
export async function getUserProfile(userId: string): Promise<UserProfile> {
  const res = await fetchWithAuth(`/api/community/profile/${userId}`);
  return res.json();
}
 
export async function deleteCommunityPrompt(id: string): Promise<void> {
  await fetchWithAuth(`/api/community/${id}`, { method: "DELETE" });
}