import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/session/start
// Body: { sessionId: string }
// Sets session status to "in_progress" and initialises an empty liveLog.
export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const session = await prisma.sessionPlan.update({
      where: { id: sessionId },
      data: {
        status: "in_progress",
        liveLog: JSON.stringify([]),
      },
    });

    return NextResponse.json({ ok: true, status: session.status });
  } catch (error) {
    console.error("[session/start]", error);
    return NextResponse.json({ error: "Failed to start session" }, { status: 500 });
  }
}
