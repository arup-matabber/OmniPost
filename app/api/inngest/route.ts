import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { publishScheduledPost, publishNowPost, commentMonitor, analyticsSync } from "@/lib/inngest/functions";

// Ngrok sets a non-localhost host header, causing Inngest to think it's in production
// and throw a 500 error asking for a signing key. We force dev mode locally.
if (process.env.NODE_ENV !== "production") {
  process.env.INNGEST_DEV = "1";
}

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    publishScheduledPost,
    publishNowPost,
    commentMonitor,
    analyticsSync,
  ],
  // serveHost is not a valid property in the current inngest version
});
