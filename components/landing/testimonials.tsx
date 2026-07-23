export function Testimonials() {
  const testimonials = [
    {
      quote: "OmniPost completely transformed how our agency handles social media. The AI features save us at least 15 hours a week.",
      author: "Sarah Jenkins",
      role: "Marketing Director at GrowthCo"
    },
    {
      quote: "I used to juggle 5 different tools for scheduling, replying, and analytics. Now I do it all from one beautiful dashboard.",
      author: "David Chen",
      role: "Independent Creator"
    },
    {
      quote: "The multi-platform auto-reply is a game changer for product launches. We've seen a 40% increase in engagement.",
      author: "Emily Martinez",
      role: "E-commerce Founder"
    }
  ];

  return (
    <section className="py-24 px-6 bg-zinc-50 dark:bg-[#050508] transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-indigo-600 dark:text-indigo-400 text-sm font-bold uppercase tracking-widest mb-3">Testimonials</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold mb-4 text-zinc-900 dark:text-white">Loved by creators and teams</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white dark:bg-[#0f0f1a] border border-zinc-200 dark:border-[#1e1e2e] shadow-sm dark:shadow-none rounded-2xl p-8 relative">
              <div className="text-indigo-500/10 dark:text-indigo-500/20 text-6xl absolute top-4 left-6 font-serif">&quot;</div>
              <p className="text-zinc-600 dark:text-slate-300 relative z-10 mb-8 leading-relaxed mt-4">
                {t.quote}
              </p>
              <div>
                <div className="text-zinc-900 dark:text-white font-bold">{t.author}</div>
                <div className="text-zinc-500 dark:text-slate-500 text-sm">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
