import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractSessionFields, identifyEntities } from "@/lib/chronicler";
import { extractTextFromTipTap } from "@/lib/tiptap-utils";
import { emitAgentEvent } from "@/lib/sse-emitter";
import type { JSONContent } from "@tiptap/core";

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchEntities<T extends { id: string }>(
  aiNames: string[],
  dbEntities: T[],
  getLabel: (e: T) => string,
): T[] {
  const matched = new Map<string, T>();

  for (const aiName of aiNames) {
    const aiLower = aiName.toLowerCase().trim();
    if (!aiLower) continue;

    // Tier 1: Exact match (case-insensitive)
    let match = dbEntities.find(
      (e) => getLabel(e).toLowerCase() === aiLower,
    );

    // Tier 2: Word-boundary containment (AI name in DB name)
    if (!match) {
      const aiPattern = new RegExp(`\\b${escapeRegExp(aiLower)}\\b`, "i");
      match = dbEntities.find((e) => aiPattern.test(getLabel(e)));
    }

    // Tier 3: Word-boundary containment (DB name in AI name)
    if (!match) {
      match = dbEntities.find((e) => {
        const dbPattern = new RegExp(
          `\\b${escapeRegExp(getLabel(e).toLowerCase())}\\b`,
          "i",
        );
        return dbPattern.test(aiLower);
      });
    }

    if (match && !matched.has(match.id)) {
      matched.set(match.id, match);
    }
  }

  return Array.from(matched.values());
}

// POST /api/session/extract
// Body: { sessionId: string }
// Reads the session outline document, extracts structured fields via AI,
// identifies and links campaign entities, and updates the session plan.
export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const emit = (message: string, step: number, total: number) =>
      emitAgentEvent(sessionId, {
        agent: "chronicler",
        state: "processing",
        message,
        data: { step, total },
      });

    emit("Reading session outline...", 1, 6);

    const session = await prisma.sessionPlan.findUnique({
      where: { id: sessionId },
      select: { id: true, sessionNumber: true, campaignId: true },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const outlineDoc = await prisma.noteDocument.findFirst({
      where: {
        campaignId: session.campaignId,
        slug: `session-outline-${session.sessionNumber}`,
      },
      select: { content: true },
    });

    if (!outlineDoc?.content) {
      return NextResponse.json(
        { error: "No outline document found for this session" },
        { status: 404 },
      );
    }

    const outlineText = extractTextFromTipTap(outlineDoc.content as JSONContent);

    if (outlineText.trim().length < 20) {
      return NextResponse.json(
        { error: "Outline is empty or too short to extract from" },
        { status: 400 },
      );
    }

    // Fetch campaign entities for identification
    const [allNpcs, allStorylines, allSecrets, characters] = await Promise.all([
      prisma.nPC.findMany({
        where: { campaignId: session.campaignId },
        select: { id: true, name: true },
      }),
      prisma.storyline.findMany({
        where: { campaignId: session.campaignId },
        select: { id: true, title: true },
      }),
      prisma.secretGoal.findMany({
        where: { campaignId: session.campaignId },
        select: { id: true, title: true },
      }),
      prisma.character.findMany({
        where: { campaignId: session.campaignId },
        include: {
          backgrounds: {
            select: { plotHooks: true, unresolvedThreads: true },
          },
        },
      }),
    ]);

    // Step 2: Extract structured fields
    emit("Analyzing outline with AI...", 2, 6);
    const extraction = await extractSessionFields(outlineText, session.sessionNumber);

    const allFieldsEmpty = Object.values(extraction).every(
      (arr) => Array.isArray(arr) && arr.length === 0,
    );
    if (allFieldsEmpty && outlineText.length > 100) {
      console.warn("[session/extract] All extraction fields empty despite substantial outline. AI may have returned unparseable JSON.");
    }

    // Step 3: Identify entities
    emit("Identifying connected entities...", 3, 6);
    const entities = await identifyEntities(outlineText, session.sessionNumber, {
      npcNames: allNpcs.map((n) => n.name),
      storylineTitles: allStorylines.map((s) => s.title),
      secretTitles: allSecrets.map((s) => s.title),
      characterBackgrounds: characters.map((c) => ({
        characterName: c.name,
        plotHooks: c.backgrounds[0]?.plotHooks ?? undefined,
        unresolvedThreads: c.backgrounds[0]?.unresolvedThreads ?? undefined,
      })),
    });

    // Step 4: Match entities (tiered: exact → word-boundary)
    emit("Linking NPCs, plot lines, and secrets...", 4, 6);

    const matchedNpcs = matchEntities(entities.npcNames, allNpcs, (n) => n.name);
    const matchedStorylines = matchEntities(entities.storylineTitles, allStorylines, (s) => s.title);
    const matchedSecrets = matchEntities(entities.secretTitles, allSecrets, (s) => s.title);

    // Step 5: Save everything in a transaction
    emit("Saving to database...", 5, 6);

    await prisma.$transaction(async (tx) => {
      // Update extraction fields
      await tx.sessionPlan.update({
        where: { id: sessionId },
        data: {
          checklist: JSON.stringify(extraction.checklist),
          reminders: JSON.stringify(extraction.reminders),
          keyBeats: JSON.stringify(extraction.keyBeats),
          encounters: JSON.stringify(extraction.encounters),
          hooks: JSON.stringify(extraction.hooks),
          locations: JSON.stringify(extraction.locations),
          playerNotes: JSON.stringify(extraction.playerNotes),
          contingencies: JSON.stringify(extraction.contingencies),
          improvPrompts: JSON.stringify(extraction.improvPrompts),
        },
      });

      // Replace entity links
      await tx.sessionNPC.deleteMany({ where: { sessionId } });
      await tx.sessionStoryline.deleteMany({ where: { sessionId } });
      await tx.sessionSecret.deleteMany({ where: { sessionId } });

      if (matchedNpcs.length > 0) {
        await tx.sessionNPC.createMany({
          data: matchedNpcs.map((n) => ({ sessionId, npcId: n.id })),
        });
      }
      if (matchedStorylines.length > 0) {
        await tx.sessionStoryline.createMany({
          data: matchedStorylines.map((s) => ({ sessionId, storylineId: s.id })),
        });
      }
      if (matchedSecrets.length > 0) {
        await tx.sessionSecret.createMany({
          data: matchedSecrets.map((s) => ({ sessionId, secretId: s.id })),
        });
      }
    });

    // Step 6: Done — use "log" state, NOT "done", because "done" triggers
    // the LiveSessionPanel's SSE handler to show SessionClosingScreen.
    emitAgentEvent(sessionId, {
      agent: "chronicler",
      state: "log",
      message: "Extraction complete!",
      data: {},
    });

    return NextResponse.json({
      ...extraction,
      linkedNpcs: matchedNpcs.map((n) => ({ npcId: n.id, npc: { name: n.name } })),
      linkedStorylines: matchedStorylines.map((s) => ({
        storylineId: s.id,
        storyline: { title: s.title },
      })),
      linkedSecrets: matchedSecrets.map((s) => ({
        secretId: s.id,
        secret: { title: s.title },
      })),
      ...(allFieldsEmpty && outlineText.length > 100
        ? { warning: "Extraction returned empty results — try again or simplify the outline." }
        : {}),
    });
  } catch (error) {
    console.error("[session/extract]", error);
    return NextResponse.json({ error: "Failed to extract session fields" }, { status: 500 });
  }
}
