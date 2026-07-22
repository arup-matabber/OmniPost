import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { autoReplyRules, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkPlanLimit } from "@/lib/billing/checkPlanLimit";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const rules = await db.query.autoReplyRules.findMany({
      where: (rules, { eq }) => eq(rules.userId, userId),
      orderBy: (rules, { desc }) => [desc(rules.createdAt)]
    });

    return NextResponse.json({ rules }, { status: 200 });
  } catch (error) {
    console.error("Error fetching rules:", error);
    return NextResponse.json({ error: "Failed to fetch rules" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const limitCheck = await checkPlanLimit(userId, 'autoReply');
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: `Plan limit reached. Upgrade to a higher plan to add more than ${limitCheck.limit} rules.` }, { status: 402 });
    }
    const plan = limitCheck.plan;

    const { platform, accountId, triggerType, keywords, useAi, aiTone, replyTemplate } = await req.json();

    if (useAi && plan === 'free') {
      return NextResponse.json({ error: "AI mode is only available on Pro and Business plans." }, { status: 403 });
    }

    const [rule] = await db.insert(autoReplyRules).values({
      userId,
      platform,
      accountId,
      triggerType: triggerType || 'all',
      keywords: keywords || [],
      useAi: !!useAi,
      aiTone: useAi ? aiTone : null,
      replyTemplate: useAi ? null : replyTemplate,
      active: true
    }).returning();

    return NextResponse.json({ rule }, { status: 201 });
  } catch (error) {
    console.error("Error creating rule:", error);
    return NextResponse.json({ error: "Failed to create rule" }, { status: 500 });
  }
}
