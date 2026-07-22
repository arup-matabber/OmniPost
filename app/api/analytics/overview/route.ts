import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { postPlatformResults, posts } from "@/lib/db/schema";
import { eq, and, gte, lte, inArray, desc } from "drizzle-orm";
import { subDays, startOfDay, endOfDay, format } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fromStr = searchParams.get("from");
    const toStr = searchParams.get("to");
    const platformFilter = searchParams.get("platform");

    // Default to last 30 days if not provided
    const toDate = toStr ? new Date(toStr) : new Date();
    const fromDate = fromStr ? new Date(fromStr) : subDays(new Date(), 30);

    // Get user's posts
    const userPosts = await db.select({ id: posts.id }).from(posts).where(eq(posts.userId, userId));
    const postIds = userPosts.map(p => p.id);

    if (postIds.length === 0) {
      return NextResponse.json({
        overview: { reach: 0, impressions: 0, engagements: 0, engagementRate: 0 },
        timeSeries: [],
        platformBreakdown: []
      });
    }

    // Build query conditions
    const conditions = [
      inArray(postPlatformResults.postId, postIds),
      eq(postPlatformResults.status, 'success'),
      gte(postPlatformResults.publishedAt, startOfDay(fromDate)),
      lte(postPlatformResults.publishedAt, endOfDay(toDate))
    ];

    if (platformFilter && platformFilter !== 'all') {
      conditions.push(eq(postPlatformResults.platform, platformFilter));
    }

    const results = await db.select().from(postPlatformResults).where(and(...conditions));

    // Aggregate overview metrics
    let reach = 0;
    let impressions = 0;
    let engagements = 0;

    // Time series map
    const timeSeriesMap: Record<string, any> = {};
    
    // Platform breakdown map
    const platformMap: Record<string, any> = {};

    results.forEach(row => {
      const r = row.reach || 0;
      const i = row.impressions || 0;
      const eng = (row.likes || 0) + (row.comments || 0) + (row.shares || 0);

      reach += r;
      impressions += i;
      engagements += eng;

      // Group by date
      if (row.publishedAt) {
        const dateStr = format(row.publishedAt, 'MMM dd');
        if (!timeSeriesMap[dateStr]) {
          timeSeriesMap[dateStr] = { date: dateStr, reach: 0, engagements: 0 };
        }
        timeSeriesMap[dateStr].reach += r;
        timeSeriesMap[dateStr].engagements += eng;
      }

      // Group by platform
      if (!platformMap[row.platform]) {
        platformMap[row.platform] = { name: row.platform, reach: 0, engagements: 0 };
      }
      platformMap[row.platform].reach += r;
      platformMap[row.platform].engagements += eng;
    });

    const engagementRate = reach > 0 ? (engagements / reach) * 100 : 0;

    // Convert maps to sorted arrays
    const timeSeries = Object.values(timeSeriesMap);
    // Sort by actual date. We can just sort by the string for simplicity or keep it sorted if we use proper dates, but usually it's close enough if sequential.
    // A better way is to iterate from `fromDate` to `toDate` and fill in blanks.
    
    const filledTimeSeries = [];
    for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
      const dStr = format(d, 'MMM dd');
      filledTimeSeries.push(timeSeriesMap[dStr] || { date: dStr, reach: 0, engagements: 0 });
    }

    const platformBreakdown = Object.values(platformMap);

    return NextResponse.json({
      overview: { 
        reach, 
        impressions, 
        engagements, 
        engagementRate: engagementRate.toFixed(2) 
      },
      timeSeries: filledTimeSeries,
      platformBreakdown
    });

  } catch (error) {
    console.error("[ANALYTICS_OVERVIEW]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
