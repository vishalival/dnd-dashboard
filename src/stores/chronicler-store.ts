import { create } from "zustand";

export type ChroniclerPhase = "idle" | "recording" | "processing" | "done" | "error";

export interface LiveExtractions {
  session_outline_updates: string[];
  npc_updates: Array<{ name: string; disposition_change?: string; status_change?: string; reason: string }>;
  plot_threads: Array<{ title: string; status: "new" | "updated" | "resolved"; description: string }>;
  key_events: Array<{ type: "combat" | "revelation" | "death" | "discovery"; description: string }>;
  inventory_changes: Array<{ character: string; item: string; action: "gained" | "lost" }>;
}

export interface SessionSynthesis {
  session_summary: string;
  previously_on: string;
  key_events_final: Array<{ type: string; description: string }>;
  npc_status_changes: Array<{ name: string; old_status: string; new_status: string; reason: string }>;
  unresolved_threads: string[];
  items_gained: string[];
  session_title: string;
}

export interface AgentLogEntry {
  message: string;
  timestamp: Date;
}

export function emptyExtractions(): LiveExtractions {
  return {
    session_outline_updates: [],
    npc_updates: [],
    plot_threads: [],
    key_events: [],
    inventory_changes: [],
  };
}

export function mergeExtractions(
  existing: LiveExtractions,
  incoming: LiveExtractions
): LiveExtractions {
  const npcMap = new Map(existing.npc_updates.map((n) => [n.name.toLowerCase(), n]));
  for (const u of incoming.npc_updates) npcMap.set(u.name.toLowerCase(), { ...npcMap.get(u.name.toLowerCase()), ...u });

  const threadMap = new Map(existing.plot_threads.map((t) => [t.title.toLowerCase(), t]));
  for (const t of incoming.plot_threads) threadMap.set(t.title.toLowerCase(), t);

  return {
    session_outline_updates: [
      ...existing.session_outline_updates,
      ...incoming.session_outline_updates.filter((x) => !existing.session_outline_updates.includes(x)),
    ],
    npc_updates: Array.from(npcMap.values()),
    plot_threads: Array.from(threadMap.values()),
    key_events: [...existing.key_events, ...incoming.key_events],
    inventory_changes: [...existing.inventory_changes, ...incoming.inventory_changes],
  };
}

interface ChroniclerState {
  phase: ChroniclerPhase;
  activeSessionId: string | null;
  transcriptBuffer: string;
  extractions: LiveExtractions;
  agentLog: AgentLogEntry[];
  synthesis: SessionSynthesis | null;
  micError: string | null;

  // Actions
  setPhase: (phase: ChroniclerPhase) => void;
  setActiveSession: (id: string | null) => void;
  appendTranscript: (text: string) => void;
  addAgentLog: (message: string) => void;
  mergeIncomingExtractions: (incoming: LiveExtractions) => void;
  setSynthesis: (s: SessionSynthesis) => void;
  setMicError: (err: string | null) => void;
  resetSession: () => void;
}

export const useChroniclerStore = create<ChroniclerState>((set, get) => ({
  phase: "idle",
  activeSessionId: null,
  transcriptBuffer: "",
  extractions: emptyExtractions(),
  agentLog: [],
  synthesis: null,
  micError: null,

  setPhase: (phase) => set({ phase }),
  setActiveSession: (id) => set({ activeSessionId: id }),
  appendTranscript: (text) =>
    set((s) => ({ transcriptBuffer: s.transcriptBuffer ? `${s.transcriptBuffer} ${text}` : text })),
  addAgentLog: (message) =>
    set((s) => ({ agentLog: [...s.agentLog, { message, timestamp: new Date() }] })),
  mergeIncomingExtractions: (incoming) =>
    set((s) => ({ extractions: mergeExtractions(s.extractions, incoming) })),
  setSynthesis: (synthesis) => set({ synthesis }),
  setMicError: (micError) => set({ micError }),
  resetSession: () =>
    set({
      phase: "idle",
      activeSessionId: null,
      transcriptBuffer: "",
      extractions: emptyExtractions(),
      agentLog: [],
      synthesis: null,
      micError: null,
    }),
}));
