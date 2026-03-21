"use server";

import { prisma } from "./prisma";

export async function searchCampaignData(query: string) {
  if (!query || query.length < 2) return [];

  try {
    const [npcs, storylines, secrets, sessions, journals] = await Promise.all([
      (prisma as any).nPC.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { role: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
      prisma.storyline.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { summary: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
      (prisma as any).secretGoal.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
      (prisma as any).sessionPlan.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { summary: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 3,
      }),
      (prisma as any).journalEntry.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 3,
      }),
    ]);

    return [
      ...npcs.map((n: any) => ({ id: n.id, title: n.name, type: "NPC", href: "/npcs" })),
      ...storylines.map((s: any) => ({ id: s.id, title: s.title, type: "Story", href: "/storylines" })),
      ...secrets.map((s: any) => ({ id: s.id, title: s.title, type: "Secret", href: "/secrets" })),
      ...sessions.map((s: any) => ({ id: s.id, title: `Session ${s.sessionNumber}: ${s.title}`, type: "Session", href: "/sessions" })),
      ...journals.map((j: any) => ({ id: j.id, title: j.title, type: "Journal", href: "/journal" })),
    ];
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}
