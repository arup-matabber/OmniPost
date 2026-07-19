async function run() {
  try {
    const res = await fetch("http://localhost:3000/api/inngest");
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Body:", text);
  } catch (error: any) {
    console.error("Fetch error:", error.message);
  }
}
run();
