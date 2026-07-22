"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

export default function SettingsPage() {
  const { setTheme: setNextTheme, theme: nextTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    timezone: "UTC",
    theme: "system",
    aiDefaultTone: "Professional",
    emailNotifications: {
      postSuccess: true,
      postFailure: true,
      weeklyAnalytics: true,
      autoReplyTriggered: false,
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings({
            timezone: data.timezone || "UTC",
            theme: data.theme || "system",
            aiDefaultTone: data.aiDefaultTone || "Professional",
            emailNotifications: data.emailNotifications || {
              postSuccess: true,
              postFailure: true,
              weeklyAnalytics: true,
              autoReplyTriggered: false,
            }
          });
        }
      } catch (error) {
        console.error("Failed to load settings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast.success("Settings Saved", {
          description: "Your preferences have been updated successfully.",
        });
        
        if (settings.theme !== nextTheme) {
          setNextTheme(settings.theme);
        }
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to save settings. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateEmailPref = (key: keyof typeof settings.emailNotifications, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      emailNotifications: {
        ...prev.emailNotifications,
        [key]: checked
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="ai">AI Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Settings</CardTitle>
              <CardDescription>Manage your timezone and appearance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={settings.timezone} onValueChange={(val) => val && setSettings({ ...settings, timezone: val })}>
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Select Timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time (US & Canada)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (US & Canada)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (US & Canada)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (US & Canada)</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Europe/Paris">Paris</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    <SelectItem value="Asia/Kolkata">India Standard Time</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">All scheduled posts will use this timezone.</p>
              </div>

              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={settings.theme} onValueChange={(val) => val && setSettings({ ...settings, theme: val })}>
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Select Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Default Tone</CardTitle>
              <CardDescription>Set the default persona for AI-generated posts and auto-replies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Default Tone</Label>
                <Select value={settings.aiDefaultTone} onValueChange={(val) => val && setSettings({ ...settings, aiDefaultTone: val })}>
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Select Tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Professional">Professional</SelectItem>
                    <SelectItem value="Casual">Casual</SelectItem>
                    <SelectItem value="Humorous">Humorous / Witty</SelectItem>
                    <SelectItem value="Enthusiastic">Enthusiastic</SelectItem>
                    <SelectItem value="Educational">Educational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
