import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const campaign = await prisma.campaign.findFirst({
      include: {
        sessions: {
          orderBy: { sessionNumber: "desc" },
          take: 5,
          include: {
            npcLinks: { include: { npc: true } },
            storylineLinks: { include: { storyline: true } },
            secretLinks: { include: { secret: true } },
          },
        },
        storylines: {
          orderBy: { updatedAt: "desc" },
          include: {
            events: { orderBy: { createdAt: "desc" }, take: 3 },
            npcLinks: { include: { npc: true } },
            secretLinks: { include: { secret: true } },
          },
        },
        npcs: {
          orderBy: { updatedAt: "desc" },
          include: {
            storylineLinks: { include: { storyline: true } },
            secretLinks: { include: { secret: true } },
          },
        },
        secrets: {
          orderBy: { updatedAt: "desc" },
          include: {
            storylineLinks: { include: { storyline: true } },
            npcLinks: { include: { npc: true } },
            sessionLinks: { include: { session: true } },
          },
        },
        journals: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { session: true },
        },
        characters: {
          include: {
            backgrounds: true,
            wishlists: true,
          },
        },
        locations: true,
        factions: true,
        wishlists: {
          include: { character: true },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "No campaign found. Please run the seed script." },
        { status: 404 },
      );
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Failed to fetch campaign:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign data" },
      { status: 500 },
    );
  }
}
