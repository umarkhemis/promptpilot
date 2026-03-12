"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { ModeSwitcher } from "@/components/mode-switcher";
import { Save, CheckCircle2, User, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { user, mode } = useStore();
  const [context, setContext] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      // Profile save would call an API endpoint — show success for now
      await new Promise((res) => setTimeout(res, 600));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  const contextPlaceholder =
    mode === "marketing"
      ? "e.g. Our brand voice is approachable and energetic. We sell premium organic coffee to health-conscious millennials. Avoid jargon."
      : "e.g. I'm a junior studying Environmental Science. I prefer academic tone with APA citations. My professor emphasizes critical thinking.";

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your profile and preferences.
        </p>
      </div>

      {/* Profile */}
      <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-brand-500" />
            Profile
          </h2>
        </div>
        <div className="px-6 py-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={user?.email ?? ""}
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed text-sm"
            />
            <p className="mt-1 text-xs text-slate-400">Email cannot be changed.</p>
          </div>
        </div>
      </section>

      {/* Mode */}
      <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white">Mode</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Choose your primary use case to tailor prompt improvements.
          </p>
        </div>
        <div className="px-6 py-5">
          <ModeSwitcher />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            {mode === "marketing"
              ? "Marketing mode optimizes prompts for ads, emails, social media, and brand content."
              : "Student mode optimizes prompts for essays, research, summaries, and academic tasks."}
          </p>
        </div>
      </section>

      {/* Context profile */}
      <form onSubmit={handleSave}>
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-white">Context Profile</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Add background info that will be included with every prompt you improve.
            </p>
          </div>
          <div className="px-6 py-5 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder={contextPlaceholder}
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saved ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Saving…" : saved ? "Saved!" : "Save settings"}
              </button>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
