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
      select: {
        id: true,
        sessionNumber: true,
        transcript: true,
        liveExtractions: true,
        runningSummary: true,
        keyBeats: true,
        encounters: true,
        campaign: {
          select: {
            id: true,
            npcs: { select: { id: true, name: true, disposition: true, status: true } },
            storylines: { select: { id: true, title: true, status: true } },
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

    // Build plan context from session's prepared content
    const keyBeats = session.keyBeats ? (JSON.parse(session.keyBeats) as string[]) : [];
    const encounters = session.encounters ? (JSON.parse(session.encounters) as string[]) : [];
    let planContext: string | undefined;
    if (keyBeats.length > 0 || encounters.length > 0) {
      const parts: string[] = [];
      if (keyBeats.length > 0)
        parts.push(`Acts:\n${keyBeats.map((b, i) => `${i + 1}. ${b}`).join("\n")}`);
      if (encounters.length > 0)
        parts.push(`Planned Encounters:\n${encounters.map((e) => `- ${e}`).join("\n")}`);
      planContext = parts.join("\n\n");
    }

    // Parse existing extractions for context
    const existing: ChunkExtraction = session.liveExtractions
      ? JSON.parse(session.liveExtractions)
      : {
          session_outline_updates: [],
          npc_updates: [],
          plot_threads: [],
          key_events: [],
          inventory_changes: [],
        };

    // Run Claude extraction with sliding window context
    const { extraction, updatedSummary } = await processChunk(
      chunk,
      session.sessionNumber,
      knownNpcs,
      planContext,
      existing,
      session.runningSummary ?? undefined,
    );

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

    // Update NPCs in DB (or create new ones)
    const npcChanges: string[] = [];
    for (const update of extraction.npc_updates) {
      const match = knownNpcs.find(
        (n) => n.name.toLowerCase() === update.name.toLowerCase()
      );

      if (match) {
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
      } else {
        // Create new NPC discovered during the session
        await prisma.nPC.create({
          data: {
            name: update.name,
            disposition: update.disposition_change || "neutral",
            status: update.status_change || "alive",
            dmNotes: update.reason || null,
            firstAppearance: session.sessionNumber,
            lastAppearance: session.sessionNumber,
            campaignId: session.campaign.id,
          },
        });
        npcChanges.push(`${update.name}: created (new NPC)`);
      }
    }

    // Update storylines in DB when resolved
    for (const thread of extraction.plot_threads) {
      if (thread.status === "resolved") {
        const lower = thread.title.toLowerCase();
        const match = session.campaign.storylines.find(
          (s) => s.title.toLowerCase().includes(lower) || lower.includes(s.title.toLowerCase())
        );
        if (match && match.status !== "resolved") {
          await prisma.storyline.update({
            where: { id: match.id },
            data: { status: "resolved" },
          });
          match.status = "resolved"; // Prevent redundant updates if same chunk resolves it twice
        }
      }
    }

    // Persist transcript + live extractions + running summary
    await prisma.sessionPlan.update({
      where: { id: sessionId },
      data: {
        transcript: updatedTranscript,
        liveExtractions: JSON.stringify(merged),
        runningSummary: updatedSummary,
      },
    });

    // Emit one "processing" event so the live world-state panel updates
    emitAgentEvent(sessionId, {
      agent: "chronicler",
      state: "processing",
      message: "chunk processed",
      data: extraction as unknown as Record<string, unknown>,
    });

    // Emit individual specific "log" events for every world-state change
    const logEntries: string[] = [];

    for (const update of extraction.npc_updates) {
      const isKnown = knownNpcs.some(
        (n) => n.name.toLowerCase() === update.name.toLowerCase()
      );
      if (!isKnown) {
        logEntries.push(`new NPC — ${update.name}`);
      } else {
        if (update.status_change) {
          if (update.status_change.toLowerCase() === "dead") {
            logEntries.push(`marked ${update.name} as dead`);
          } else {
            logEntries.push(`updated ${update.name} status → ${update.status_change}`);
          }
        }
        if (update.disposition_change) {
          logEntries.push(`updated ${update.name} disposition → ${update.disposition_change}`);
        }
      }
    }

    for (const thread of extraction.plot_threads) {
      if (thread.status === "new") {
        logEntries.push(`added plot thread — ${thread.title}`);
      } else if (thread.status === "resolved") {
        logEntries.push(`resolved plot thread — ${thread.title}`);
      } else {
        logEntries.push(`updated plot thread — ${thread.title}`);
      }
    }

    for (const event of extraction.key_events) {
      logEntries.push(`key event — ${event.type} — ${event.description}`);
    }

    for (const change of extraction.inventory_changes) {
      if (change.action === "gained") {
        logEntries.push(`added ${change.item} to ${change.character}'s inventory`);
      } else {
        logEntries.push(`removed ${change.item} from ${change.character}'s inventory`);
      }
    }

    for (const outline of extraction.session_outline_updates) {
      logEntries.push(`updated session outline — ${outline}`);
    }

    // If nothing specific happened, log word count as fallback
    if (logEntries.length === 0) {
      const wordCount = chunk.trim().split(/\s+/).length;
      logEntries.push(`processed audio chunk — ${wordCount} words transcribed`);
    }

    for (const entry of logEntries) {
      emitAgentEvent(sessionId, {
        agent: "chronicler",
        state: "log",
        message: entry,
        data: {},
      });
    }

    const message = logEntries[0] ?? "processed audio chunk";

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
          logEntryCount: logEntries.length,
        }),
      },
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
