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

  const response = await fetch(`${API_URL}/api/prompts/improve/stream`, {
    method: "POST",
    headers,
    body: JSON.stringify({ raw_prompt: rawPrompt, mode, context }),
  });

  if (!response.ok) {
    onError("Failed to start streaming");
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    onError("No response body");
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (line.startsWith("data: ") && line !== "data: {}") {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.content) onChunk(data.content);
        } catch {
          // ignore malformed SSE data lines
        }
      } else if (line.startsWith("event: done")) {
        onDone();
      } else if (line.startsWith("event: error")) {
        onError("Streaming error");
      }
    }
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
