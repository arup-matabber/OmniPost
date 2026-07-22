import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { postPlatformResults, posts } from "@/lib/db/schema";
import { eq, and, gte, lte, inArray, desc } from "drizzle-orm";
import { subDays, startOfDay, endOfDay } from "date-fns";

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

    const toDate = toStr ? new Date(toStr) : new Date();
    const fromDate = fromStr ? new Date(fromStr) : subDays(new Date(), 30);

    const userPosts = await db.select({ id: posts.id, content: posts.content, mediaUrls: posts.mediaUrls }).from(posts).where(eq(posts.userId, userId));
    const postMap = new Map(userPosts.map(p => [p.id, p]));
    const postIds = userPosts.map(p => p.id);

    if (postIds.length === 0) {
      return NextResponse.json([]);
    }

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

    // Combine with post content
    const enrichedResults = results.map(row => {
      const parentPost = postMap.get(row.postId);
      return {
        id: row.id,
        platform: row.platform,
        publishedAt: row.publishedAt,
        contentPreview: parentPost?.content ? parentPost.content.substring(0, 50) + '...' : 'Media Post',
        reach: row.reach || 0,
        likes: row.likes || 0,
        comments: row.comments || 0,
        shares: row.shares || 0,
        engagements: (row.likes || 0) + (row.comments || 0) + (row.shares || 0)
      };
    });

    // Sort by engagements desc
    enrichedResults.sort((a, b) => b.engagements - a.engagements);

    return NextResponse.json(enrichedResults.slice(0, 50)); // Return top 50

  } catch (error) {
    console.error("[ANALYTICS_POSTS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
