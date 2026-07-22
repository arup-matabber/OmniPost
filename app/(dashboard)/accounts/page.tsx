"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Unplug, CheckCircle2 } from "lucide-react";
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

// Platform definitions
const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: FaInstagram, color: "text-pink-500" },
  { id: "youtube", name: "YouTube", icon: FaYoutube, color: "text-red-500" },
  { id: "tiktok", name: "TikTok", icon: FaTiktok, color: "text-zinc-900 dark:text-white" },
  { id: "facebook", name: "Facebook", icon: FaFacebook, color: "text-blue-600" },
  { id: "linkedin", name: "LinkedIn", icon: FaLinkedin, color: "text-blue-700" },
  { id: "pinterest", name: "Pinterest", icon: FaPinterest, color: "text-red-600" },
  { id: "discord", name: "Discord", icon: FaDiscord, color: "text-indigo-500" },
  { id: "twitter", name: "Twitter/X", icon: FaXTwitter, color: "text-zinc-900 dark:text-white" },
  { id: "slack", name: "Slack", icon: FaSlack, color: "text-green-600" }
];

type SocialAccount = {
  id: string;
  platform: string;
  platformAccountId: string | null;
  platformAccountName: string | null;
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch("/api/social/accounts");
        if (res.ok) {
          const data = await res.json();
          setAccounts(data.accounts || []);
        }
      } catch (err) {
        console.error("Failed to fetch accounts", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleConnect = (platformId: string) => {
    window.location.assign(`/api/social/${platformId}/connect`);
  };

  const handleDisconnect = async (id: string) => {
    setDisconnectingId(id);
    try {
      const res = await fetch(`/api/social/accounts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAccounts((prev) => prev.filter((acc) => acc.id !== id));
      }
    } catch (err) {
      console.error("Failed to disconnect", err);
    } finally {
      setDisconnectingId(null);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Connected Accounts</h1>
        <p className="text-zinc-500 dark:text-slate-400 mt-2">
          Manage your social media integrations to automatically cross-post and reply.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLATFORMS.map((platform) => {
            // Find connected accounts for this platform
            const connectedAccounts = accounts.filter(a => a.platform === platform.id);
            const isConnected = connectedAccounts.length > 0;
            const Icon = platform.icon;

            return (
              <Card key={platform.id} className="relative overflow-hidden group hover:shadow-md transition-shadow dark:bg-[#0f0f1a] dark:border-[#1e1e2e]">
                {isConnected && (
                  <div className="absolute top-0 right-0 p-4">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-zinc-100 dark:bg-[#151525] ${platform.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{platform.name}</CardTitle>
                      <CardDescription className="dark:text-slate-400">
                        {isConnected ? `${connectedAccounts.length} Connected` : "Not connected"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {isConnected ? (
                    <div className="space-y-3">
                      {connectedAccounts.map(acc => (
                        <div key={acc.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5">
                          <div className="font-medium text-sm truncate dark:text-slate-300">
                            {acc.platformAccountName || `Unknown ${platform.name}`}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 h-8 w-8"
                            onClick={() => handleDisconnect(acc.id)}
                            disabled={disconnectingId === acc.id}
                          >
                            {disconnectingId === acc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unplug className="w-4 h-4" />}
                          </Button>
                        </div>
                      ))}
                      
                      {/* Allow adding multiple accounts for the same platform */}
                      <Button 
                        variant="outline" 
                        className="w-full mt-2 dark:border-slate-700 dark:hover:bg-[#1e1e2e]" 
                        onClick={() => handleConnect(platform.id)}
                      >
                        <Plus className="w-4 h-4 mr-2" /> Connect Another
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" 
                      onClick={() => handleConnect(platform.id)}
                    >
                      Connect {platform.name}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
