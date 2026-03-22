import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/npcs/update
// Body: { npcId, name?, race?, role?, faction?, disposition?, status?, location?, goals?, secrets?, dmNotes?, voiceNotes?, storyRelevance?, isPlayerKnown?, isPinned? }
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { npcId, ...fields } = body;

    if (!npcId) {
      return NextResponse.json({ error: "npcId required" }, { status: 400 });
    }

    // Build data object from provided fields
    const data: Record<string, unknown> = {};
    const allowedFields = [
      "name", "race", "role", "faction", "disposition", "status",
      "location", "goals", "secrets", "dmNotes", "voiceNotes",
      "storyRelevance", "isPlayerKnown", "isPinned",
    ];

    for (const field of allowedFields) {
      if (fields[field] !== undefined) {
        data[field] = fields[field];
      }
    }

    if (data.name && typeof data.name === "string") {
      data.name = data.name.trim();
      if (!data.name) {
        return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
      }
    }

    const npc = await prisma.nPC.update({
      where: { id: npcId },
      data,
      include: {
        storylineLinks: { include: { storyline: true } },
        secretLinks: { include: { secret: true } },
        sessionLinks: { include: { session: true } },
      },
    });

    return NextResponse.json(npc);
  } catch (error) {
    console.error("[npcs/update]", error);
    return NextResponse.json(
      { error: "Failed to update NPC" },
      { status: 500 },
    );
  }
}
