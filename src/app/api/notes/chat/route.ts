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

    const systemPrompt = `You are a helpful D&D campaign assistant for the Dungeon Master. Answer questions based on the campaign notes provided below. Be specific and reference note titles when relevant. If the notes don't contain information about something, say so clearly.

When answering, cite which note documents you referenced. After your answer, output a sources block in exactly this format:

<sources>
[{"docId":"<the document id from the [docId:...] tag>","title":"<document title>","quote":"<short exact quote from the note, 10-60 chars>"}]
</sources>

The quote should be a short exact substring from the document that supports your answer. Only include documents you actually used. If you used no documents, omit the sources block entirely.

=== CAMPAIGN NOTES ===
${notesContext || "(No notes found)"}`;

    const messages: Anthropic.MessageParam[] = [
      ...(Array.isArray(history) ? history : []),
      { role: "user" as const, content: message },
    ];

    const stream = client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
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
