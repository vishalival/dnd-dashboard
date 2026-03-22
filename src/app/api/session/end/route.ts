import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { synthesizeSession } from "@/lib/chronicler";
import { emitAgentEvent } from "@/lib/sse-emitter";

// POST /api/session/end
// Body: { sessionId: string }
// 1. Reads full transcript from DB
// 2. Runs end-of-session synthesis via Claude
// 3. Writes all results back to DB (NPCs, storylines, secrets, journal)
// 4. Emits SSE "done" with the full synthesis
export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const session = await prisma.sessionPlan.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        sessionNumber: true,
        title: true,
        transcript: true,
        campaignId: true,
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Load all campaign-level entities for matching
    const [allNpcs, allStorylines, allSecrets] = await Promise.all([
      prisma.nPC.findMany({
        where: { campaignId: session.campaignId },
        select: { id: true, name: true, status: true, disposition: true },
      }),
      prisma.storyline.findMany({
        where: { campaignId: session.campaignId },
        select: { id: true, title: true, status: true },
      }),
      prisma.secretGoal.findMany({
        where: { campaignId: session.campaignId },
        select: { id: true, title: true, status: true, visibility: true },
      }),
    ]);

    const transcript = session.transcript ?? "";

    emitAgentEvent(sessionId, {
      agent: "chronicler",
      state: "processing",
      message: "synthesizing full session — the Chronicler is writing...",
      data: {},
    });

    const synthesis = await synthesizeSession(transcript, session.sessionNumber);

    await prisma.$transaction(async (tx) => {
      // Update session record
      await tx.sessionPlan.update({
        where: { id: sessionId },
        data: {
          status: "completed",
          summary: synthesis.session_summary,
          keyEvents: JSON.stringify(synthesis.key_events_final),
          recapForNext: synthesis.previously_on,
          title: synthesis.session_title || session.title,
        },
      });

      // Apply NPC status changes — match by name across all campaign NPCs
      for (const change of synthesis.npc_status_changes) {
        const match = allNpcs.find(
          (n) => n.name.toLowerCase() === change.name.toLowerCase()
        );
        if (!match) continue;
        await tx.nPC.update({
          where: { id: match.id },
          data: { status: change.new_status, lastAppearance: session.sessionNumber },
        });
      }

      // Resolve storylines whose titles fuzzy-match resolved_storylines
      for (const resolvedTitle of synthesis.resolved_storylines) {
        const lower = resolvedTitle.toLowerCase();
        const match = allStorylines.find(
          (s) => s.title.toLowerCase().includes(lower) || lower.includes(s.title.toLowerCase())
        );
        if (!match || match.status === "resolved") continue;
        await tx.storyline.update({
          where: { id: match.id },
          data: { status: "resolved" },
        });
      }

      // Mark secrets as revealed when title fuzzy-matches revealed_secrets
      for (const revealedTitle of synthesis.revealed_secrets) {
        const lower = revealedTitle.toLowerCase();
        const match = allSecrets.find(
          (s) => s.title.toLowerCase().includes(lower) || lower.includes(s.title.toLowerCase())
        );
        if (!match || match.visibility === "revealed") continue;
        await tx.secretGoal.update({
          where: { id: match.id },
          data: { visibility: "revealed", status: "revealed" },
        });
      }

      // Write session_recap JournalEntry
      const unresolvedSection =
        synthesis.unresolved_threads.length > 0
          ? `\n\n**Open Threads:**\n${synthesis.unresolved_threads.map((t) => `- ${t}`).join("\n")}`
          : "";

      const itemsSection =
        synthesis.items_gained.length > 0
          ? `\n\n**Items Acquired:**\n${synthesis.items_gained.map((i) => `- ${i}`).join("\n")}`
          : "";

      await tx.journalEntry.create({
        data: {
          title: synthesis.session_title || `Session ${session.sessionNumber}`,
          content: `${synthesis.previously_on}\n\n${synthesis.session_summary}${unresolvedSection}${itemsSection}`,
          type: "session_recap",
          sessionId,
          campaignId: session.campaignId,
        },
      });

      await tx.agentLog.create({
        data: {
          agent: "chronicler",
          action: "session_synthesized",
          sessionId,
          campaignId: session.campaignId,
          data: JSON.stringify({
            sessionNumber: session.sessionNumber,
            sessionTitle: synthesis.session_title,
            keyEventCount: synthesis.key_events_final.length,
            npcChangeCount: synthesis.npc_status_changes.length,
            storylinesResolved: synthesis.resolved_storylines.length,
            secretsRevealed: synthesis.revealed_secrets.length,
          }),
        },
      });
    });

    emitAgentEvent(sessionId, {
      agent: "chronicler",
      state: "done",
      message: `session synthesized — "${synthesis.session_title}"`,
      data: synthesis as unknown as Record<string, unknown>,
    });

    return NextResponse.json({ ok: true, synthesis });
  } catch (error) {
    console.error("[session/end]", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Chronicler failed: ${msg}` }, { status: 500 });
  }
}
