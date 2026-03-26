
"use client";

import { useState, useEffect } from "react";
import { Package, Download, Check, X, ChevronRight, Search } from "lucide-react";
import {
  getPacks, getPack, installPack, uninstallPack,
  type Pack, type PackDetail, type PackPrompt,
} from "@/lib/api";

const BG      = "#080810";
const SURFACE = "rgba(255,255,255,0.03)";
const BORDER  = "rgba(255,255,255,0.08)";
const MUTED   = "#475569";
const TEXT    = "#e2e8f0";
const ACCENT  = "#6C3AFF";

const CATEGORIES = ["all", "email", "seo", "coding", "social_media", "writing", "research", "study"];

// ── Pack card ─────────────────────────────────────────────────────────────────

function PackCard({ pack, onSelect, onToggleInstall }: {
  pack: Pack;
  onSelect: () => void;
  onToggleInstall: (pack: Pack) => void;
}) {
  const [installing, setInstalling] = useState(false);

  async function handleInstall(e: React.MouseEvent) {
    e.stopPropagation();
    setInstalling(true);
    await onToggleInstall(pack);
    setInstalling(false);
  }

  return (
    <div
      className="rounded-2xl p-5 cursor-pointer transition-all duration-150 flex flex-col gap-3"
      style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
      onClick={onSelect}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(108,58,255,0.3)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}>

      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: "rgba(108,58,255,0.12)", border: "1px solid rgba(108,58,255,0.22)" }}>
            {pack.cover_emoji || "📦"}
          </div>
          <div>
            <p className="font-semibold text-sm text-white leading-tight">{pack.title}</p>
            <p className="text-[11px] mt-0.5 capitalize" style={{ color: MUTED }}>
              {pack.category} · {pack.mode}
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{
            color: pack.is_free ? "#34d399" : "#fbbf24",
            background: pack.is_free ? "rgba(52,211,153,0.1)" : "rgba(251,191,36,0.1)",
          }}>
          {pack.is_free ? "Free" : "Pro"}
        </span>
      </div>

      {/* Description */}
      {pack.description && (
        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: MUTED }}>
          {pack.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-xs" style={{ color: MUTED }}>
          {pack.prompt_count} prompt{pack.prompt_count !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: pack.is_installed ? "rgba(52,211,153,0.1)" : `rgba(108,58,255,0.15)`,
              border: `1px solid ${pack.is_installed ? "rgba(52,211,153,0.25)" : "rgba(108,58,255,0.3)"}`,
              color: pack.is_installed ? "#34d399" : "#a78bfa",
              opacity: installing ? 0.6 : 1,
            }}
            onClick={handleInstall}
            disabled={installing}>
            {installing
              ? "…"
              : pack.is_installed
              ? <><Check className="w-3 h-3" /> Installed</>
              : <><Download className="w-3 h-3" /> Install</>}
          </button>
          <ChevronRight className="w-3.5 h-3.5" style={{ color: MUTED }} />
        </div>
      </div>
    </div>
  );
}

// ── Pack detail modal ─────────────────────────────────────────────────────────

function PackModal({ packId, onClose, onToggleInstall }: {
  packId: string;
  onClose: () => void;
  onToggleInstall: (packId: string, installed: boolean) => void;
}) {
  const [detail, setDetail] = useState<PackDetail | null>(null);
  const [installing, setInstalling] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    getPack(packId).then(setDetail);
  }, [packId]);

  async function handleInstall() {
    if (!detail) return;
    setInstalling(true);
    try {
      if (detail.is_installed) {
        await uninstallPack(detail.id);
        setDetail((d) => d ? { ...d, is_installed: false } : d);
        onToggleInstall(detail.id, false);
      } else {
        await installPack(detail.id);
        setDetail((d) => d ? { ...d, is_installed: true } : d);
        onToggleInstall(detail.id, true);
      }
    } finally {
      setInstalling(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.75)" }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl relative max-h-[90vh] overflow-y-auto"
        style={{ background: "#0f0f1a", border: `1px solid ${BORDER}` }}
        onClick={(e) => e.stopPropagation()}>

        {!detail ? (
          <div className="p-8 text-center" style={{ color: MUTED }}>Loading…</div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 pb-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <button onClick={onClose} className="absolute top-4 right-4" style={{ color: MUTED }}>
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: "rgba(108,58,255,0.12)", border: "1px solid rgba(108,58,255,0.22)" }}>
                  {detail.cover_emoji || "📦"}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">{detail.title}</h2>
                  <p className="text-xs capitalize mt-0.5" style={{ color: MUTED }}>
                    {detail.category} · {detail.mode} · {detail.prompt_count} prompts
                  </p>
                </div>
              </div>
              {detail.description && (
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{detail.description}</p>
              )}
              <button
                onClick={handleInstall}
                disabled={installing}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{
                  background: detail.is_installed
                    ? "rgba(239,68,68,0.15)"
                    : `linear-gradient(135deg, ${ACCENT}, #8B5CF6)`,
                  border: detail.is_installed ? "1px solid rgba(239,68,68,0.3)" : "none",
                  color: detail.is_installed ? "#f87171" : "white",
                  opacity: installing ? 0.6 : 1,
                }}>
                {installing
                  ? "…"
                  : detail.is_installed
                  ? "Uninstall pack"
                  : <><Download className="w-4 h-4" /> Install pack</>}
              </button>
            </div>

            {/* Prompts list */}
            <div className="p-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: MUTED }}>
                Prompts in this pack
              </p>
              {detail.prompts.map((p: PackPrompt) => (
                <div key={p.id}
                  className="rounded-xl overflow-hidden"
                  style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                    onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
                    <div>
                      <p className="text-sm font-medium text-white">{p.title}</p>
                      {p.description && (
                        <p className="text-xs mt-0.5" style={{ color: MUTED }}>{p.description}</p>
                      )}
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform flex-shrink-0 ${expanded === p.id ? "rotate-90" : ""}`}
                      style={{ color: MUTED }} />
                  </button>
                  {expanded === p.id && (
                    <div className="px-4 pb-4 pt-0">
                      <pre className="text-xs whitespace-pre-wrap leading-relaxed rounded-lg p-3"
                        style={{ background: "rgba(255,255,255,0.03)", color: "#94a3b8", fontFamily: "inherit" }}>
                        {p.content}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PacksPage() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getPacks(category !== "all" ? { category } : undefined)
      .then(setPacks)
      .finally(() => setLoading(false));
  }, [category]);

  async function handleToggleInstall(pack: Pack) {
    if (pack.is_installed) {
      await uninstallPack(pack.id);
    } else {
      await installPack(pack.id);
    }
    setPacks((prev) =>
      prev.map((p) => p.id === pack.id ? { ...p, is_installed: !p.is_installed } : p)
    );
  }

  function handleModalToggle(packId: string, installed: boolean) {
    setPacks((prev) => prev.map((p) => p.id === packId ? { ...p, is_installed: installed } : p));
  }

  const filtered = packs.filter(
    (p) => !search || p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.25)" }}>
              <Package className="w-3.5 h-3.5" style={{ color: "#06B6D4" }} />
            </div>
            <h1 className="text-xl font-bold text-white" style={{ letterSpacing: "-0.02em" }}>
              Prompt Packs
            </h1>
          </div>
          <p className="text-sm ml-9" style={{ color: MUTED }}>
            Curated bundles of prompts for every use case. Install and use instantly.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: MUTED }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search packs…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: SURFACE, border: `1px solid ${BORDER}`, color: TEXT }}
              onFocus={(e) => (e.currentTarget.style.borderColor = `${ACCENT}80`)}
              onBlur={(e) => (e.currentTarget.style.borderColor = BORDER)}
            />
          </div>
          {/* Category pills */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button key={cat}
                onClick={() => setCategory(cat)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                style={{
                  background: category === cat ? "rgba(108,58,255,0.15)" : SURFACE,
                  border: `1px solid ${category === cat ? "rgba(108,58,255,0.3)" : BORDER}`,
                  color: category === cat ? "#a78bfa" : MUTED,
                }}>
                {cat === "all" ? "All" : cat.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-44 rounded-2xl animate-pulse"
                style={{ background: SURFACE, border: `1px solid ${BORDER}` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 rounded-2xl"
            style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
            <Package className="w-10 h-10 mx-auto mb-3" style={{ color: MUTED }} strokeWidth={1.5} />
            <p className="text-sm font-medium text-white mb-1">No packs found</p>
            <p className="text-xs" style={{ color: MUTED }}>Try a different category or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((pack) => (
              <PackCard
                key={pack.id}
                pack={pack}
                onSelect={() => setSelectedId(pack.id)}
                onToggleInstall={handleToggleInstall}
              />
            ))}
          </div>
        )}
      </main>

      {selectedId && (
        <PackModal
          packId={selectedId}
          onClose={() => setSelectedId(null)}
          onToggleInstall={handleModalToggle}
        />
      )}
    </div>
  );
}