import { NextResponse } from "next/server";

// GET /api/chronicler/deepgram-token
// Returns a short-lived Deepgram JWT for the browser to use in its WebSocket connection.
// The raw DEEPGRAM_API_KEY never leaves the server.
export async function GET() {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey || apiKey === "your-deepgram-api-key-here") {
    return NextResponse.json(
      { error: "DEEPGRAM_API_KEY not configured" },
      { status: 503 }
    );
  }

  try {
    const res = await fetch("https://api.deepgram.com/v1/auth/grant", {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ttl_seconds: 3600 }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[deepgram-token] Deepgram error:", err);
      return NextResponse.json(
        { error: "Failed to obtain Deepgram token" },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json({ token: data.access_token });
  } catch (error) {
    console.error("[deepgram-token]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
