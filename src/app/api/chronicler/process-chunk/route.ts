import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processChunk, type ChunkExtraction } from "@/lib/chronicler";
import { emitAgentEvent } from "@/lib/sse-emitter";

// POST /api/chronicler/process-chunk
// Body: { sessionId: string, chunk: string }
// 1. Appends chunk to session.transcript
// 2. Calls Chronicler (Claude) for extraction
// 3. Merges extraction into session.liveExtractions
// 4. Updates NPC statuses/dispositions in DB
// 5. Creates AgentLog entry
// 6. Emits SSE update to frontend
export async function POST(req: NextRequest) {
  try {
    const { sessionId, chunk } = await req.json();
    if (!sessionId || typeof chunk !== "string") {
      return NextResponse.json({ error: "sessionId and chunk required" }, { status: 400 });
    }

    const session = await prisma.sessionPlan.findUnique({
      where: { id: sessionId },
      include: {
        campaign: {
          select: {
            id: true,
            npcs: { select: { id: true, name: true, disposition: true, status: true } },
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Append chunk to transcript
    const existingTranscript = session.transcript ?? "";
    const updatedTranscript = existingTranscript
      ? `${existingTranscript}\n${chunk}`
      : chunk;

    // Build NPC context from all campaign NPCs
    const knownNpcs = session.campaign.npcs.map((n) => ({
      id: n.id,
      name: n.name,
      disposition: n.disposition,
      status: n.status,
    }));

    // Run Claude extraction
    const extraction = await processChunk(chunk, session.sessionNumber, knownNpcs);

    // Merge into existing liveExtractions
    const existing: ChunkExtraction = session.liveExtractions
      ? JSON.parse(session.liveExtractions)
      : {
          session_outline_updates: [],
          npc_updates: [],
          plot_threads: [],
          key_events: [],
          inventory_changes: [],
        };

    const merged: ChunkExtraction = {
      session_outline_updates: [
        ...existing.session_outline_updates,
        ...extraction.session_outline_updates,
      ],
      npc_updates: mergeNpcUpdates(existing.npc_updates, extraction.npc_updates),
      plot_threads: mergePlotThreads(existing.plot_threads, extraction.plot_threads),
      key_events: [...existing.key_events, ...extraction.key_events],
      inventory_changes: [
        ...existing.inventory_changes,
        ...extraction.inventory_changes,
      ],
    };

    // Update NPCs in DB
    const npcChanges: string[] = [];
    for (const update of extraction.npc_updates) {
      const match = knownNpcs.find(
        (n) => n.name.toLowerCase() === update.name.toLowerCase()
      );
      if (!match) continue;

      const updateData: Record<string, string | number> = {
        lastAppearance: session.sessionNumber,
      };
      if (update.disposition_change) updateData.disposition = update.disposition_change;
      if (update.status_change) updateData.status = update.status_change;

      await prisma.nPC.update({ where: { id: match.id }, data: updateData as Record<string, string | number> });

      const changes: string[] = [];
      if (update.disposition_change) changes.push(`disposition → ${update.disposition_change}`);
      if (update.status_change) changes.push(`status → ${update.status_change}`);
      if (changes.length) npcChanges.push(`${update.name}: ${changes.join(", ")}`);
    }

    // Persist transcript + live extractions
    await prisma.sessionPlan.update({
      where: { id: sessionId },
      data: {
        transcript: updatedTranscript,
        liveExtractions: JSON.stringify(merged),
      },
    });

    // Build human-readable summary for agent log
    const parts: string[] = [];
    if (extraction.key_events.length)
      parts.push(`${extraction.key_events.length} key event${extraction.key_events.length > 1 ? "s" : ""}`);
    if (npcChanges.length)
      parts.push(`${npcChanges.length} NPC update${npcChanges.length > 1 ? "s" : ""}`);
    if (extraction.plot_threads.length)
      parts.push(`${extraction.plot_threads.length} plot thread${extraction.plot_threads.length > 1 ? "s" : ""}`);

    const message =
      parts.length > 0
        ? `processed audio chunk — ${parts.join(", ")} detected`
        : "processed audio chunk — no new events detected";

    // Create AgentLog
    await prisma.agentLog.create({
      data: {
        agent: "chronicler",
        action: "chunk_processed",
        sessionId,
        campaignId: session.campaign.id,
        data: JSON.stringify({
          keyEventCount: extraction.key_events.length,
          npcUpdateCount: npcChanges.length,
          plotThreadCount: extraction.plot_threads.length,
          message,
        }),
      },
    });

    // Emit SSE update
    emitAgentEvent(sessionId, {
      agent: "chronicler",
      state: "processing",
      message,
      data: extraction as unknown as Record<string, unknown>,
    });

    return NextResponse.json({ ok: true, extraction, message });
  } catch (error) {
    console.error("[process-chunk]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process chunk" },
      { status: 500 }
    );
  }
}

// ─── Merge helpers ────────────────────────────────────────────────────────────

function mergeNpcUpdates(
  existing: ChunkExtraction["npc_updates"],
  incoming: ChunkExtraction["npc_updates"]
): ChunkExtraction["npc_updates"] {
  const map = new Map(existing.map((n) => [n.name.toLowerCase(), n]));
  for (const u of incoming) {
    const key = u.name.toLowerCase();
    const prev = map.get(key);
    if (prev) {
      map.set(key, {
        ...prev,
        disposition_change: u.disposition_change ?? prev.disposition_change,
        status_change: u.status_change ?? prev.status_change,
        reason: u.reason,
      });
    } else {
      map.set(key, u);
    }
  }
  return Array.from(map.values());
}

function mergePlotThreads(
  existing: ChunkExtraction["plot_threads"],
  incoming: ChunkExtraction["plot_threads"]
): ChunkExtraction["plot_threads"] {
  const map = new Map(existing.map((t) => [t.title.toLowerCase(), t]));
  for (const t of incoming) {
    map.set(t.title.toLowerCase(), t);
  }
  return Array.from(map.values());
}
