import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FinalCta() {
  return (
    <section className="py-24 px-4 hero-gradient-bg relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 purple-blob opacity-40 blur-3xl -translate-y-1/2" />
        <div className="absolute top-1/2 right-1/4 w-80 h-80 cyan-blob opacity-30 blur-3xl -translate-y-1/2" />
      </div>

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <h2 className="text-3xl sm:text-[40px] lg:text-5xl font-extrabold text-white mb-6">
          Ready to prompt{" "}
          <span className="gradient-text">like a pro?</span>
        </h2>
        <p className="text-lg sm:text-xl text-slate-400 mb-10">
          Join 500+ marketers and students who are getting better AI results.
        </p>
        <Link
          href="/register"
          className="group inline-flex items-center gap-3 bg-[#6C3AFF] hover:bg-[#8B5CF6] text-white font-bold px-10 py-4 rounded-xl text-xl transition-all duration-200 shadow-xl shadow-purple-500/40 hover:shadow-purple-500/60 hover:scale-105"
        >
          Get started free
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </Link>
        <p className="mt-6 text-slate-500 text-sm">No credit card required</p>
      </div>
    </section>
  );
}
