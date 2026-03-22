import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractSessionFields, identifyEntities } from "@/lib/chronicler";
import { extractTextFromTipTap } from "@/lib/tiptap-utils";
import { emitAgentEvent } from "@/lib/sse-emitter";
import type { JSONContent } from "@tiptap/core";

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

    // Step 4: Fuzzy-match entities
    emit("Linking NPCs, plot lines, and secrets...", 4, 6);

    const matchedNpcs = entities.npcNames
      .map((name) => {
        const lower = name.toLowerCase();
        return allNpcs.find(
          (n) =>
            n.name.toLowerCase().includes(lower) ||
            lower.includes(n.name.toLowerCase()),
        );
      })
      .filter(Boolean) as Array<{ id: string; name: string }>;

    const matchedStorylines = entities.storylineTitles
      .map((title) => {
        const lower = title.toLowerCase();
        return allStorylines.find(
          (s) =>
            s.title.toLowerCase().includes(lower) ||
            lower.includes(s.title.toLowerCase()),
        );
      })
      .filter(Boolean) as Array<{ id: string; title: string }>;

    const matchedSecrets = entities.secretTitles
      .map((title) => {
        const lower = title.toLowerCase();
        return allSecrets.find(
          (s) =>
            s.title.toLowerCase().includes(lower) ||
            lower.includes(s.title.toLowerCase()),
        );
      })
      .filter(Boolean) as Array<{ id: string; title: string }>;

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

    // Step 6: Done
    emitAgentEvent(sessionId, {
      agent: "chronicler",
      state: "done",
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
    });
  } catch (error) {
    console.error("[session/extract]", error);
    return NextResponse.json({ error: "Failed to extract session fields" }, { status: 500 });
  }
}
