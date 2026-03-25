
const API_URL = "https://promptpilot-lac.vercel.app";

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "IMPROVE_PROMPT") {
    handleImprovePrompt(message.payload).then(sendResponse).catch((err) => {
      sendResponse({ success: false, error: err.message });
    });
    return true; 
  }

  if (message.type === "VERIFY_TOKEN") {
    handleVerifyToken(message.token).then(sendResponse).catch((err) => {
      sendResponse({ valid: false, error: err.message });
    });
    return true;
  }
});

async function handleImprovePrompt({ raw_prompt, mode, token }) {
  try {
    const res = await fetch(`${API_URL}/api/prompts/improve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ raw_prompt, mode: mode || "student" }),
    });

    if (res.status === 401) {
      return { success: false, error: "SESSION_EXPIRED" };
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.detail || "Something went wrong" };
    }

    const data = await res.json();
    return {
      success: true,
      improved: data.improved,
      recommended_tool: data.recommended_tool,
      intent: data.intent,
    };
  } catch (err) {
    return { success: false, error: "Network error - check your connection" };
  }
}

async function handleVerifyToken(token) {
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { valid: false };
    const user = await res.json();
    return { valid: true, user };
  } catch {
    return { valid: false };
  }
}