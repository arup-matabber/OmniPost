import { BarChart3, TrendingUp, Users, Activity, Clock, MoreHorizontal } from "lucide-react";

const stats = [
  { name: "Total Posts", value: "128", change: "+12%", icon: BarChart3, trend: "up" },
  { name: "Total Reach", value: "45.2K", change: "+24%", icon: Users, trend: "up" },
  { name: "Engagement Rate", value: "4.6%", change: "-1%", icon: Activity, trend: "down" },
  { name: "Follower Growth", value: "+892", change: "+8%", icon: TrendingUp, trend: "up" },
];

const upcomingPosts = [
  { id: 1, title: "Product Launch Announcement", time: "Today, 2:00 PM", platforms: ["Twitter", "LinkedIn"], status: "Scheduled" },
  { id: 2, title: "Weekly Insights Newsletter", time: "Tomorrow, 9:00 AM", platforms: ["LinkedIn"], status: "Draft" },
  { id: 3, title: "Behind the Scenes Office Tour", time: "Jun 15, 4:30 PM", platforms: ["Instagram", "TikTok"], status: "Scheduled" },
];

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Welcome back, User</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg">Here&apos;s what&apos;s happening with your social accounts today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group shadow-sm dark:shadow-none">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <stat.icon className="w-16 h-16 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="text-zinc-500 dark:text-zinc-400 font-medium">{stat.name}</h3>
              <div className={`flex items-center text-sm font-medium ${stat.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {stat.change}
              </div>
            </div>
            <div className="text-3xl font-bold text-zinc-900 dark:text-white relative z-10">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Upcoming Posts</h2>
            <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 text-sm font-medium transition-colors">View Calendar</button>
          </div>
          
          <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm shadow-sm dark:shadow-none">
            <ul className="divide-y divide-zinc-200 dark:divide-white/5">
              {upcomingPosts.map((post) => (
                <li key={post.id} className="p-6 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors flex items-center justify-between group">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-zinc-800 dark:text-zinc-200 font-medium group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">{post.title}</h4>
                      <p className="text-sm text-zinc-500 mt-1">{post.time}</p>
                      <div className="flex gap-2 mt-3">
                        {post.platforms.map(platform => (
                          <span key={platform} className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-white/10 text-xs text-zinc-600 dark:text-zinc-300 font-medium border border-zinc-200 dark:border-white/5">
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      post.status === 'Scheduled' ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                    }`}>
                      {post.status}
                    </span>
                    <button className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Quick Actions</h2>
          <div className="bg-gradient-to-b from-indigo-50 dark:from-indigo-500/10 to-transparent border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-6 backdrop-blur-sm">
            <div className="space-y-4">
              <button className="w-full bg-white dark:bg-white/10 hover:bg-zinc-50 dark:hover:bg-white/20 text-zinc-800 dark:text-white font-medium py-3 px-4 rounded-xl transition-colors border border-zinc-200 dark:border-white/5 flex items-center justify-between group shadow-sm dark:shadow-none">
                <span>Connect new platform</span>
                <span className="text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">→</span>
              </button>
              <button className="w-full bg-white dark:bg-white/10 hover:bg-zinc-50 dark:hover:bg-white/20 text-zinc-800 dark:text-white font-medium py-3 px-4 rounded-xl transition-colors border border-zinc-200 dark:border-white/5 flex items-center justify-between group shadow-sm dark:shadow-none">
                <span>Configure auto-replies</span>
                <span className="text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white pt-2">Recent Activity</h2>
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-sm dark:shadow-none backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-zinc-900 dark:text-white">Instagram Milestone</span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Your Instagram post reached 4.2k users.</span>
              </div>
              <div className="h-px w-full bg-zinc-100 dark:bg-white/5"></div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-zinc-900 dark:text-white">Automation Triggered</span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Auto-reply rule &quot;Pricing&quot; was triggered 14 times today.</span>
              </div>
              <div className="h-px w-full bg-zinc-100 dark:bg-white/5"></div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-zinc-900 dark:text-white">Publishing Success</span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Twitter thread published successfully.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
