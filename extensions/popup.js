
const API_URL = "https://promptpilot-lac.vercel.app";

const viewLoggedOut = document.getElementById("view-loggedout");
const viewLoggedIn = document.getElementById("view-loggedin");
const emailInput = document.getElementById("input-email");
const passwordInput = document.getElementById("input-password");
const loginBtn = document.getElementById("btn-login");
const loginError = document.getElementById("login-error");
const signOutBtn = document.getElementById("btn-signout");
const userEmailDisplay = document.getElementById("user-email-display");
const modeStudent = document.getElementById("mode-student");
const modeMarketing = document.getElementById("mode-marketing");

// ── Init ───────────────────────────────────────────────────────────────────────

async function init() {
  const { promptify_token, promptify_email, promptify_mode } =
    await chrome.storage.local.get(["promptify_token", "promptify_email", "promptify_mode"]);

  if (promptify_token) {
    // Verify token is still valid
    const response = await chrome.runtime.sendMessage({
      type: "VERIFY_TOKEN",
      token: promptify_token,
    });

    if (response.valid) {
      showLoggedIn(promptify_email || response.user?.email, promptify_mode || "student");
    } else {
      await chrome.storage.local.remove(["promptify_token", "promptify_email"]);
      showLoggedOut();
    }
  } else {
    showLoggedOut();
  }
}

// ── Views ──────────────────────────────────────────────────────────────────────

function showLoggedOut() {
  viewLoggedOut.style.display = "block";
  viewLoggedIn.style.display = "none";
}

function showLoggedIn(email, mode) {
  viewLoggedOut.style.display = "none";
  viewLoggedIn.style.display = "block";
  userEmailDisplay.textContent = email || "";
  setActiveMode(mode || "student");
}

function showError(msg) {
  loginError.textContent = msg;
  loginError.style.display = "block";
}

function clearError() {
  loginError.style.display = "none";
  loginError.textContent = "";
}

// ── Login ──────────────────────────────────────────────────────────────────────

loginBtn.addEventListener("click", async () => {
  clearError();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showError("Please enter your email and password");
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = "Signing in…";

  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.detail || "Invalid email or password");
      return;
    }

    await chrome.storage.local.set({
      promptify_token: data.access_token,
      promptify_email: data.user?.email || email,
      promptify_mode: data.user?.mode || "student",
    });

    showLoggedIn(data.user?.email || email, data.user?.mode || "student");
  } catch {
    showError("Network error — check your connection");
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Sign in";
  }
});

// Allow Enter key to submit
passwordInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") loginBtn.click();
});

// ── Sign out ───────────────────────────────────────────────────────────────────

signOutBtn.addEventListener("click", async () => {
  await chrome.storage.local.remove(["promptify_token", "promptify_email", "promptify_mode"]);
  emailInput.value = "";
  passwordInput.value = "";
  showLoggedOut();
});

// ── Mode toggle ────────────────────────────────────────────────────────────────

function setActiveMode(mode) {
  modeStudent.classList.toggle("active", mode === "student");
  modeMarketing.classList.toggle("active", mode === "marketing");
}

modeStudent.addEventListener("click", async () => {
  setActiveMode("student");
  await chrome.storage.local.set({ promptify_mode: "student" });
});

modeMarketing.addEventListener("click", async () => {
  setActiveMode("marketing");
  await chrome.storage.local.set({ promptify_mode: "marketing" });
});

// ── Boot ───────────────────────────────────────────────────────────────────────

init();