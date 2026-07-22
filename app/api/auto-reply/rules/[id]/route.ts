import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { autoReplyRules } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { platform, accountId, triggerType, keywords, useAi, aiTone, replyTemplate, active } = await req.json();
    
    const [updated] = await db.update(autoReplyRules)
      .set({ platform, accountId, triggerType, keywords, useAi, aiTone, replyTemplate, active, updatedAt: new Date() })
      .where(and(eq(autoReplyRules.id, id), eq(autoReplyRules.userId, userId)))
      .returning();

    return NextResponse.json({ rule: updated }, { status: 200 });
  } catch (error) {
    console.error("Error updating rule:", error);
    return NextResponse.json({ error: "Failed to update rule" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { active } = await req.json();
    
    const [updated] = await db.update(autoReplyRules)
      .set({ active, updatedAt: new Date() })
      .where(and(eq(autoReplyRules.id, id), eq(autoReplyRules.userId, userId)))
      .returning();

    return NextResponse.json({ rule: updated }, { status: 200 });
  } catch (error) {
    console.error("Error patching rule:", error);
    return NextResponse.json({ error: "Failed to patch rule" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await db.delete(autoReplyRules)
      .where(and(eq(autoReplyRules.id, id), eq(autoReplyRules.userId, userId)));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting rule:", error);
    return NextResponse.json({ error: "Failed to delete rule" }, { status: 500 });
  }
}
