import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-zinc-200 dark:border-[#1e1e2e] bg-zinc-50 dark:bg-[#050508] transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-purple-600">
            <Sparkles className="h-3 w-3 text-white" />
          </div>
          <span className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-500">
            OmniPost
          </span>
        </div>

        <p className="text-zinc-500 dark:text-slate-500 text-sm">
          © {new Date().getFullYear()} OmniPost. All rights reserved.
        </p>

        <div className="flex gap-6">
          <Link href="#" className="text-zinc-500 hover:text-zinc-900 dark:text-slate-500 dark:hover:text-white transition-colors text-sm">Privacy</Link>
          <Link href="#" className="text-zinc-500 hover:text-zinc-900 dark:text-slate-500 dark:hover:text-white transition-colors text-sm">Terms</Link>
          <Link href="#" className="text-zinc-500 hover:text-zinc-900 dark:text-slate-500 dark:hover:text-white transition-colors text-sm">Contact</Link>
        </div>

      </div>
    </footer>
  );
}
