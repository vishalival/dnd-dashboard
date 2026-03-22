import { NextRequest, NextResponse } from "next/server";

// POST /api/chronicler/transcribe
// Body: raw audio blob (webm/ogg) as binary
// Returns: { transcript: string }
// Uses Deepgram's prerecorded REST API — API key stays server-side.
export async function POST(req: NextRequest) {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey || apiKey === "your-deepgram-api-key-here") {
    return NextResponse.json({ error: "DEEPGRAM_API_KEY not configured" }, { status: 503 });
  }

  try {
    const audioBuffer = await req.arrayBuffer();
    if (audioBuffer.byteLength < 500) {
      return NextResponse.json({ transcript: "" });
    }

    // Strip codec parameters (e.g. "audio/webm;codecs=opus" → "audio/webm")
    // Deepgram rejects content types with semicolons/codec params
    const rawContentType = req.headers.get("content-type") ?? "audio/webm";
    const contentType = rawContentType.split(";")[0].trim();

    const dgRes = await fetch(
      "https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&punctuate=true",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": contentType,
        },
        body: audioBuffer,
      }
    );

    if (!dgRes.ok) {
      const err = await dgRes.text();
      console.error("[transcribe] Deepgram error:", err);
      return NextResponse.json({ error: "Transcription failed" }, { status: 502 });
    }

    const data = await dgRes.json();
    const transcript =
      data?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";

    return NextResponse.json({ transcript });
  } catch (err) {
    console.error("[transcribe]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
