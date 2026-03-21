import { prisma } from "./prisma";

export async function getCampaign() {
  return prisma.campaign.findFirst({
    include: {
      sessions: {
        orderBy: { sessionNumber: "asc" },
        include: {
          npcLinks: { include: { npc: true } },
          storylineLinks: { include: { storyline: true } },
          secretLinks: { include: { secret: true } },
          journalEntries: true,
        },
      },
      storylines: {
        orderBy: { updatedAt: "desc" },
        include: {
          events: { orderBy: { createdAt: "desc" } },
          npcLinks: { include: { npc: true } },
          secretLinks: { include: { secret: true } },
          sessionLinks: { include: { session: true } },
        },
      },
      npcs: {
        orderBy: { name: "asc" },
        include: {
          storylineLinks: { include: { storyline: true } },
          secretLinks: { include: { secret: true } },
          sessionLinks: { include: { session: true } },
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
        include: { session: true },
      },
      characters: {
        orderBy: { name: "asc" },
        include: {
          backgrounds: true,
          wishlists: true,
        },
      },
      locations: true,
      factions: true,
      wishlists: {
        orderBy: { createdAt: "desc" },
        include: { character: true },
      },
      noteFolders: {
        orderBy: { sortOrder: "asc" },
        include: { documents: { orderBy: { sortOrder: "asc" } } },
      },
      noteDocuments: {
        where: { folderId: null },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export type CampaignData = NonNullable<Awaited<ReturnType<typeof getCampaign>>>;
export type SessionData = CampaignData["sessions"][number];
export type StorylineData = CampaignData["storylines"][number];
export type NPCData = CampaignData["npcs"][number];
export type SecretData = CampaignData["secrets"][number];
export type JournalData = CampaignData["journals"][number];
export type CharacterData = CampaignData["characters"][number];
export type WishlistData = CampaignData["wishlists"][number];
export type NoteFolderData = CampaignData["noteFolders"][number];
export type NoteDocumentData = NoteFolderData["documents"][number];
