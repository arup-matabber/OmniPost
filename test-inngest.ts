import { config } from "dotenv";
config({ path: ".env.local" });

async function run() {
  const { serve } = await import("inngest/next");
  const { inngest } = await import("@/lib/inngest/client");
  const { publishScheduledPost } = await import("@/lib/inngest/functions");

  try {
    const handler = serve({
      client: inngest,
      functions: [publishScheduledPost],
    });
    
    // Call the GET handler with a mock request
    const req = new Request("http://localhost:3000/api/inngest", {
      method: "GET",
      headers: { "x-inngest-env": "local" }
    });
    
    // Next.js 15 route handlers take a second context argument
    const res = await handler.GET(req as any, { params: Promise.resolve({}) } as any);
    console.log("Status:", res.status);
    const body = await res.json();
    console.dir(body, { depth: null });
  } catch (error) {
    console.error("Runtime Error:", error);
  }
}
run();
