import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { userSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const settings = await db.select().from(userSettings).where(eq(userSettings.userId, userId));

    if (settings.length === 0) {
      // Create defaults
      const [newSettings] = await db.insert(userSettings).values({
        userId,
        timezone: 'UTC',
        theme: 'system',
        aiDefaultTone: 'Professional',
        emailNotifications: {
          postSuccess: true,
          postFailure: true,
          weeklyAnalytics: true,
          autoReplyTriggered: false
        }
      }).returning();
      return NextResponse.json(newSettings);
    }

    return NextResponse.json(settings[0]);

  } catch (error) {
    console.error("[SETTINGS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { timezone, theme, aiDefaultTone, emailNotifications } = body;

    const [updated] = await db.update(userSettings)
      .set({
        timezone,
        theme,
        aiDefaultTone,
        emailNotifications,
        updatedAt: new Date(),
      })
      .where(eq(userSettings.userId, userId))
      .returning();

    // If no rows were updated, they might not have settings yet
    if (!updated) {
      const [inserted] = await db.insert(userSettings).values({
        userId,
        timezone: timezone || 'UTC',
        theme: theme || 'system',
        aiDefaultTone: aiDefaultTone || 'Professional',
        emailNotifications: emailNotifications || {
          postSuccess: true,
          postFailure: true,
          weeklyAnalytics: true,
          autoReplyTriggered: false
        }
      }).returning();
      return NextResponse.json(inserted);
    }

    return NextResponse.json(updated);

  } catch (error) {
    console.error("[SETTINGS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
