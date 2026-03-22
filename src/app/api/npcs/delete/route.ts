import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/npcs/delete
// Body: { npcId }
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { npcId } = body;

    if (!npcId) {
      return NextResponse.json({ error: "npcId required" }, { status: 400 });
    }

    // Delete junction table records first, then the NPC
    await prisma.$transaction([
      prisma.sessionNPC.deleteMany({ where: { npcId } }),
      prisma.storylineNPC.deleteMany({ where: { npcId } }),
      prisma.nPCSecret.deleteMany({ where: { npcId } }),
      prisma.nPC.delete({ where: { id: npcId } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[npcs/delete]", error);
    return NextResponse.json(
      { error: "Failed to delete NPC" },
      { status: 500 },
    );
  }
}
