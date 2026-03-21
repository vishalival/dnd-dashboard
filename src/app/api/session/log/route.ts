import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export interface LogEntry {
  timestamp: string; // ISO string
  entry: string;
}

// POST /api/session/log
// Body: { sessionId: string, entry: string }
// Appends a timestamped entry to the session's liveLog.
export async function POST(req: NextRequest) {
  try {
    const { sessionId, entry } = await req.json();
    if (!sessionId || !entry?.trim()) {
      return NextResponse.json({ error: "sessionId and entry required" }, { status: 400 });
    }

    const session = await prisma.sessionPlan.findUnique({
      where: { id: sessionId },
      select: { liveLog: true, status: true },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    if (session.status !== "in_progress") {
      return NextResponse.json({ error: "Session is not in progress" }, { status: 400 });
    }

    const existing: LogEntry[] = session.liveLog ? JSON.parse(session.liveLog) : [];
    const newEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      entry: entry.trim(),
    };
    const updated = [...existing, newEntry];

    await prisma.sessionPlan.update({
      where: { id: sessionId },
      data: { liveLog: JSON.stringify(updated) },
    });

    return NextResponse.json({ ok: true, entry: newEntry, total: updated.length });
  } catch (error) {
    console.error("[session/log]", error);
    return NextResponse.json({ error: "Failed to log entry" }, { status: 500 });
  }
}
