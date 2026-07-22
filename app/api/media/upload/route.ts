import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { imagekit } from "@/lib/imagekit/client";
import { db } from "@/lib/db";
import { mediaAssets } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64 for ImageKit upload
    const buffer = await file.arrayBuffer();
    const base64String = Buffer.from(buffer).toString("base64");

    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: base64String, // required
      fileName: file.name || `omni-post-media-${Date.now()}`, // required
      folder: `/omni-post/${userId}`,
      useUniqueFileName: true,
    });

    // Store reference in our database
    const [insertedMedia] = await db.insert(mediaAssets).values({
      userId,
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
      type: file.type.startsWith("video/") ? "video" : "image",
    }).returning();

    return NextResponse.json({ media: insertedMedia }, { status: 200 });
  } catch (error) {
    console.error("Error uploading media:", error);
    return NextResponse.json({ error: "Failed to upload media" }, { status: 500 });
  }
}
