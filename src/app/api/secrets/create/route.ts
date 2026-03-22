import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/secrets/create
// Body: { campaignId, title, type, owner?, description?, visibility?, urgency?, status?, progress?, notes?, isPinned? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignId, title, type } = body;

    if (!campaignId || !title?.trim() || !type) {
      return NextResponse.json(
        { error: "campaignId, title, and type are required" },
        { status: 400 },
      );
    }

    const secret = await prisma.secretGoal.create({
      data: {
        campaignId,
        title: title.trim(),
        type,
        owner: body.owner || null,
        description: body.description || null,
        visibility: body.visibility || "dm_only",
        urgency: body.urgency || "medium",
        status: body.status || "active",
        progress: body.progress || 0,
        notes: body.notes || null,
        isPinned: body.isPinned ?? false,
      },
      include: {
        storylineLinks: { include: { storyline: true } },
        npcLinks: { include: { npc: true } },
        sessionLinks: { include: { session: true } },
      },
    });

    return NextResponse.json(secret);
  } catch (error) {
    console.error("[secrets/create]", error);
    return NextResponse.json(
      { error: "Failed to create secret" },
      { status: 500 },
    );
  }
}
