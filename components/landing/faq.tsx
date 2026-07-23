"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FAQ() {
  const faqs = [
    {
      question: "Which platforms do you support?",
      answer: "We currently support Instagram, YouTube, TikTok, Facebook, LinkedIn, Pinterest, Discord, Twitter, and Slack."
    },
    {
      question: "Do I need to give you my passwords?",
      answer: "No. We use official APIs and OAuth for all platforms. You simply authorize OmniPost without ever sharing your login credentials."
    },
    {
      question: "How does the AI auto-reply work?",
      answer: "You can set up keyword triggers (e.g., 'price', 'link'). When a user comments that keyword, OmniPost automatically replies with a predefined or AI-generated response."
    },
    {
      question: "Can I cancel my subscription at any time?",
      answer: "Yes, you can cancel your subscription at any time from your billing dashboard. You will retain access until the end of your billing cycle."
    }
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 px-6 bg-white dark:bg-[#0a0a0f] border-t border-zinc-200 dark:border-[#1e1e2e] transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-indigo-600 dark:text-indigo-400 text-sm font-bold uppercase tracking-widest mb-3">FAQ</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold mb-4 text-zinc-900 dark:text-white">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                openIdx === idx ? 'border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/5' : 'border-zinc-200 dark:border-[#1e1e2e] bg-zinc-50 dark:bg-[#0f0f1a] hover:border-zinc-300 dark:hover:border-slate-700'
              }`}
            >
              <button 
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="text-lg font-semibold text-zinc-900 dark:text-white">{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-zinc-500 dark:text-slate-400 transition-transform duration-300 ${openIdx === idx ? 'rotate-180' : ''}`} />
              </button>
              
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                  openIdx === idx ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-zinc-600 dark:text-slate-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
