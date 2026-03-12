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

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-2 h-2 rounded-full bg-[#6C3AFF]/40 top-[15%] left-[10%] animate-float" style={{ animationDuration: "3.5s" }} />
        <div className="absolute w-1.5 h-1.5 rounded-full bg-[#06B6D4]/40 top-[25%] left-[80%] animate-float" style={{ animationDuration: "4.2s", animationDelay: "0.5s" }} />
        <div className="absolute w-2.5 h-2.5 rounded-full bg-[#8B5CF6]/30 top-[60%] left-[15%] animate-float" style={{ animationDuration: "5s", animationDelay: "1s" }} />
        <div className="absolute w-1.5 h-1.5 rounded-full bg-[#06B6D4]/30 top-[70%] left-[75%] animate-float" style={{ animationDuration: "3.8s", animationDelay: "1.5s" }} />
        <div className="absolute w-2 h-2 rounded-full bg-[#6C3AFF]/50 top-[40%] left-[90%] animate-float" style={{ animationDuration: "4.5s", animationDelay: "0.8s" }} />
        <div className="absolute w-1 h-1 rounded-full bg-white/20 top-[80%] left-[40%] animate-float" style={{ animationDuration: "6s", animationDelay: "2s" }} />
        <div className="absolute w-2 h-2 rounded-full bg-[#F59E0B]/20 top-[20%] left-[50%] animate-float" style={{ animationDuration: "4s", animationDelay: "0.3s" }} />
        <div className="absolute w-1.5 h-1.5 rounded-full bg-[#8B5CF6]/40 top-[50%] left-[5%] animate-float" style={{ animationDuration: "5.5s", animationDelay: "1.2s" }} />
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
