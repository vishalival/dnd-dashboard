import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/session/update
// Body: { sessionId, title?, status?, keyBeats?, encounters?, reminders?, checklist? }
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, title, status, keyBeats, encounters, reminders, checklist, transcript } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const data: Record<string, string | null> = {};
    if (title !== undefined) data.title = title.trim();
    if (status !== undefined) data.status = status;
    if (transcript !== undefined) data.transcript = transcript;
    if (keyBeats !== undefined) data.keyBeats = JSON.stringify(keyBeats.filter(Boolean));
    if (encounters !== undefined) data.encounters = JSON.stringify(encounters.filter(Boolean));
    if (reminders !== undefined) data.reminders = JSON.stringify(reminders.filter(Boolean));
    if (checklist !== undefined) data.checklist = JSON.stringify(checklist.filter(Boolean));

    const session = await prisma.sessionPlan.update({
      where: { id: sessionId },
      data,
      include: {
        npcLinks: { include: { npc: true } },
        storylineLinks: { include: { storyline: true } },
        secretLinks: { include: { secret: true } },
        journalEntries: true,
      },
    });

    // When a session is marked completed, cascade to all prior sessions
    if (status === "completed") {
      await prisma.sessionPlan.updateMany({
        where: {
          campaignId: session.campaignId,
          sessionNumber: { lt: session.sessionNumber },
          status: { not: "completed" },
        },
        data: { status: "completed" },
      });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("[session/update]", error);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}
