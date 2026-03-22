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

    // Delete in order to satisfy FK constraints
    await prisma.$transaction([
      prisma.sessionStoryline.deleteMany({ where: { sessionId } }),
      prisma.sessionNPC.deleteMany({ where: { sessionId } }),
      prisma.sessionSecret.deleteMany({ where: { sessionId } }),
      prisma.journalEntry.deleteMany({ where: { sessionId } }),
      prisma.agentLog.deleteMany({ where: { sessionId } }),
      prisma.sessionPlan.delete({ where: { id: sessionId } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[session/delete]", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
