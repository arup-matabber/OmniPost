import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { sendEmail } from "@/lib/notifications/plunk";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const email = user.emailAddresses[0]?.emailAddress;
    
    if (!email) {
      return new NextResponse("No email address found", { status: 400 });
    }

    // Try sending a test email using Plunk
    if (process.env.PLUNK_API_KEY) {
      const result = await sendEmail({
        to: email,
        subject: "Test Notification from OmniPost",
        body: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
            <h2>Hello ${user.firstName || 'there'}!</h2>
            <p>This is a test notification from OmniPost. Your Plunk integration is working perfectly.</p>
            <p>You can configure which notifications you receive in the Settings dashboard.</p>
            <br/>
            <p style="color: #666; font-size: 14px;">- The OmniPost Team</p>
          </div>
        `,
      });
      
      if (result.success) {
        return NextResponse.json({ success: true, message: "Email sent" });
      } else {
        return NextResponse.json({ success: false, message: result.reason || "Failed to send email" }, { status: 500 });
      }
    } else {
      return NextResponse.json({ success: false, message: "No Plunk API Key configured" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Failed to send test email:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
