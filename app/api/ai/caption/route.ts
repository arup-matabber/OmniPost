import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { genAI } from "@/lib/gemini/client";

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { prompt, platforms } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const targetPlatforms = platforms && platforms.length > 0 ? platforms.join(', ') : 'general social media';

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const aiPrompt = `Write an engaging social media post caption for the following platforms: ${targetPlatforms}.
    
The topic/content is: "${prompt}"

Requirements:
- Make it highly engaging and optimized for the selected platforms.
- Include 3-5 relevant hashtags at the end.
- Keep it concise but impactful.
- Return ONLY the raw caption text without any markdown wrappers or explanations.`;

    const result = await model.generateContent(aiPrompt);
    const text = result.response.text();

    return NextResponse.json({ caption: text.trim() }, { status: 200 });
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: "Failed to generate caption" }, { status: 500 });
  }
}
