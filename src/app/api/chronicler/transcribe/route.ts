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

    // Forward keyword boosting params to Deepgram for better D&D name recognition
    // Format: keywords=word:intensifier — colon must NOT be percent-encoded
    const keywords = req.nextUrl.searchParams.getAll("keywords");
    let dgUrl = "https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&punctuate=true&diarize=true&utterances=true";
    for (const kw of keywords) {
      const clean = kw.replace(/[()[\]{}]/g, "").trim();
      if (!clean) continue;
      // Split "name:1.5" → encode only the name, leave :intensifier literal
      const colonIdx = clean.lastIndexOf(":");
      if (colonIdx > 0) {
        const name = clean.slice(0, colonIdx);
        const intensifier = clean.slice(colonIdx); // includes the colon
        dgUrl += `&keyterm=${encodeURIComponent(name)}${intensifier}`;
      } else {
        dgUrl += `&keyterm=${encodeURIComponent(clean)}`;
      }
    }

    const dgRes = await fetch(dgUrl, {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": contentType,
        },
        body: audioBuffer,
      }
    );

    if (!dgRes.ok) {
      const errBody = await dgRes.text();
      const debugInfo = {
        error: "Transcription failed",
        deepgramStatus: dgRes.status,
        deepgramError: errBody,
        deepgramUrl: dgUrl.replace(/Token [^&]+/, "Token ***"),
        keywordsCount: keywords.length,
        keywords: keywords.slice(0, 25),
      };
      console.error("[transcribe] Deepgram error:", JSON.stringify(debugInfo, null, 2));
      return NextResponse.json(debugInfo, { status: 502 });
    }

    const data = await dgRes.json();

    // When utterances are available (diarization enabled), format with speaker tags
    const utterances = data?.results?.utterances;
    let transcript: string;

    if (utterances && Array.isArray(utterances) && utterances.length > 0) {
      transcript = utterances
        .map((u: { speaker: number; transcript: string }) => `[Speaker ${u.speaker}]: ${u.transcript}`)
        .join("\n");
    } else {
      // Fallback to flat transcript if utterances unavailable
      transcript = data?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";
    }

    return NextResponse.json({ transcript });
  } catch (err) {
    console.error("[transcribe]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
