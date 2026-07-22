import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { posts, scheduledJobs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
// import { inngest } from "@/lib/inngest/client"; // For event cancellation if needed

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const post = await db.query.posts.findFirst({
      where: (posts, { eq, and }) => and(eq(posts.id, id), eq(posts.userId, userId))
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post }, { status: 200 });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();

    const [updatedPost] = await db.update(posts)
      .set({ ...body, updatedAt: new Date() })
      .where(and(eq(posts.id, id), eq(posts.userId, userId)))
      .returning();

    if (!updatedPost) {
      return NextResponse.json({ error: "Post not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ post: updatedPost }, { status: 200 });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;

    // Optional: Cancel Inngest Job if it was scheduled.
    // Inngest cancellation is typically handled via step.sleep cancellation or event matching.
    // For now, we update the scheduled job status in DB.

    await db.update(scheduledJobs)
      .set({ status: 'cancelled' })
      .where(eq(scheduledJobs.postId, id));

    const [deletedPost] = await db.delete(posts)
      .where(and(eq(posts.id, id), eq(posts.userId, userId)))
      .returning();

    if (!deletedPost) {
      return NextResponse.json({ error: "Post not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, post: deletedPost }, { status: 200 });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
