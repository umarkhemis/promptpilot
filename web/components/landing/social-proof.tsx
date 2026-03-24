
"use client";

// Each "logo" has a name + an abbreviation displayed in a styled badge
const LOGOS = [
  { name: "TechCorp Inc.", abbr: "TC", hue: 258 },
  { name: "CreativeAgency", abbr: "CA", hue: 192 },
  { name: "GrowthCo", abbr: "GC", hue: 38 },
  { name: "MediaLabs", abbr: "ML", hue: 280 },
  { name: "DigitalFirst", abbr: "DF", hue: 160 },
  { name: "BrandStudio", abbr: "BS", hue: 340 },
  { name: "ScaleMind", abbr: "SM", hue: 210 },
  { name: "NovaCopy", abbr: "NC", hue: 130 },
];

const MARQUEE_ITEMS = [...LOGOS, ...LOGOS];

function LogoChip({ item }: { item: typeof LOGOS[0] }) {
  return (
    <div
      className="flex-shrink-0 flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.13)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
      }}
    >
      {/* Avatar-style logo mark */}
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
        style={{ background: `hsl(${item.hue}, 55%, 45%)` }}
      >
        {item.abbr}
      </div>
      <span className="text-sm font-semibold whitespace-nowrap" style={{ color: "#475569" }}>
        {item.name}
      </span>
    </div>
  );
}

export function SocialProof() {
  return (
    <section
      className="relative py-16 overflow-hidden"
      style={{ background: "#080810", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      {/* Edge fades */}
      <div
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 z-10"
        style={{ background: "linear-gradient(to right, #080810, transparent)" }}
      />
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 z-10"
        style={{ background: "linear-gradient(to left, #080810, transparent)" }}
      />

      {/* Label */}
      <p
        className="text-center text-xs font-semibold uppercase tracking-[0.2em] mb-10 px-4"
        style={{ color: "#2d3748" }}
      >
        Trusted by teams and students worldwide
      </p>

      {/* Marquee */}
      <div className="relative">
        <div
          className="flex gap-3 w-max"
          style={{ animation: "marquee-left 30s linear infinite" }}
        >
          {MARQUEE_ITEMS.map((item, i) => (
            <LogoChip key={`${item.name}-${i}`} item={item} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee-left {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        /* Pause on hover for accessibility */
        .flex:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}