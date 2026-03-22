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
