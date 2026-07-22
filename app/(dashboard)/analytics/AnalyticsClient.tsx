"use client";

import React, { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { OverviewCards } from "@/components/analytics/OverviewCards";
import { EngagementChart } from "@/components/analytics/EngagementChart";
import { PlatformBreakdown } from "@/components/analytics/PlatformBreakdown";
import { TopPostsTable } from "@/components/analytics/TopPostsTable";
import { BestTimeHeatmap } from "@/components/analytics/BestTimeHeatmap";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function AnalyticsClient() {
  const [dateRange, setDateRange] = useState("30");
  const [platform, setPlatform] = useState("all");
  
  const [overviewData, setOverviewData] = useState<any>(null);
  const [postsData, setPostsData] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const to = new Date();
        const from = subDays(to, parseInt(dateRange));
        
        const params = new URLSearchParams({
          from: from.toISOString(),
          to: to.toISOString(),
          platform: platform
        });

        const [overviewRes, postsRes, heatmapRes] = await Promise.all([
          fetch(`/api/analytics/overview?${params.toString()}`),
          fetch(`/api/analytics/posts?${params.toString()}`),
          fetch(`/api/analytics/heatmap?platform=${platform}`) // Heatmap typically looks at all time or 90 days, but we can pass params
        ]);

        if (overviewRes.ok) setOverviewData(await overviewRes.json());
        if (postsRes.ok) setPostsData(await postsRes.json());
        if (heatmapRes.ok) setHeatmapData(await heatmapRes.json());

      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange, platform]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center space-x-2">
        <Select value={dateRange} onValueChange={(val) => val && setDateRange(val)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={platform} onValueChange={(val) => val && setPlatform(val)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Platforms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="twitter">Twitter</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {overviewData && <OverviewCards overview={overviewData.overview} />}
          
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
            {overviewData && <EngagementChart data={overviewData.timeSeries} />}
            {overviewData && <PlatformBreakdown data={overviewData.platformBreakdown} />}
          </div>

          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
            <TopPostsTable posts={postsData} />
            <BestTimeHeatmap data={heatmapData} />
          </div>
        </>
      )}
    </div>
  );
}
