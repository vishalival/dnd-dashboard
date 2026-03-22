import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/characters/create
// Body: { campaignId, name, playerName?, className?, subclass?, race?, level?, background?, backstory?, personality?, bonds?, flaws?, ideals?, currentGoals?, notes? }
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

    const character = await prisma.character.create({
      data: {
        campaignId,
        name: name.trim(),
        playerName: body.playerName || null,
        className: body.className || null,
        subclass: body.subclass || null,
        race: body.race || null,
        level: body.level ? parseInt(body.level) : 1,
        background: body.background || null,
        backstory: body.backstory || null,
        personality: body.personality || null,
        bonds: body.bonds || null,
        flaws: body.flaws || null,
        ideals: body.ideals || null,
        currentGoals: body.currentGoals || null,
        notes: body.notes || null,
        isPlayerCharacter: true,
        status: "active",
      },
      include: {
        backgrounds: true,
        wishlists: true,
      },
    });

    return NextResponse.json(character);
  } catch (error) {
    console.error("[characters/create]", error);
    return NextResponse.json(
      { error: "Failed to create character" },
      { status: 500 },
    );
  }
}
