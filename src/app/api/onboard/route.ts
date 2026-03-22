import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const toJson = (value: unknown) => JSON.stringify(value);

interface ExtractedData {
  campaign: {
    name: string;
    dmName: string;
    description: string;
    currentArc: string;
  };
  factions: Array<{
    name: string;
    alignment?: string;
    status?: string;
    goals?: string;
    description?: string;
  }>;
  locations: Array<{
    name: string;
    type?: string;
    region?: string;
    description?: string;
    notes?: string;
  }>;
  storylines: Array<{
    title: string;
    summary?: string;
    status?: string;
    urgency?: string;
    arcName?: string;
    nextDevelopment?: string;
    notes?: string;
    tags?: string[];
    events?: Array<{
      title: string;
      type?: string;
      session?: number;
      date?: string;
      description?: string;
    }>;
  }>;
  npcs: Array<{
    name: string;
    race?: string;
    role?: string;
    faction?: string;
    disposition?: string;
    status?: string;
    location?: string;
    goals?: string;
    secrets?: string;
    firstAppearance?: number;
    lastAppearance?: number;
    voiceNotes?: string;
    storyRelevance?: string;
    dmNotes?: string;
    isPlayerKnown?: boolean;
    isPinned?: boolean;
  }>;
  secrets: Array<{
    title: string;
    type: string;
    owner?: string;
    description?: string;
    visibility?: string;
    urgency?: string;
    status?: string;
    progress?: number;
    notes?: string;
    isPinned?: boolean;
  }>;
  sessions: Array<{
    sessionNumber: number;
    title: string;
    date?: string;
    status?: string;
    summary?: string;
    keyBeats?: string[];
    encounters?: string[];
    hooks?: string[];
    npcAppearances?: string[];
    locations?: string[];
    playerNotes?: string[];
    contingencies?: string[];
    improvPrompts?: string[];
    reminders?: string[];
    checklist?: string[];
    template?: string;
  }>;
  characters: Array<{
    name: string;
    playerName?: string;
    className?: string;
    subclass?: string;
    race?: string;
    level?: number;
    background?: string;
    backstory?: string;
    personality?: string;
    bonds?: string;
    flaws?: string;
    ideals?: string;
    currentGoals?: string;
    notes?: string;
    status?: string;
    isPlayerCharacter?: boolean;
    relationships?: string[];
    backgroundDetails?: {
      backgroundText?: string;
      keyHistory?: string[];
      plotHooks?: string[];
      unresolvedThreads?: string[];
      linkedNPCs?: string[];
    };
    wishlistItems?: Array<{
      itemName: string;
      rarity?: string;
      status?: string;
      reason?: string;
      storyHook?: string;
    }>;
  }>;
  journalEntries: Array<{
    title: string;
    content: string;
    type?: string;
    tags?: string[];
    isPinned?: boolean;
    sessionNumber?: number;
  }>;
}

async function extractCampaignData(
  documentText: string,
  dmName: string,
): Promise<ExtractedData> {
  const client = new Anthropic();

  const prompt = `You are a D&D campaign data extraction assistant. Given a collection of documents from a Dungeon Master's campaign, extract structured data for a campaign management dashboard.

The DM's name is: ${dmName}

Here are the campaign documents:

${documentText}

Extract the following structured JSON. Be thorough — extract every character, NPC, storyline, session, secret, location, faction, journal entry, and magic item you can find. Infer reasonable values for fields when not explicitly stated.

Return ONLY valid JSON matching this exact schema (no markdown, no explanation):

{
  "campaign": {
    "name": "Campaign name",
    "dmName": "${dmName}",
    "description": "Brief campaign description for the DM",
    "currentArc": "Current story arc name"
  },
  "factions": [
    { "name": "...", "alignment": "Lawful Good|Neutral|Chaotic Evil|etc", "status": "active|disbanded|hidden", "goals": "...", "description": "..." }
  ],
  "locations": [
    { "name": "...", "type": "city|tavern|wilderness|dungeon|harbor|library|etc", "region": "...", "description": "...", "notes": "..." }
  ],
  "storylines": [
    {
      "title": "...", "summary": "...", "status": "active|resolved|dormant|failed",
      "urgency": "low|medium|high|critical", "arcName": "...", "nextDevelopment": "...",
      "notes": "...", "tags": ["tag1", "tag2"],
      "events": [
        { "title": "...", "type": "event|revelation|milestone", "session": 1, "date": "...", "description": "..." }
      ]
    }
  ],
  "npcs": [
    {
      "name": "...", "race": "...", "role": "...", "faction": "...",
      "disposition": "friendly|neutral|hostile|unknown",
      "status": "alive|dead|missing|ally|hostile|unknown",
      "location": "...", "goals": "...", "secrets": "...",
      "firstAppearance": 1, "lastAppearance": 2,
      "voiceNotes": "...", "storyRelevance": "...", "dmNotes": "...",
      "isPlayerKnown": true, "isPinned": false
    }
  ],
  "secrets": [
    {
      "title": "...", "type": "party_goal|player_goal|npc_goal|dm_secret|world_secret|faction_secret",
      "owner": "Character or faction name", "description": "...",
      "visibility": "dm_only|partial|visible",
      "urgency": "low|medium|high|critical",
      "status": "active|resolved|abandoned",
      "progress": 0, "notes": "...", "isPinned": false
    }
  ],
  "sessions": [
    {
      "sessionNumber": 1, "title": "...", "date": null,
      "status": "completed|planning|draft|ready",
      "summary": "...",
      "keyBeats": ["beat 1", "beat 2"],
      "encounters": ["encounter desc"],
      "hooks": ["hook desc"],
      "npcAppearances": ["NPC Name"],
      "locations": ["Location Name"],
      "playerNotes": ["note"],
      "contingencies": ["contingency"],
      "improvPrompts": ["prompt"],
      "reminders": ["reminder"],
      "checklist": ["item"],
      "template": null
    }
  ],
  "characters": [
    {
      "name": "...", "playerName": "...", "className": "Fighter|Rogue|Wizard|etc",
      "subclass": "...", "race": "...", "level": 3,
      "background": "...", "backstory": "...", "personality": "...",
      "bonds": "...", "flaws": "...", "ideals": "...",
      "currentGoals": "...", "notes": "...", "status": "active",
      "isPlayerCharacter": true, "relationships": ["NPC: relationship type"],
      "backgroundDetails": {
        "backgroundText": "...",
        "keyHistory": ["event 1", "event 2"],
        "plotHooks": ["hook 1"],
        "unresolvedThreads": ["thread 1"],
        "linkedNPCs": ["NPC Name"]
      },
      "wishlistItems": [
        { "itemName": "...", "rarity": "common|uncommon|rare|very_rare|legendary|artifact", "status": "rumored|planned|found|acquired", "reason": "...", "storyHook": "..." }
      ]
    }
  ],
  "journalEntries": [
    {
      "title": "...", "content": "...",
      "type": "session_recap|prep_notes|worldbuilding|reflection",
      "tags": ["tag1"], "isPinned": false, "sessionNumber": null
    }
  ]
}

Important extraction rules:
- Extract ALL NPCs mentioned across all documents
- Extract ALL storylines/plot threads  
- For characters with wishlists, include their magic item wishes
- Mark the most important NPCs (recurring, plot-critical) as isPinned: true
- For secrets, distinguish between party goals, player goals, NPC goals, DM secrets, world secrets, and faction secrets
- If session recap documents exist, create journal entries from them
- Set appropriate urgency levels based on context
- Pin critical journal entries and secrets
- Create storyline events from session recaps and timeline info
- Extract faction and location data from world-building documents
- For journal entries of type "prep_notes" and "worldbuilding", format their "content" as instructive bullet point lists.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 16000,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Parse JSON from response - handle potential markdown wrapping
  let jsonStr = text.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  return JSON.parse(jsonStr) as ExtractedData;
}

async function seedDatabase(data: ExtractedData): Promise<string> {
  return prisma.$transaction(async (tx) => {
    // Clear existing data
    await tx.noteDocument.deleteMany();
    await tx.noteFolder.deleteMany();
    await tx.sessionStoryline.deleteMany();
    await tx.sessionNPC.deleteMany();
    await tx.sessionSecret.deleteMany();
    await tx.storylineNPC.deleteMany();
    await tx.storylineSecret.deleteMany();
    await tx.nPCSecret.deleteMany();
    await tx.storyEvent.deleteMany();
    await tx.journalEntry.deleteMany();
    await tx.magicItemWishlist.deleteMany();
    await tx.characterBackground.deleteMany();
    await tx.sessionPlan.deleteMany();
    await tx.secretGoal.deleteMany();
    await tx.nPC.deleteMany();
    await tx.storyline.deleteMany();
    await tx.character.deleteMany();
    await tx.location.deleteMany();
    await tx.faction.deleteMany();
    await tx.agentLog.deleteMany();
    await tx.campaign.deleteMany();

    // Create campaign
    const campaign = await tx.campaign.create({
      data: {
        name: data.campaign.name,
        dmName: data.campaign.dmName,
        description: data.campaign.description,
        currentArc: data.campaign.currentArc,
      },
    });

    // Create factions
    if (data.factions?.length) {
      await tx.faction.createMany({
        data: data.factions.map((f) => ({
          campaignId: campaign.id,
          name: f.name,
          alignment: f.alignment || null,
          status: f.status || "active",
          goals: f.goals || null,
          description: f.description || null,
        })),
      });
    }

    // Create locations
    if (data.locations?.length) {
      await tx.location.createMany({
        data: data.locations.map((l) => ({
          campaignId: campaign.id,
          name: l.name,
          type: l.type || null,
          region: l.region || null,
          description: l.description || null,
          notes: l.notes || null,
        })),
      });
    }

    // Create storylines with events
    const storylineMap: Record<string, string> = {};
    if (data.storylines?.length) {
      for (const s of data.storylines) {
        const storyline = await tx.storyline.create({
          data: {
            campaignId: campaign.id,
            title: s.title,
            summary: s.summary || null,
            status: s.status || "active",
            urgency: s.urgency || "medium",
            arcName: s.arcName || null,
            nextDevelopment: s.nextDevelopment || null,
            notes: s.notes || null,
            tags: s.tags ? toJson(s.tags) : null,
            events: s.events?.length
              ? {
                  create: s.events.map((e) => ({
                    title: e.title,
                    type: e.type || "event",
                    session: e.session || null,
                    date: e.date || null,
                    description: e.description || null,
                  })),
                }
              : undefined,
          },
        });
        storylineMap[s.title.toLowerCase()] = storyline.id;
      }
    }

    // Create NPCs
    const npcMap: Record<string, string> = {};
    if (data.npcs?.length) {
      for (const n of data.npcs) {
        const npc = await tx.nPC.create({
          data: {
            campaignId: campaign.id,
            name: n.name,
            race: n.race || null,
            role: n.role || null,
            faction: n.faction || null,
            disposition: n.disposition || "neutral",
            status: n.status || "alive",
            location: n.location || null,
            goals: n.goals || null,
            secrets: n.secrets || null,
            firstAppearance: n.firstAppearance || null,
            lastAppearance: n.lastAppearance || null,
            voiceNotes: n.voiceNotes || null,
            storyRelevance: n.storyRelevance || null,
            dmNotes: n.dmNotes || null,
            isPlayerKnown: n.isPlayerKnown ?? true,
            isPinned: n.isPinned ?? false,
          },
        });
        npcMap[n.name.toLowerCase()] = npc.id;
      }
    }

    // Create secrets
    const secretMap: Record<string, string> = {};
    if (data.secrets?.length) {
      for (const s of data.secrets) {
        const secret = await tx.secretGoal.create({
          data: {
            campaignId: campaign.id,
            title: s.title,
            type: s.type || "dm_secret",
            owner: s.owner || null,
            description: s.description || null,
            visibility: s.visibility || "dm_only",
            urgency: s.urgency || "medium",
            status: s.status || "active",
            progress: s.progress || 0,
            notes: s.notes || null,
            isPinned: s.isPinned ?? false,
          },
        });
        secretMap[s.title.toLowerCase()] = secret.id;
      }
    }

    // Create sessions
    const sessionMap: Record<number, string> = {};
    if (data.sessions?.length) {
      for (const s of data.sessions) {
        const session = await tx.sessionPlan.create({
          data: {
            campaignId: campaign.id,
            sessionNumber: s.sessionNumber,
            title: s.title,
            date: s.date ? new Date(s.date) : null,
            status: s.status || "draft",
            summary: s.summary || null,
            keyBeats: s.keyBeats ? toJson(s.keyBeats) : null,
            encounters: s.encounters ? toJson(s.encounters) : null,
            hooks: s.hooks ? toJson(s.hooks) : null,
            npcAppearances: s.npcAppearances
              ? toJson(s.npcAppearances)
              : null,
            locations: s.locations ? toJson(s.locations) : null,
            playerNotes: s.playerNotes ? toJson(s.playerNotes) : null,
            contingencies: s.contingencies ? toJson(s.contingencies) : null,
            improvPrompts: s.improvPrompts ? toJson(s.improvPrompts) : null,
            reminders: s.reminders ? toJson(s.reminders) : null,
            checklist: s.checklist ? toJson(s.checklist) : null,
            template: s.template || null,
          },
        });
        sessionMap[s.sessionNumber] = session.id;

        // Link NPCs to session
        if (s.npcAppearances?.length) {
          for (const npcName of s.npcAppearances) {
            const npcId = npcMap[npcName.toLowerCase()];
            if (npcId) {
              try {
                await tx.sessionNPC.create({
                  data: { sessionId: session.id, npcId },
                });
              } catch {
                // ignore duplicate links
              }
            }
          }
        }
      }
    }

    // Create characters with backgrounds and wishlists
    if (data.characters?.length) {
      for (const c of data.characters) {
        const character = await tx.character.create({
          data: {
            campaignId: campaign.id,
            name: c.name,
            playerName: c.playerName || null,
            className: c.className || null,
            subclass: c.subclass || null,
            race: c.race || null,
            level: c.level || 1,
            background: c.background || null,
            backstory: c.backstory || null,
            personality: c.personality || null,
            bonds: c.bonds || null,
            flaws: c.flaws || null,
            ideals: c.ideals || null,
            currentGoals: c.currentGoals || null,
            relationships: c.relationships ? toJson(c.relationships) : null,
            status: c.status || "active",
            notes: c.notes || null,
            isPlayerCharacter: c.isPlayerCharacter ?? true,
          },
        });

        // Create background
        if (c.backgroundDetails) {
          await tx.characterBackground.create({
            data: {
              characterId: character.id,
              backgroundText: c.backgroundDetails.backgroundText || null,
              keyHistory: c.backgroundDetails.keyHistory
                ? toJson(c.backgroundDetails.keyHistory)
                : null,
              plotHooks: c.backgroundDetails.plotHooks
                ? toJson(c.backgroundDetails.plotHooks)
                : null,
              unresolvedThreads: c.backgroundDetails.unresolvedThreads
                ? toJson(c.backgroundDetails.unresolvedThreads)
                : null,
              linkedNPCs: c.backgroundDetails.linkedNPCs
                ? toJson(c.backgroundDetails.linkedNPCs)
                : null,
            },
          });
        }

        // Create wishlists
        if (c.wishlistItems?.length) {
          await tx.magicItemWishlist.createMany({
            data: c.wishlistItems.map((w) => ({
              campaignId: campaign.id,
              characterId: character.id,
              itemName: w.itemName,
              rarity: w.rarity || "uncommon",
              status: w.status || "rumored",
              reason: w.reason || null,
              storyHook: w.storyHook || null,
            })),
          });
        }
      }
    }

    // Create journal entries
    if (data.journalEntries?.length) {
      for (const j of data.journalEntries) {
        const sessionId =
          j.sessionNumber && sessionMap[j.sessionNumber]
            ? sessionMap[j.sessionNumber]
            : null;
        await tx.journalEntry.create({
          data: {
            campaignId: campaign.id,
            title: j.title,
            content: j.content,
            type: j.type || "session_recap",
            tags: j.tags ? toJson(j.tags) : null,
            isPinned: j.isPinned ?? false,
            sessionId,
          },
        });
      }
    }

    return campaign.id;
  }, { timeout: 60000 });
}

// Allow larger JSON payloads (extracted text from campaign docs)
export const maxDuration = 120; // seconds — Claude extraction can take a while

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(step: string, detail?: string, summary?: Record<string, number>) {
        const data = JSON.stringify({ step, detail: detail || "", summary: summary || null });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      }

      try {
        const body = await request.json();
        const documentText: string = body.documentText || "";
        const fileCount: number = body.fileCount || 0;
        const dmName: string = body.dmName || "Dungeon Master";

        if (!documentText.trim()) {
          send("error", "No readable documents received. Include .docx, .txt, or .md files.");
          controller.close();
          return;
        }

        // Step 1: Processing your info
        send("processing", `Received ${fileCount} document${fileCount !== 1 ? "s" : ""} to analyze`);

        // Step 2: Analyzing your stories
        send("analyzing", "ArcMind is reading through your campaign lore...");

        const extractedData = await extractCampaignData(documentText, dmName);

        const counts = {
          characters: extractedData.characters?.length || 0,
          npcs: extractedData.npcs?.length || 0,
          storylines: extractedData.storylines?.length || 0,
          sessions: extractedData.sessions?.length || 0,
          secrets: extractedData.secrets?.length || 0,
          locations: extractedData.locations?.length || 0,
          factions: extractedData.factions?.length || 0,
          journalEntries: extractedData.journalEntries?.length || 0,
        };

        send("analyzing", `Identified ${counts.npcs} NPCs, ${counts.storylines} storylines, and ${counts.characters} characters`);

        // Step 3: Creating your cards
        send("creating", "Building your campaign world in the database...");

        await seedDatabase(extractedData);

        send("creating", `Created ${counts.sessions} sessions, ${counts.secrets} secrets, and ${counts.locations} locations`);

        // Step 4: Finishing up
        send("finishing", "Polishing your dashboard...");

        // Done!
        send("done", "Your campaign is ready!", counts);

        controller.close();
      } catch (error) {
        console.error("Onboard error:", error);
        const message = error instanceof Error ? error.message : "Failed to process campaign data";
        const data = JSON.stringify({ step: "error", detail: message, summary: null });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
