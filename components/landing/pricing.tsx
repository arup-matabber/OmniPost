import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    desc: "Perfect for getting started",
    features: [
      "2 connected accounts",
      "10 scheduled posts/mo",
      "1 auto-reply rule",
      "Basic analytics",
      "500MB media storage"
    ],
    cta: "Get Started Free",
    featured: false,
    link: "#"
  },
  {
    name: "Pro",
    price: "$19",
    desc: "For serious creators",
    features: [
      "10 connected accounts",
      "100 scheduled posts/mo",
      "10 auto-reply rules",
      "AI caption generation",
      "AI auto-reply",
      "Advanced analytics",
      "5GB media storage"
    ],
    cta: "Start Pro Trial",
    featured: true,
    badge: "Most Popular",
    link: "#"
  },
  {
    name: "Business",
    price: "$49",
    desc: "For teams & agencies",
    features: [
      "Unlimited accounts",
      "Unlimited posts",
      "Unlimited auto-reply rules",
      "5 team members",
      "Analytics export",
      "50GB media storage",
      "Priority support"
    ],
    cta: "Start Business Trial",
    featured: false,
    link: "#"
  }
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6 bg-white dark:bg-[#0a0a0f] border-t border-zinc-200 dark:border-[#1e1e2e] transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-indigo-600 dark:text-indigo-400 text-sm font-bold uppercase tracking-widest mb-3">Pricing</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold mb-4 text-zinc-900 dark:text-white">Simple, transparent pricing</h3>
          <p className="text-xl text-zinc-600 dark:text-slate-400 max-w-2xl mx-auto">
            Start free, scale as you grow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, idx) => (
            <div 
              key={idx} 
              className={`rounded-[2rem] p-8 relative flex flex-col ${
                plan.featured 
                  ? 'bg-gradient-to-b from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/5 border border-indigo-200 dark:border-indigo-500/30 shadow-xl shadow-indigo-500/10 dark:shadow-[0_0_40px_rgba(99,102,241,0.1)]' 
                  : 'bg-zinc-50 dark:bg-[#0f0f1a] border border-zinc-200 dark:border-[#1e1e2e]'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                  {plan.badge}
                </div>
              )}
              
              <div className="mb-8">
                <h4 className="text-zinc-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">{plan.name}</h4>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-black text-zinc-900 dark:text-white">{plan.price}</span>
                  <span className="text-zinc-500 dark:text-slate-400 text-lg">/mo</span>
                </div>
                <p className="text-zinc-500 dark:text-slate-500 text-sm">{plan.desc}</p>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                    <span className="text-zinc-700 dark:text-slate-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <a 
                href={plan.link}
                className={`block w-full py-4 rounded-xl text-center font-bold text-sm transition-all ${
                  plan.featured
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5'
                    : 'bg-transparent border border-zinc-300 dark:border-slate-700 text-zinc-900 dark:text-white hover:border-zinc-400 dark:hover:border-slate-500 hover:bg-zinc-100 dark:hover:bg-[#1e1e2e]'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
