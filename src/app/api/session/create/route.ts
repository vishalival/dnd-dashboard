import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/session/create
// Body: { title: string, campaignId: string }
// Auto-increments session number. Returns the new SessionPlan.
// Also creates a corresponding session outline doc in Tome of Schemes.
export async function POST(req: NextRequest) {
  try {
    const { title, campaignId } = await req.json();
    if (!title?.trim() || !campaignId) {
      return NextResponse.json({ error: "title and campaignId required" }, { status: 400 });
    }

    // Find the highest existing session number for this campaign
    const last = await prisma.sessionPlan.findFirst({
      where: { campaignId },
      orderBy: { sessionNumber: "desc" },
      select: { sessionNumber: true },
    });

    const sessionNumber = (last?.sessionNumber ?? 0) + 1;

    // Look up the "Session Outlines" folder for the campaign
    const sessionsFolder = await prisma.noteFolder.findFirst({
      where: { campaignId, slug: "session-outlines" },
      select: { id: true },
    });

    // Create session and outline doc atomically
    const { session, outlineDocId } = await prisma.$transaction(async (tx) => {
      const newSession = await tx.sessionPlan.create({
        data: {
          title: title.trim(),
          sessionNumber,
          status: "draft",
          campaignId,
        },
        include: {
          npcLinks: { include: { npc: true } },
          storylineLinks: { include: { storyline: true } },
          secretLinks: { include: { secret: true } },
          journalEntries: true,
        },
      });

      // Create corresponding session outline doc if the folder exists
      let docId: string | null = null;
      if (sessionsFolder) {
        const docCount = await tx.noteDocument.count({
          where: { folderId: sessionsFolder.id },
        });

        const doc = await tx.noteDocument.create({
          data: {
            title: `Session ${sessionNumber}`,
            slug: `session-outline-${sessionNumber}`,
            campaignId,
            folderId: sessionsFolder.id,
            sortOrder: docCount,
            isDeletable: false,
          },
        });
        docId = doc.id;
      }

      return { session: newSession, outlineDocId: docId };
    });

    return NextResponse.json({ ...session, outlineDocId });
  } catch (error) {
    console.error("[session/create]", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
