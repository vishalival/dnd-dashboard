import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/session/create
// Body: { title: string, campaignId: string }
// Auto-increments session number. Returns the new SessionPlan.
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

    const session = await prisma.sessionPlan.create({
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

    return NextResponse.json(session);
  } catch (error) {
    console.error("[session/create]", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
