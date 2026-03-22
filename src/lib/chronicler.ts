import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = "claude-sonnet-4-5";

// Strip markdown code fences Claude sometimes adds despite instructions
function extractJson(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

// ─── Shared types ─────────────────────────────────────────────────────────────

export type EventType = "combat" | "revelation" | "death" | "discovery";

export interface KeyEvent {
  type: EventType;
  description: string;
}

export interface NpcUpdate {
  id?: string; // populated when matched against DB NPCs
  name: string;
  disposition_change?: string;
  status_change?: string;
  reason: string;
}

// ─── Chunk extraction (live, every 30s) ──────────────────────────────────────

export interface PlotThread {
  title: string;
  status: "new" | "updated" | "resolved";
  description: string;
}

export interface InventoryChange {
  character: string;
  item: string;
  action: "gained" | "lost";
}

export interface ChunkExtraction {
  session_outline_updates: string[];
  npc_updates: NpcUpdate[];
  plot_threads: PlotThread[];
  key_events: KeyEvent[];
  inventory_changes: InventoryChange[];
}

const CHUNK_SYSTEM_PROMPT = `You are the Chronicler, a D&D campaign archivist processing a live session audio transcript.

Return ONLY valid JSON matching this exact shape. No markdown. No prose. No explanation.

{
  "session_outline_updates": ["new scene or event to add to outline — only if genuinely new"],
  "npc_updates": [
    {
      "name": "NPC name exactly as spoken",
      "disposition_change": "new disposition if changed: friendly | neutral | hostile | unknown",
      "status_change": "new status if changed: alive | dead | missing | hostile | ally | unknown",
      "reason": "what caused this change"
    }
  ],
  "plot_threads": [
    {
      "title": "short thread name",
      "status": "new | updated | resolved",
      "description": "what happened with this thread"
    }
  ],
  "key_events": [
    {
      "type": "combat | revelation | death | discovery",
      "description": "what happened — one clear sentence"
    }
  ],
  "inventory_changes": [
    {
      "character": "character name",
      "item": "item name",
      "action": "gained | lost"
    }
  ]
}

Rules:
- If the transcript chunk is too short or contains no meaningful campaign information, return empty arrays for all fields.
- Never invent NPC names, items, or events that are not explicitly in the transcript.
- Only include npc_updates for NPCs whose status or disposition actually changed.
- Only include session_outline_updates for genuinely new scenes or events.
- disposition_change and status_change are both optional — only include the field that changed.`;

export async function processChunk(
  chunk: string,
  sessionNumber: number,
  knownNpcs: Array<{ id: string; name: string; disposition: string; status: string }>,
  planContext?: string
): Promise<ChunkExtraction> {
  if (!chunk.trim() || chunk.trim().split(/\s+/).length < 10) {
    return {
      session_outline_updates: [],
      npc_updates: [],
      plot_threads: [],
      key_events: [],
      inventory_changes: [],
    };
  }

  const npcContext =
    knownNpcs.length > 0
      ? `\n\nKnown NPCs in this campaign:\n${knownNpcs
          .map((n) => `- "${n.name}" (disposition: ${n.disposition}, status: ${n.status})`)
          .join("\n")}`
      : "";

  const planSection = planContext
    ? `\n\nDM's Session Plan (what was intended for this session):\n${planContext}`
    : "";

  const userMessage = `Session ${sessionNumber} — transcript chunk:\n\n${chunk}${npcContext}${planSection}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: CHUNK_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const raw = response.content[0].type === "text" ? extractJson(response.content[0].text) : "{}";

  try {
    return JSON.parse(raw) as ChunkExtraction;
  } catch {
    console.error("[chronicler] Failed to parse chunk extraction:", raw);
    return {
      session_outline_updates: [],
      npc_updates: [],
      plot_threads: [],
      key_events: [],
      inventory_changes: [],
    };
  }
}

// ─── End-of-session synthesis ─────────────────────────────────────────────────

export interface SessionSynthesis {
  session_summary: string;
  previously_on: string;
  key_events_final: KeyEvent[];
  npc_status_changes: Array<{
    name: string;
    old_status: string;
    new_status: string;
    reason: string;
  }>;
  resolved_storylines: string[];
  revealed_secrets: string[];
  unresolved_threads: string[];
  items_gained: string[];
  session_title: string;
}

const SYNTHESIS_SYSTEM_PROMPT = `You are a D&D campaign chronicler. Read this complete session transcript and return ONLY structured JSON, no prose, no explanation, nothing outside the JSON object.

{
  "session_summary": "one clear paragraph summarizing the whole session",
  "previously_on": "one dramatic paragraph written exactly like a TV show recap — past tense, exciting, ends on a hook for next session. Start with 'Previously on...'",
  "key_events_final": [
    {"type": "combat | revelation | death | discovery", "description": "what happened"}
  ],
  "npc_status_changes": [
    {"name": "NPC name exactly as spoken", "old_status": "alive | unknown | ally | etc", "new_status": "dead | missing | hostile | ally | unknown", "reason": "why"}
  ],
  "resolved_storylines": ["exact titles of plot threads or storylines that were fully resolved or concluded this session"],
  "revealed_secrets": ["exact titles or descriptions of secrets, hidden information, or concealed facts that were discovered or revealed to the players this session"],
  "unresolved_threads": ["list of plot threads still open at end of session"],
  "items_gained": ["list of items the party acquired this session"],
  "session_title": "a short evocative title for this session like a TV episode name"
}

Rules:
- previously_on must start with exactly "Previously on..."
- session_title should be 3-6 words, evocative, like a TV episode name
- npc_status_changes: only include NPCs whose status genuinely changed. new_status must be one of: dead, missing, hostile, ally, unknown, alive.
- key_events_final: IMPORTANT — any NPC death, capture, or major status change MUST appear here as type "death". Any secret revealed must appear as type "revelation". Combat encounters appear as "combat". New discoveries appear as "discovery". Do NOT omit NPC deaths from key_events_final even if they also appear in npc_status_changes.
- revealed_secrets: include any secret, hidden truth, or concealed fact that was uncovered or stated aloud this session.
- If the transcript is empty or too short, still return valid JSON with empty arrays and brief strings.
- Never hallucinate events not in the transcript.`;

export async function synthesizeSession(
  transcript: string,
  sessionNumber: number,
  planContext?: string
): Promise<SessionSynthesis> {
  const planSection = planContext
    ? `\n\nDM's Session Plan (what was intended):\n${planContext}`
    : "";
  const userMessage = `Session ${sessionNumber} — complete transcript:\n\n${transcript || "(No transcript recorded)"}${planSection}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: SYNTHESIS_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const raw = response.content[0].type === "text" ? extractJson(response.content[0].text) : "{}";

  try {
    return JSON.parse(raw) as SessionSynthesis;
  } catch {
    console.error("[chronicler] Failed to parse synthesis:", raw);
    return {
      session_summary: "Session summary unavailable.",
      previously_on: "Previously on... the adventure continued.",
      key_events_final: [],
      npc_status_changes: [],
      resolved_storylines: [],
      revealed_secrets: [],
      unresolved_threads: [],
      items_gained: [],
      session_title: `Session ${sessionNumber}`,
    };
  }
}

// ─── Dashboard card generation ───────────────────────────────────────────────

export interface SessionCardData {
  narrative: string;
  badge: string;
  summary: string;
}

const CARD_SYSTEM_PROMPT = `You are a D&D campaign assistant. Given context about an upcoming session, generate dashboard card content. Return ONLY valid JSON, no markdown, no prose.

{
  "narrative": "1-2 dramatic sentences for the dashboard header — thematic, evocative, written in present tense as if setting the scene for the DM. Reference specific plot elements, NPCs, or locations from the session context.",
  "badge": "2-3 word thematic label for the session (e.g. 'Political Intrigue', 'Dungeon Delve', 'Boss Encounter', 'Mystery Unfolds')",
  "summary": "2-3 sentence preview of what this session covers, written for the DM as a quick reminder of the plan."
}

Rules:
- Only reference elements actually present in the provided context.
- narrative should feel like the opening crawl of a fantasy show episode.
- badge should capture the dominant theme or tone of the session.
- summary should be practical and informative, not dramatic.
- If context is sparse, keep outputs brief but still useful.`;

export async function generateSessionCard(context: {
  sessionNumber: number;
  title: string;
  outlineText: string;
  keyBeats: string[];
  encounters: string[];
  hooks: string[];
  storylines: Array<{ title: string }>;
  npcs: Array<{ name: string; role?: string; status: string }>;
  previousRecap?: string;
}): Promise<SessionCardData> {
  const sections: string[] = [
    `Session ${context.sessionNumber}: ${context.title}`,
  ];

  if (context.outlineText.trim()) {
    sections.push(`Session Outline:\n${context.outlineText}`);
  }
  if (context.keyBeats.length > 0) {
    sections.push(`Key Beats:\n${context.keyBeats.map((b) => `- ${b}`).join("\n")}`);
  }
  if (context.encounters.length > 0) {
    sections.push(`Encounters:\n${context.encounters.map((e) => `- ${e}`).join("\n")}`);
  }
  if (context.hooks.length > 0) {
    sections.push(`Hooks:\n${context.hooks.map((h) => `- ${h}`).join("\n")}`);
  }
  if (context.storylines.length > 0) {
    sections.push(`Connected Storylines:\n${context.storylines.map((s) => `- ${s.title}`).join("\n")}`);
  }
  if (context.npcs.length > 0) {
    sections.push(`NPCs Involved:\n${context.npcs.map((n) => `- ${n.name} (${n.role || "unknown role"}, ${n.status})`).join("\n")}`);
  }
  if (context.previousRecap) {
    sections.push(`Previous Session Recap:\n${context.previousRecap}`);
  }

  const userMessage = sections.join("\n\n");

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: CARD_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const raw = response.content[0].type === "text" ? extractJson(response.content[0].text) : "{}";

  try {
    return JSON.parse(raw) as SessionCardData;
  } catch {
    console.error("[chronicler] Failed to parse card data:", raw);
    return {
      narrative: `Session ${context.sessionNumber} awaits. The party's next chapter is about to unfold.`,
      badge: "Upcoming",
      summary: `Session ${context.sessionNumber}: ${context.title}`,
    };
  }
}

// ─── Session outline field extraction ────────────────────────────────────────

export interface ExtractedItem {
  text: string;
  source?: string;
}

export interface SessionFieldExtraction {
  checklist: ExtractedItem[];
  reminders: ExtractedItem[];
  keyBeats: ExtractedItem[];
  encounters: ExtractedItem[];
  hooks: ExtractedItem[];
  locations: ExtractedItem[];
  playerNotes: ExtractedItem[];
  contingencies: ExtractedItem[];
  improvPrompts: ExtractedItem[];
}

const EMPTY_EXTRACTION: SessionFieldExtraction = {
  checklist: [],
  reminders: [],
  keyBeats: [],
  encounters: [],
  hooks: [],
  locations: [],
  playerNotes: [],
  contingencies: [],
  improvPrompts: [],
};

const EXTRACT_FIELDS_SYSTEM_PROMPT = `You are a D&D session prep assistant. Given a DM's free-form session outline, extract structured planning data. Return ONLY valid JSON matching this exact shape:

{
  "checklist": [{ "text": "...", "source": "..." }],
  "reminders": [{ "text": "...", "source": "..." }],
  "keyBeats": [{ "text": "...", "source": "..." }],
  "encounters": [{ "text": "...", "source": "..." }],
  "hooks": [{ "text": "...", "source": "..." }],
  "locations": [{ "text": "...", "source": "..." }],
  "playerNotes": [{ "text": "...", "source": "..." }],
  "contingencies": [{ "text": "...", "source": "..." }],
  "improvPrompts": [{ "text": "...", "source": "..." }]
}

Each array entry is an object with:
- "text": the extracted item (concise but complete)
- "source": a verbatim short quote (1-2 sentences max) from the outline that this item was derived from. If no specific quote applies, omit the source field.

Field guidance:
- checklist: Actionable prep items the DM should complete before the session (e.g. "Print the tavern battle map", "Review grapple rules", "Prepare Strahd voice").
- reminders: Things the DM must remember during play (e.g. "Kira has a secret letter from Act 2", "The bridge is rigged to collapse after 3 rounds").
- keyBeats: Major story acts/beats in sequential order. Each entry is one act (e.g. "Act 1: The party arrives at Grimhollow and discovers the town is under quarantine").
- encounters: Specific encounters or scenes planned — combat, social, exploration (e.g. "Ambush by 4 goblins on the forest road", "Audience with the Duke — persuasion DC 15").
- hooks: Plot hooks or narrative threads to introduce to players (e.g. "A mysterious stranger offers a map to the lost temple").
- locations: Named locations mentioned in the outline (e.g. "The Rusty Anchor tavern", "Grimhollow town square").
- playerNotes: Notes about specific players or their characters (e.g. "Spotlight Aria's backstory — her father is in this town", "Give Bran a chance to use his new spell").
- contingencies: If-then branching plans (e.g. "If the party refuses the quest, the village elder reveals the kidnapped child is Aria's cousin").
- improvPrompts: Evocative descriptions or prompts the DM can use to improvise (e.g. "The air smells of sulfur and wet stone. Somewhere in the dark, something breathes.").

Rules:
- NEVER invent content not present or clearly implied in the outline.
- Return empty arrays [] for fields with no relevant content in the outline.
- No markdown, no code fences — return ONLY the JSON object.`;

export async function extractSessionFields(
  outlineText: string,
  sessionNumber: number,
): Promise<SessionFieldExtraction> {
  if (outlineText.trim().length < 20) {
    return EMPTY_EXTRACTION;
  }

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: EXTRACT_FIELDS_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Session ${sessionNumber} outline:\n\n${outlineText}`,
      },
    ],
  });

  const raw =
    response.content[0].type === "text"
      ? extractJson(response.content[0].text)
      : "{}";

  try {
    return JSON.parse(raw) as SessionFieldExtraction;
  } catch {
    console.error("[chronicler] Failed to parse field extraction:", raw);
    return EMPTY_EXTRACTION;
  }
}

// ─── Entity identification from outline ──────────────────────────────────────

export interface EntityIdentification {
  npcNames: string[];
  storylineTitles: string[];
  secretTitles: string[];
}

const EMPTY_ENTITIES: EntityIdentification = {
  npcNames: [],
  storylineTitles: [],
  secretTitles: [],
};

const IDENTIFY_ENTITIES_SYSTEM_PROMPT = `You are a D&D campaign assistant. Given a session outline and lists of known campaign entities, identify which NPCs, storylines, and secrets are mentioned or relevant to this session. Return ONLY valid JSON:

{
  "npcNames": ["exact NPC name from the provided list"],
  "storylineTitles": ["exact storyline title from the provided list"],
  "secretTitles": ["exact secret title from the provided list"]
}

Rules:
- ONLY return names/titles that appear in the provided lists. Never invent new ones.
- Include an entity if it is directly mentioned, clearly implied, or contextually relevant based on the outline content and character backgrounds.
- Return empty arrays if no entities match.
- No markdown, no code fences — return ONLY the JSON object.`;

export async function identifyEntities(
  outlineText: string,
  sessionNumber: number,
  context: {
    npcNames: string[];
    storylineTitles: string[];
    secretTitles: string[];
    characterBackgrounds: Array<{
      characterName: string;
      plotHooks?: string;
      unresolvedThreads?: string;
    }>;
  },
): Promise<EntityIdentification> {
  if (outlineText.trim().length < 20) {
    return EMPTY_ENTITIES;
  }

  const sections: string[] = [
    `Session ${sessionNumber} outline:\n${outlineText}`,
  ];

  if (context.npcNames.length > 0) {
    sections.push(`Known NPCs:\n${context.npcNames.map((n) => `- ${n}`).join("\n")}`);
  }
  if (context.storylineTitles.length > 0) {
    sections.push(`Known Storylines:\n${context.storylineTitles.map((t) => `- ${t}`).join("\n")}`);
  }
  if (context.secretTitles.length > 0) {
    sections.push(`Known Secrets & Missions:\n${context.secretTitles.map((t) => `- ${t}`).join("\n")}`);
  }
  if (context.characterBackgrounds.length > 0) {
    const bgText = context.characterBackgrounds
      .map((c) => {
        const parts = [`${c.characterName}`];
        if (c.plotHooks) parts.push(`Plot hooks: ${c.plotHooks}`);
        if (c.unresolvedThreads) parts.push(`Unresolved threads: ${c.unresolvedThreads}`);
        return parts.join("\n  ");
      })
      .join("\n");
    sections.push(`Character Backgrounds:\n${bgText}`);
  }

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: IDENTIFY_ENTITIES_SYSTEM_PROMPT,
    messages: [{ role: "user", content: sections.join("\n\n") }],
  });

  const raw =
    response.content[0].type === "text"
      ? extractJson(response.content[0].text)
      : "{}";

  try {
    return JSON.parse(raw) as EntityIdentification;
  } catch {
    console.error("[chronicler] Failed to parse entity identification:", raw);
    return EMPTY_ENTITIES;
  }
}
