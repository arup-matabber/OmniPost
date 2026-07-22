import { checkPlanLimit } from "@/lib/billing/checkPlanLimit";
import { auth } from "@clerk/nextjs/server";
import { PricingTable } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { CreditCard, Zap, HardDrive } from "lucide-react";

export default async function BillingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Fetch all limits concurrently
  const [accounts, posts, autoReply] = await Promise.all([
    checkPlanLimit(userId, "accounts"),
    checkPlanLimit(userId, "posts"),
    checkPlanLimit(userId, "autoReply"),
  ]);

  const plan = accounts.plan;

  const getPercentage = (current: number, limit: number) => {
    if (limit >= 9999) return current > 0 ? 5 : 0; 
    return Math.min(100, Math.round((current / limit) * 100));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            Billing & Subscription
          </h1>
          <p className="text-zinc-500 mt-1">Manage your plan and monitor usage limits.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-sm col-span-1 md:col-span-3">
           <div className="flex items-center justify-between mb-6">
             <div>
               <p className="text-sm text-zinc-500 uppercase tracking-wide font-semibold">Current Plan</p>
               <h2 className="text-2xl font-bold capitalize mt-1 text-zinc-900 dark:text-white">{plan} Plan</h2>
             </div>
             <div className="h-12 w-12 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
               <CreditCard className="h-6 w-6" />
             </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-zinc-100 dark:border-white/5">
             <UsageMeter 
               title="Connected Accounts" 
               current={accounts.current} 
               limit={accounts.limit} 
               percent={getPercentage(accounts.current, accounts.limit)} 
             />
             <UsageMeter 
               title="Scheduled Posts (This Month)" 
               current={posts.current} 
               limit={posts.limit} 
               percent={getPercentage(posts.current, posts.limit)} 
             />
             <UsageMeter 
               title="Auto-Reply Rules" 
               current={autoReply.current} 
               limit={autoReply.limit} 
               percent={getPercentage(autoReply.current, autoReply.limit)} 
             />
           </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Upgrade Plan</h2>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm p-6">
          <PricingTable />
        </div>
      </div>
    </div>
  );
}

function UsageMeter({ title, current, limit, percent }: { title: string, current: number, limit: number, percent: number }) {
  const isUnlimited = limit >= 9999;
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{title}</span>
        <span className="text-xs text-zinc-500">
          <strong className="text-zinc-900 dark:text-white">{current}</strong> / {isUnlimited ? '∞' : limit}
        </span>
      </div>
      <div className="h-2 w-full bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" 
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

