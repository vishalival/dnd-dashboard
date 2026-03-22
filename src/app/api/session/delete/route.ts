import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/session/delete
// Body: { sessionId: string }
export async function DELETE(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    // Look up the session to find its campaignId and sessionNumber
    const session = await prisma.sessionPlan.findUnique({
      where: { id: sessionId },
      select: { campaignId: true, sessionNumber: true },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Delete in order to satisfy FK constraints, including the outline doc
    await prisma.$transaction([
      prisma.sessionStoryline.deleteMany({ where: { sessionId } }),
      prisma.sessionNPC.deleteMany({ where: { sessionId } }),
      prisma.sessionSecret.deleteMany({ where: { sessionId } }),
      prisma.journalEntry.deleteMany({ where: { sessionId } }),
      prisma.agentLog.deleteMany({ where: { sessionId } }),
      prisma.noteDocument.deleteMany({
        where: {
          campaignId: session.campaignId,
          slug: `session-outline-${session.sessionNumber}`,
        },
      }),
      prisma.sessionPlan.delete({ where: { id: sessionId } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[session/delete]", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
