"use client";

const LOGOS = [
  "Stanford University",
  "Harvard Med",
  "TechCorp Inc.",
  "CreativeAgency",
  "StartupHub",
  "GrowthCo",
  "MediaLabs",
  "DigitalFirst",
];

// Duplicate list to create a seamless infinite marquee
const MARQUEE_ITEMS = [...LOGOS, ...LOGOS];

export function SocialProof() {
  return (
    <section className="py-16 px-4 bg-white border-b border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-widest mb-10">
          Trusted by teams and students worldwide
        </p>
      </div>
      <div className="relative">
        <div className="flex animate-marquee whitespace-nowrap gap-6">
          {MARQUEE_ITEMS.map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="flex-shrink-0 px-5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 font-semibold text-sm hover:border-slate-300 hover:text-slate-700 transition-colors duration-200"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
