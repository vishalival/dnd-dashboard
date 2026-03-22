import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { formatNotesForContextWithIds } from "@/lib/tiptap-utils";

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { message, campaignId, history } = await request.json();

    if (!message || !campaignId) {
      return new Response(
        JSON.stringify({ error: "message and campaignId are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch all note documents for this campaign
    const [folderDocs, standaloneDocs] = await Promise.all([
      prisma.noteDocument.findMany({
        where: { campaignId, folderId: { not: null } },
        select: { id: true, title: true, content: true },
      }),
      prisma.noteDocument.findMany({
        where: { campaignId, folderId: null },
        select: { id: true, title: true, content: true },
      }),
    ]);

    const allDocs = [...folderDocs, ...standaloneDocs];
    const notesContext = formatNotesForContextWithIds(allDocs);

    const systemPrompt = `You are a concise D&D campaign assistant for the Dungeon Master. Answer questions using the campaign notes below.

RESPONSE STYLE:
- Keep answers SHORT (2-4 sentences max). Summarize the key points briefly, then let the source citations guide the DM to the full details.
- Do NOT retell or paraphrase entire documents. Instead, give a brief summary and point to where the details are.
- Think of yourself as a search assistant: highlight what's relevant and where to find it, not a narrator retelling the story.
- If the notes don't contain information about something, say so clearly in one sentence.

CITATIONS:
Embed citations as inline markdown links using this custom scheme:
[relevant phrase](cite:<docId>/<URL-encoded exact quote from the note, 10-60 chars>)

Rules:
- The "relevant phrase" must be a natural part of your answer sentence — not a separate label.
- The docId comes from the [docId:...] tag in the notes.
- The quote must be a short exact substring from that document (10-60 chars).
- The quote MUST be URL-encoded (spaces become %20, special chars encoded). This is critical for the link to work.
- Place citations at the most relevant phrases. Aim for 1-3 citations per answer.
- Do NOT add a <sources> block. All citations must be inline.
- If the notes don't contain relevant info, just answer without citation links.

Example:
The warlock seeks [revenge against his former allies](cite:abc123/seeking%20out%20spirits%20to%20avenge%20his%20family) and hopes to [break free from his patron](cite:abc123/break%20his%20pact%20with%20the%20archfey).

=== CAMPAIGN NOTES ===
${notesContext || "(No notes found)"}`;

    const messages: Anthropic.MessageParam[] = [
      ...(Array.isArray(history) ? history : []),
      { role: "user" as const, content: message },
    ];

    const stream = client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 768,
      system: systemPrompt,
      messages,
    });

    return new Response(
      new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          try {
            for await (const event of stream) {
              if (
                event.type === "content_block_delta" &&
                event.delta.type === "text_delta"
              ) {
                controller.enqueue(encoder.encode(event.delta.text));
              }
            }
          } catch (err) {
            console.error("Stream error:", err);
            controller.enqueue(
              encoder.encode("\n\n[Error: Failed to generate response]")
            );
          } finally {
            controller.close();
          }
        },
      }),
      {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
