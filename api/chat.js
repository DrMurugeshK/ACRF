/**
 * Vercel Edge Function — proxies Anthropic API calls server-side
 * so the API key is never exposed in the browser bundle.
 *
 * Deploy to Vercel → add ANTHROPIC_API_KEY as an environment variable
 * → set VITE_API_PROXY=/api/chat in your Vercel env vars too.
 */
export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    });
  }

  const body = await req.text();

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "interleaved-thinking-2025-05-14",
    },
    body,
  });

  return new Response(res.body, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") || "text/event-stream",
      "Access-Control-Allow-Origin": "*",
    }
  });
}
