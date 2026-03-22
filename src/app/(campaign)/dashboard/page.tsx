export const dynamic = "force-dynamic";

import { getCampaign } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { generateSessionCard } from "@/lib/chronicler";
import { extractTextFromTipTap } from "@/lib/tiptap-utils";
import { parseJsonField } from "@/lib/utils";
import type { JSONContent } from "@tiptap/core";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const campaign = await getCampaign();

  if (!campaign) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-heading font-semibold text-foreground/80 dark:text-zinc-300 mb-2">
            No Campaign Found
          </h2>
          <p className="text-sm text-muted-foreground dark:text-zinc-500 mb-4">
            Upload your D&D campaign documents to get started.
          </p>
          <a
            href="/onboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-400 transition-colors"
          >
            Set Up Campaign
          </a>
        </div>
      </div>
    );
  }

  // Find the upcoming session (lowest non-completed sessionNumber)
  const upcomingSession = [...campaign.sessions]
    .filter((s) => s.status !== "completed")
    .sort((a, b) => b.sessionNumber - a.sessionNumber)[0];

  // Generate AI card data on first load if missing
  if (
    upcomingSession &&
    !upcomingSession.aiNarrative &&
    !upcomingSession.aiBadge &&
    !upcomingSession.aiSummary
  ) {
    try {
      // Fetch the session outline document
      const outlineDoc = await prisma.noteDocument.findFirst({
        where: {
          campaignId: campaign.id,
          slug: `session-outline-${upcomingSession.sessionNumber}`,
        },
        select: { content: true },
      });

      const outlineText = outlineDoc?.content
        ? extractTextFromTipTap(outlineDoc.content as JSONContent)
        : "";

      // Get the most recent completed session's recap for continuity
      const lastCompleted = await prisma.sessionPlan.findFirst({
        where: { campaignId: campaign.id, status: "completed" },
        orderBy: { sessionNumber: "desc" },
        select: { recapForNext: true },
      });

      const cardData = await generateSessionCard({
        sessionNumber: upcomingSession.sessionNumber,
        title: upcomingSession.title,
        outlineText,
        keyBeats: parseJsonField<string>(upcomingSession.keyBeats),
        encounters: parseJsonField<string>(upcomingSession.encounters),
        hooks: parseJsonField<string>(upcomingSession.hooks),
        storylines: upcomingSession.storylineLinks.map((sl) => ({
          title: sl.storyline.title,
        })),
        npcs: upcomingSession.npcLinks.map((nl) => ({
          name: nl.npc.name,
          role: nl.npc.role ?? undefined,
          status: nl.npc.status,
        })),
        previousRecap: lastCompleted?.recapForNext ?? undefined,
      });

      // Persist to DB
      await prisma.sessionPlan.update({
        where: { id: upcomingSession.id },
        data: {
          aiNarrative: cardData.narrative,
          aiBadge: cardData.badge,
          aiSummary: cardData.summary,
        },
      });

      // Update in-memory so client gets the data immediately
      const sessionIndex = campaign.sessions.findIndex(
        (s) => s.id === upcomingSession.id
      );
      if (sessionIndex !== -1) {
        campaign.sessions[sessionIndex] = {
          ...campaign.sessions[sessionIndex],
          aiNarrative: cardData.narrative,
          aiBadge: cardData.badge,
          aiSummary: cardData.summary,
        };
      }
    } catch (error) {
      console.error("[dashboard] Failed to generate session card:", error);
      // Non-fatal — dashboard still renders with fallback text
    }
  }

  return <DashboardClient campaign={campaign} />;
}
