"use client";

import Link from "next/link";
import { Sparkles, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <nav className="flex justify-between items-center px-6 lg:px-16 py-5 border-b border-zinc-200 dark:border-[#1e1e2e] sticky top-0 bg-white/90 dark:bg-[#0a0a0f]/90 backdrop-blur-xl z-50 transition-colors duration-300">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-500">
          OmniPost
        </span>
      </Link>
      
      <div className="hidden md:flex gap-8">
        <Link href="#features" className="text-zinc-500 hover:text-zinc-900 dark:text-slate-400 dark:hover:text-white transition-colors text-sm font-medium">Features</Link>
        <Link href="#pricing" className="text-zinc-500 hover:text-zinc-900 dark:text-slate-400 dark:hover:text-white transition-colors text-sm font-medium">Pricing</Link>
        <Link href="#how-it-works" className="text-zinc-500 hover:text-zinc-900 dark:text-slate-400 dark:hover:text-white transition-colors text-sm font-medium">How it Works</Link>
        <Link href="#faq" className="text-zinc-500 hover:text-zinc-900 dark:text-slate-400 dark:hover:text-white transition-colors text-sm font-medium">FAQ</Link>
      </div>
      
      <div className="flex items-center gap-4">
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors text-zinc-500 dark:text-zinc-400"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        )}
        
        <Link href="/dashboard" className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5">
          Dashboard
        </Link>
      </div>
    </nav>
  );
}
