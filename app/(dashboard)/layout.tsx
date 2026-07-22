import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden font-sans transition-colors duration-300">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        {/* Subtle background glow effect */}
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}
