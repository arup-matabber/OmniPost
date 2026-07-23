import { ArrowRight, PlayCircle } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="text-center px-6 pt-24 pb-20 md:pt-32 md:pb-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] -z-10" />
      
      <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-sm text-indigo-600 dark:text-indigo-300 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
        Now supporting 9 social platforms
      </div>
      
      <h1 className="text-5xl md:text-7xl font-black leading-[1.1] max-w-4xl mx-auto mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 fill-mode-both text-zinc-900 dark:text-white">
        One Platform.<br />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
          Every Social Network.
        </span>
      </h1>
      
      <p className="text-lg md:text-xl text-zinc-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
        Create, schedule, and automate your social media presence across Instagram, YouTube, TikTok, and more — powered by AI.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300 fill-mode-both">
        <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-lg font-bold transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2">
          Go to Dashboard
          <ArrowRight className="w-5 h-5" />
        </Link>
        <button className="w-full sm:w-auto px-8 py-4 rounded-xl border border-zinc-200 dark:border-slate-700 hover:bg-zinc-50 dark:hover:border-slate-500 text-zinc-900 dark:text-white text-lg font-medium transition-colors flex items-center justify-center gap-2 bg-white/50 dark:bg-[#0a0a0f]/50">
          <PlayCircle className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          Watch Demo
        </button>
      </div>
    </section>
  );
}
