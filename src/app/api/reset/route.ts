import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/reset — delete all campaign data so the user can re-onboard
export async function POST() {
  try {
    // Delete in dependency order (junction tables first, then entities, then campaign)
    await prisma.$transaction([
      // Junction tables
      prisma.sessionStoryline.deleteMany(),
      prisma.sessionNPC.deleteMany(),
      prisma.sessionSecret.deleteMany(),
      prisma.storylineNPC.deleteMany(),
      prisma.storylineSecret.deleteMany(),
      prisma.nPCSecret.deleteMany(),

      // Child entities
      prisma.agentLog.deleteMany(),
      prisma.storyEvent.deleteMany(),
      prisma.characterBackground.deleteMany(),
      prisma.magicItemWishlist.deleteMany(),
      prisma.noteDocument.deleteMany(),
      prisma.noteFolder.deleteMany(),
      prisma.journalEntry.deleteMany(),
      prisma.secretGoal.deleteMany(),
      prisma.storyline.deleteMany(),
      prisma.sessionPlan.deleteMany(),
      prisma.nPC.deleteMany(),
      prisma.character.deleteMany(),
      prisma.location.deleteMany(),
      prisma.faction.deleteMany(),

      // Campaign itself
      prisma.campaign.deleteMany(),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[reset]", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
