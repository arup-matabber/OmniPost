import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { socialAccounts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Delete the account connection
    // The `and(eq(userId), eq(id))` ensures a user can only delete their own connections
    const deleted = await db.delete(socialAccounts)
      .where(
        and(
          eq(socialAccounts.id, id),
          eq(socialAccounts.userId, userId)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Account not found or not authorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedId: id }, { status: 200 });
  } catch (error) {
    console.error("Error deleting social account:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
