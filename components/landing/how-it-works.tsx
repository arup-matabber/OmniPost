export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Connect Platforms",
      description: "Securely link your social media accounts in seconds using official integrations. No passwords required."
    },
    {
      number: "02",
      title: "Create & Schedule",
      description: "Use our AI tools to draft content, attach media, and schedule it across all your connected channels."
    },
    {
      number: "03",
      title: "Analyze & Automate",
      description: "Sit back as OmniPost publishes your content, handles basic replies, and gathers performance metrics."
    }
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 bg-zinc-50 dark:bg-[#050508] border-t border-zinc-200 dark:border-[#1e1e2e] transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-indigo-600 dark:text-indigo-400 text-sm font-bold uppercase tracking-widest mb-3">Workflow</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold mb-4 text-zinc-900 dark:text-white">How it Works</h3>
          <p className="text-xl text-zinc-600 dark:text-slate-400 max-w-2xl mx-auto">
            From idea to published across the internet in three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-gradient-to-r from-indigo-500/0 via-indigo-500/20 dark:via-indigo-500/50 to-indigo-500/0" />

          {steps.map((step, idx) => (
            <div key={idx} className="relative pt-8 md:pt-0 z-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-white dark:bg-[#0f0f1a] border-2 border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-xl font-black text-indigo-600 dark:text-indigo-400 mb-6 shadow-sm dark:shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                {step.number}
              </div>
              <h4 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">{step.title}</h4>
              <p className="text-zinc-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
