import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/secrets/update
// Body: { secretId: string, ...fieldsToUpdate }
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { secretId, ...updates } = body;

    if (!secretId) {
      return NextResponse.json(
        { error: "secretId required" },
        { status: 400 },
      );
    }

    // Only allow updating known fields
    const allowedFields = [
      "title",
      "type",
      "owner",
      "description",
      "visibility",
      "urgency",
      "status",
      "progress",
      "notes",
      "isPinned",
    ];

    const data: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in updates) {
        data[key] = updates[key];
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const secret = await prisma.secretGoal.update({
      where: { id: secretId },
      data,
      include: {
        storylineLinks: { include: { storyline: true } },
        npcLinks: { include: { npc: true } },
        sessionLinks: { include: { session: true } },
      },
    });

    return NextResponse.json(secret);
  } catch (error) {
    console.error("[secrets/update]", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
