import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/npcs/create
// Body: { campaignId, name, race?, role?, faction?, disposition?, status?, location?, goals?, dmNotes?, isPlayerKnown? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignId, name } = body;

    if (!campaignId || !name?.trim()) {
      return NextResponse.json(
        { error: "campaignId and name are required" },
        { status: 400 },
      );
    }

    const npc = await prisma.nPC.create({
      data: {
        campaignId,
        name: name.trim(),
        age: body.age || null,
        appearance: body.appearance || null,
        race: body.race || null,
        role: body.role || null,
        faction: body.faction || null,
        disposition: body.disposition || "neutral",
        status: body.status || "alive",
        location: body.location || null,
        goals: body.goals || null,
        dmNotes: body.dmNotes || null,
        isPlayerKnown: body.isPlayerKnown ?? true,
      },
      include: {
        storylineLinks: { include: { storyline: true } },
        secretLinks: { include: { secret: true } },
        sessionLinks: { include: { session: true } },
      },
    });

    return NextResponse.json(npc);
  } catch (error) {
    console.error("[npcs/create]", error);
    return NextResponse.json(
      { error: "Failed to create NPC" },
      { status: 500 },
    );
  }
}
