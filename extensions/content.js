
(() => {
  // Selectors for the prompt input on each supported platform
  const PLATFORM_SELECTORS = [
    "#prompt-textarea",                          // ChatGPT
    'div[contenteditable="true"].ProseMirror',   // Claude.ai
    "div[contenteditable='true'][aria-label]",   // Gemini
    "textarea[placeholder]",                     // Perplexity + fallback
  ];

  const BUTTON_ID = "promptify-improve-btn";
  const TOAST_ID = "promptify-toast";
  let injected = false;
  let activeInput = null;

  // ── Styles ──────────────────────────────────────────────────────────────────

  function injectStyles() {
    if (document.getElementById("promptify-styles")) return;
    const style = document.createElement("style");
    style.id = "promptify-styles";
    style.textContent = `
      #promptify-improve-btn {
        position: fixed;
        bottom: 80px;
        right: 24px;
        z-index: 999999;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        background: #6C3AFF;
        color: #fff;
        font-size: 13px;
        font-weight: 600;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(108, 58, 255, 0.45);
        transition: opacity 0.15s, transform 0.15s;
        user-select: none;
      }
      #promptify-improve-btn:hover {
        opacity: 0.92;
        transform: translateY(-1px);
      }
      #promptify-improve-btn:active {
        transform: translateY(0);
      }
      #promptify-improve-btn.loading {
        opacity: 0.7;
        pointer-events: none;
        cursor: default;
      }
      #promptify-improve-btn svg {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
      }
      #promptify-toast {
        position: fixed;
        bottom: 130px;
        right: 24px;
        z-index: 999999;
        padding: 10px 16px;
        border-radius: 10px;
        font-size: 13px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-weight: 500;
        color: #fff;
        pointer-events: none;
        opacity: 0;
        transform: translateY(6px);
        transition: opacity 0.2s, transform 0.2s;
        max-width: 280px;
        line-height: 1.4;
      }
      #promptify-toast.show {
        opacity: 1;
        transform: translateY(0);
      }
      #promptify-toast.success { background: #1D9E75; }
      #promptify-toast.error   { background: #D85A30; }
      #promptify-toast.info    { background: #6C3AFF; }
    `;
    document.head.appendChild(style);
  }

  // ── Button ───────────────────────────────────────────────────────────────────

  function createButton() {
    const btn = document.createElement("button");
    btn.id = BUTTON_ID;
    btn.innerHTML = `
      <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 1L9.5 6H14.5L10.5 9L12 14L8 11L4 14L5.5 9L1.5 6H6.5L8 1Z"
          fill="white" stroke="white" stroke-width="0.5" stroke-linejoin="round"/>
      </svg>
      Improve
    `;
    btn.addEventListener("click", onButtonClick);
    return btn;
  }

  function setButtonLoading(loading) {
    const btn = document.getElementById(BUTTON_ID);
    if (!btn) return;
    if (loading) {
      btn.classList.add("loading");
      btn.innerHTML = `
        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
          style="animation: promptify-spin 0.8s linear infinite;">
          <circle cx="8" cy="8" r="6" stroke="white" stroke-width="2" stroke-dasharray="28" stroke-dashoffset="10"/>
        </svg>
        Improving…
      `;
      // Inject spin keyframe once
      if (!document.getElementById("promptify-spin-style")) {
        const s = document.createElement("style");
        s.id = "promptify-spin-style";
        s.textContent = `@keyframes promptify-spin { to { transform: rotate(360deg); } }`;
        document.head.appendChild(s);
      }
    } else {
      btn.classList.remove("loading");
      btn.innerHTML = `
        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 1L9.5 6H14.5L10.5 9L12 14L8 11L4 14L5.5 9L1.5 6H6.5L8 1Z"
            fill="white" stroke="white" stroke-width="0.5" stroke-linejoin="round"/>
        </svg>
        Improve
      `;
    }
  }

  // ── Toast ────────────────────────────────────────────────────────────────────

  function showToast(message, type = "info", duration = 3000) {
    let toast = document.getElementById(TOAST_ID);
    if (!toast) {
      toast = document.createElement("div");
      toast.id = TOAST_ID;
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = `show ${type}`;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove("show");
    }, duration);
  }

  // ── Input detection ───────────────────────────────────────────────────────────

  function findActiveInput() {
    for (const selector of PLATFORM_SELECTORS) {
      const el = document.querySelector(selector);
      if (el) return el;
    }
    return null;
  }

  function getInputText(el) {
    if (!el) return "";
    // contenteditable divs
    if (el.getAttribute("contenteditable") === "true") {
      return el.innerText || el.textContent || "";
    }
    // textarea
    return el.value || "";
  }

  function setInputText(el, text) {
    if (!el) return;
    if (el.getAttribute("contenteditable") === "true") {
      el.innerText = text;
      // Dispatch input event so the platform's React state picks up the change
      el.dispatchEvent(new InputEvent("input", { bubbles: true }));
    } else {
      // textarea — use native input setter so React state updates
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value"
      )?.set;
      if (nativeSetter) {
        nativeSetter.call(el, text);
      } else {
        el.value = text;
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    el.focus();
  }

  // ── Main click handler ────────────────────────────────────────────────────────

  async function onButtonClick() {
    // 1. Check auth
    const { promptify_token, promptify_mode } = await chrome.storage.local.get([
      "promptify_token",
      "promptify_mode",
    ]);

    if (!promptify_token) {
      showToast("Sign in to Promptify first - click the extension icon", "error", 4000);
      return;
    }

    // 2. Get prompt text
    const input = findActiveInput();
    const text = getInputText(input).trim();

    if (!text) {
      showToast("Type a prompt first, then click Improve", "info");
      return;
    }

    // 3. Call API via background service worker
    setButtonLoading(true);

    const response = await chrome.runtime.sendMessage({
      type: "IMPROVE_PROMPT",
      payload: {
        raw_prompt: text,
        mode: promptify_mode || "student",
        token: promptify_token,
      },
    });

    setButtonLoading(false);

    if (!response.success) {
      if (response.error === "SESSION_EXPIRED") {
        // Clear stored token so popup shows login again
        await chrome.storage.local.remove(["promptify_token"]);
        showToast("Session expired - please sign in again", "error", 4000);
      } else {
        showToast(`Error: ${response.error}`, "error", 4000);
      }
      return;
    }

    // 4. Replace text in the input
    setInputText(input, response.improved);

    const toolName = response.recommended_tool?.name || response.recommended_tool;
    const toolMsg = toolName ? ` · Best tool: ${toolName}` : "";
    showToast(`Prompt improved!${toolMsg}`, "success", 4000);
  }

  // ── Injection logic ───────────────────────────────────────────────────────────

  function tryInject() {
    if (injected) return;
    const input = findActiveInput();
    if (!input) return;

    injectStyles();
    const btn = createButton();
    document.body.appendChild(btn);
    injected = true;
  }

  // Try immediately, then watch for dynamic page loads (SPAs)
  tryInject();

  const observer = new MutationObserver(() => {
    if (!injected) tryInject();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Re-check on navigation for SPAs (e.g. ChatGPT changing conversations)
  let lastUrl = location.href;
  setInterval(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      injected = false;
      const existing = document.getElementById(BUTTON_ID);
      if (existing) existing.remove();
      tryInject();
    }
  }, 1000);
})();