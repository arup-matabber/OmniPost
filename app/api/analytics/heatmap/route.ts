import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { postPlatformResults, posts } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const platformFilter = searchParams.get("platform");

    const userPosts = await db.select({ id: posts.id }).from(posts).where(eq(posts.userId, userId));
    const postIds = userPosts.map(p => p.id);

    if (postIds.length === 0) {
      return NextResponse.json([]);
    }

    const conditions = [
      inArray(postPlatformResults.postId, postIds),
      eq(postPlatformResults.status, 'success'),
    ];

    if (platformFilter && platformFilter !== 'all') {
      conditions.push(eq(postPlatformResults.platform, platformFilter));
    }

    const results = await db.select().from(postPlatformResults).where(and(...conditions));

    // Aggregate by day of week (0-6) and hour (0-23)
    const heatmapData: Record<string, { count: number, totalEngagements: number }> = {};
    
    // Initialize the grid
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (const day of days) {
      for (let hour = 0; hour < 24; hour++) {
        heatmapData[`${day}-${hour}`] = { count: 0, totalEngagements: 0 };
      }
    }

    results.forEach(row => {
      if (!row.publishedAt) return;
      
      const date = new Date(row.publishedAt);
      const day = days[date.getDay()];
      const hour = date.getHours();
      
      const key = `${day}-${hour}`;
      const eng = (row.likes || 0) + (row.comments || 0) + (row.shares || 0);
      
      if (heatmapData[key]) {
        heatmapData[key].count += 1;
        heatmapData[key].totalEngagements += eng;
      }
    });

    const formattedHeatmap = [];
    for (const day of days) {
      for (let hour = 0; hour < 24; hour++) {
        const key = `${day}-${hour}`;
        const data = heatmapData[key];
        const avgEngagement = data.count > 0 ? Math.round(data.totalEngagements / data.count) : 0;
        formattedHeatmap.push({
          day,
          hour,
          value: avgEngagement
        });
      }
    }

    return NextResponse.json(formattedHeatmap);

  } catch (error) {
    console.error("[ANALYTICS_HEATMAP]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
