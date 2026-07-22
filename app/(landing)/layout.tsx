import { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "OmniPost - One Platform. Every Social Network.",
  description: "Create, schedule, and automate your social media presence across Instagram, YouTube, TikTok, and more — powered by AI.",
  openGraph: {
    title: "OmniPost - One Platform. Every Social Network.",
    description: "Create, schedule, and automate your social media presence across all major platforms.",
    type: "website",
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-zinc-900 dark:text-white selection:bg-indigo-500/30 font-sans transition-colors duration-300">
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </div>
  );
}
