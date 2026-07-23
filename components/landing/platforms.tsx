import { 
  FaInstagram, 
  FaYoutube, 
  FaTiktok, 
  FaFacebook, 
  FaLinkedin, 
  FaPinterest, 
  FaDiscord, 
  FaXTwitter, 
  FaSlack 
} from "react-icons/fa6";

export function Platforms() {
  const platforms = [
    { name: "Instagram", icon: FaInstagram, color: "text-pink-500" },
    { name: "YouTube", icon: FaYoutube, color: "text-red-500" },
    { name: "TikTok", icon: FaTiktok, color: "text-zinc-900 dark:text-white" },
    { name: "Facebook", icon: FaFacebook, color: "text-blue-600" },
    { name: "LinkedIn", icon: FaLinkedin, color: "text-blue-700" },
    { name: "Pinterest", icon: FaPinterest, color: "text-red-600" },
    { name: "Discord", icon: FaDiscord, color: "text-indigo-500" },
    { name: "Twitter", icon: FaXTwitter, color: "text-zinc-900 dark:text-white" },
    { name: "Slack", icon: FaSlack, color: "text-green-600" }
  ];

  return (
    <section className="py-16 border-y border-zinc-200 dark:border-[#1e1e2e] bg-zinc-50 dark:bg-[#0a0a0f]/50 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-center text-zinc-500 dark:text-slate-500 text-sm uppercase tracking-[0.2em] mb-8 font-semibold">
          Trusted across all major platforms
        </p>
        <div className="flex justify-center gap-6 md:gap-12 flex-wrap">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <div 
                key={platform.name} 
                className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white dark:bg-[#1e1e2e] shadow-sm dark:shadow-none flex items-center justify-center font-bold text-zinc-400 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-indigo-500/20 transition-colors border border-zinc-200 dark:border-transparent hover:border-indigo-200 dark:hover:border-indigo-500/30 cursor-default"
                title={platform.name}
              >
                <Icon className={`w-6 h-6 md:w-8 md:h-8 transition-colors group-hover:${platform.color}`} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
