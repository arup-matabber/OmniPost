import { Calendar, PenLine, MessageSquare, Image as ImageIcon, BarChart3, Link as LinkIcon } from "lucide-react";

const features = [
  {
    icon: <Calendar className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />,
    title: "Smart Scheduling",
    description: "Schedule posts to go live at the perfect time across all your platforms simultaneously."
  },
  {
    icon: <PenLine className="w-6 h-6 text-purple-500 dark:text-purple-400" />,
    title: "AI Caption Writer",
    description: "Generate platform-optimized captions and hashtags with Gemini AI in one click."
  },
  {
    icon: <MessageSquare className="w-6 h-6 text-pink-500 dark:text-pink-400" />,
    title: "Auto Comment Reply",
    description: "Set keyword triggers and let AI respond to comments automatically, 24/7."
  },
  {
    icon: <ImageIcon className="w-6 h-6 text-blue-500 dark:text-blue-400" />,
    title: "Media Management",
    description: "Upload once, auto-transform for each platform's optimal dimensions via ImageKit."
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />,
    title: "Analytics Dashboard",
    description: "Track engagement, reach, and growth across all platforms in one unified view."
  },
  {
    icon: <LinkIcon className="w-6 h-6 text-orange-500 dark:text-orange-400" />,
    title: "Multi-Platform",
    description: "Connect Instagram, YouTube, TikTok, Facebook, LinkedIn, Pinterest, Discord, Twitter & Slack."
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 px-6 relative transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-indigo-600 dark:text-indigo-400 text-sm font-bold uppercase tracking-widest mb-3">Features</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold mb-4 text-zinc-900 dark:text-white">Everything you need to grow</h3>
          <p className="text-xl text-zinc-600 dark:text-slate-400 max-w-2xl mx-auto">
            Powerful tools built for modern creators and marketing teams
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="bg-white dark:bg-[#0f0f1a] border border-zinc-200 dark:border-[#1e1e2e] shadow-sm dark:shadow-none rounded-2xl p-8 hover:bg-zinc-50 dark:hover:bg-[#151525] transition-colors group"
            >
              <div className="w-14 h-14 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">{feature.title}</h4>
              <p className="text-zinc-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
