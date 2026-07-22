import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { socialAccounts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all accounts but omit the encrypted tokens for security
    const accounts = await db.select({
      id: socialAccounts.id,
      platform: socialAccounts.platform,
      platformAccountId: socialAccounts.platformAccountId,
      platformAccountName: socialAccounts.platformAccountName,
      createdAt: socialAccounts.createdAt,
      updatedAt: socialAccounts.updatedAt
    })
    .from(socialAccounts)
    .where(eq(socialAccounts.userId, userId));

    return NextResponse.json({ accounts }, { status: 200 });
  } catch (error) {
    console.error("Error fetching social accounts:", error);
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
  }
}
