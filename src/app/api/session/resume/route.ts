import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/session/resume
// Body: { sessionId }
// Sets a completed session back to in_progress so recording can continue.
// Does NOT clear the existing transcript — new audio appends to it.
export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const session = await prisma.sessionPlan.update({
      where: { id: sessionId },
      data: { status: "in_progress" },
      include: {
        npcLinks: { include: { npc: true } },
        storylineLinks: { include: { storyline: true } },
        secretLinks: { include: { secret: true } },
        journalEntries: true,
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error("[session/resume]", error);
    return NextResponse.json({ error: "Failed to resume session" }, { status: 500 });
  }
}
