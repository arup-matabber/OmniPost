import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { posts, scheduledJobs } from "@/lib/db/schema";
import { inngest } from "@/lib/inngest/client";
import { checkPlanLimit } from "@/lib/billing/checkPlanLimit";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const limitCheck = await checkPlanLimit(userId, 'posts');
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: "Free plan limits reached. Upgrade to Pro to schedule more posts this month." }, { status: 402 });
    }

    const { content, mediaUrls, platformTargets, status, scheduledAt } = await req.json();

    const [post] = await db.insert(posts).values({
      userId,
      content,
      mediaUrls,
      platformTargets,
      status: status || 'draft',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    }).returning();

    if (status === 'scheduled' && scheduledAt) {
      // Enqueue the job with Inngest
      const { ids } = await inngest.send({
        name: "post/publish.scheduled",
        data: { postId: post.id, userId, scheduledAt },
      });

      if (ids && ids.length > 0) {
        await db.insert(scheduledJobs).values({
          jobId: ids[0],
          postId: post.id,
          type: 'post_publish',
          status: 'pending'
        });
      }
    } else if (status === 'published') {
      // Send immediate post via inngest
      await inngest.send({
        name: "post/publish.now",
        data: { postId: post.id }
      });
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    // Simple get all for user
    const userPosts = await db.query.posts.findMany({
      where: (posts, { eq, and, or, gte, lte }) => {
        const conditions = [eq(posts.userId, userId)];
        if (statusFilter === 'posted') {
          const condition = or(eq(posts.status, 'posted'), eq(posts.status, 'published'));
          if (condition) conditions.push(condition);
        } else if (statusFilter && statusFilter !== 'all') {
          conditions.push(eq(posts.status, statusFilter));
        }
        if (start && end) {
          const condition = or(
              and(gte(posts.scheduledAt, new Date(start)), lte(posts.scheduledAt, new Date(end))),
              and(gte(posts.createdAt, new Date(start)), lte(posts.createdAt, new Date(end)))
            );
          if (condition) conditions.push(condition);
        }
        return and(...conditions);
      },
      orderBy: (posts, { asc, desc }) => {
        if (statusFilter === 'scheduled') {
          return [asc(posts.scheduledAt)];
        }
        return [desc(posts.createdAt)];
      }
    });

    return NextResponse.json({ posts: userPosts }, { status: 200 });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
