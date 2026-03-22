import { EventEmitter } from "events";

export type ChroniclerState = "processing" | "done" | "error" | "log";

export interface AgentMessage {
  agent: "chronicler";
  state: ChroniclerState;
  message: string;
  data: Record<string, unknown>;
}

const globalEmitter = global as typeof global & {
  _agentEmitter?: EventEmitter;
};
if (!globalEmitter._agentEmitter) {
  globalEmitter._agentEmitter = new EventEmitter();
  globalEmitter._agentEmitter.setMaxListeners(50);
}

export const agentEmitter = globalEmitter._agentEmitter;

export function emitAgentEvent(sessionId: string, message: AgentMessage) {
  agentEmitter.emit(`session:${sessionId}`, message);
}
