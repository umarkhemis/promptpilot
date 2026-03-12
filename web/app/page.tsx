import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Wrench, BookOpen } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="PromptPilot" width={32} height={32} />
            <span className="font-bold text-xl text-slate-900 dark:text-white">PromptPilot</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 bg-gradient-to-b from-brand-50 via-white to-white dark:from-slate-800 dark:via-slate-900 dark:to-slate-900">
        <div className="inline-flex items-center gap-2 bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Sparkles className="w-4 h-4" />
          AI-powered prompt engineering
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight max-w-3xl">
          Stop guessing.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">
            Start prompting like a pro.
          </span>
        </h1>
        <p className="mt-6 text-xl text-slate-600 dark:text-slate-400 max-w-2xl">
          PromptPilot improves your prompts, picks the right AI tool, and gives you results that
          actually work — whether you&apos;re a marketer or a student.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-3.5 rounded-xl text-lg transition-colors shadow-lg shadow-brand-500/30"
          >
            Start for free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium px-6 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
          >
            Already have an account?
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Everything you need to master AI
            </h2>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
              Three powerful features working together seamlessly.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles className="w-7 h-7 text-brand-500" />,
                title: "Prompt Improver",
                description:
                  "Transform vague ideas into precise, effective prompts that get you the results you actually want from any AI model.",
              },
              {
                icon: <Wrench className="w-7 h-7 text-brand-500" />,
                title: "Tool Recommender",
                description:
                  "Not sure which AI tool to use? We analyze your intent and recommend the best tool — ChatGPT, Claude, Midjourney, and more.",
              },
              {
                icon: <BookOpen className="w-7 h-7 text-brand-500" />,
                title: "Templates Library",
                description:
                  "Start fast with curated prompt templates for marketing copy, essays, research, social posts, and dozens of other use cases.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 hover:border-brand-200 dark:hover:border-brand-800 transition-colors"
              >
                <div className="w-14 h-14 bg-brand-50 dark:bg-brand-900/30 rounded-xl flex items-center justify-center mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">How it works</h2>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
              Three steps from rough idea to polished result.
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-brand-100 dark:bg-brand-900 hidden md:block" />
            <div className="space-y-8">
              {[
                {
                  step: "01",
                  title: "Write your idea",
                  description:
                    "Type your rough prompt or idea. No need to be precise — just describe what you want to achieve in plain language.",
                },
                {
                  step: "02",
                  title: "We improve & route",
                  description:
                    "PromptPilot analyzes your intent, rewrites your prompt for clarity and effectiveness, and identifies the best AI tool for the job.",
                },
                {
                  step: "03",
                  title: "Get results",
                  description:
                    "Copy your optimized prompt, click through to the recommended tool, and get AI outputs that actually match what you had in mind.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-6 items-start relative">
                  <div className="flex-shrink-0 w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg z-10">
                    {item.step}
                  </div>
                  <div className="pt-2">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4 bg-gradient-to-r from-brand-500 to-brand-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to level up your prompts?</h2>
          <p className="text-brand-100 text-lg mb-8">
            Join thousands of marketers and students already using PromptPilot.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-brand-600 font-semibold px-8 py-3.5 rounded-xl text-lg hover:bg-brand-50 transition-colors shadow-lg"
          >
            Get started — it&apos;s free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="PromptPilot" width={24} height={24} />
            <span className="font-semibold text-slate-700 dark:text-slate-300">PromptPilot</span>
          </div>
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} PromptPilot. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
