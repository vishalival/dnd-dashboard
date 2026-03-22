"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarClock,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  MapPin,
  Users,
  GitBranch,
  GitMerge,
  KeyRound,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Swords,
  MessageSquare,
  ListChecks,
  Clock,
  Bookmark,
  FileText,
  Eye,
  Skull,
  Zap,
  Activity,
  Mic,
  MicOff,
  Square,
  Scroll,
  Package,
  Sparkles,
  Play,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, parseJsonField } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { CampaignData, SessionData } from "@/lib/data";
import { useChroniclerStore, type AgentLogEntry, type LiveExtractions, type SessionSynthesis } from "@/stores/chronicler-store";
import { startRecording, stopRecording, isRecording } from "@/lib/recording-manager";

const templateIcons: Record<string, React.ReactNode> = {
  tavern: <MapPin className="h-3.5 w-3.5" />,
  travel: <MapPin className="h-3.5 w-3.5" />,
  mystery: <KeyRound className="h-3.5 w-3.5" />,
  combat: <Swords className="h-3.5 w-3.5" />,
  political: <Users className="h-3.5 w-3.5" />,
};

// ─── Types ────────────────────────────────────────────────────────────────────

type EventType = "combat" | "revelation" | "death" | "discovery";
interface KeyEvent { type: EventType; description: string; }

const eventConfig: Record<EventType, { label: string; icon: React.ReactNode; className: string }> = {
  combat: { label: "Combat", icon: <Swords className="h-3 w-3" />, className: "border-crimson/40 text-crimson-light bg-crimson/10" },
  revelation: { label: "Revelation", icon: <Eye className="h-3 w-3" />, className: "border-arcane/40 text-arcane-light bg-arcane/10" },
  death: { label: "Death", icon: <Skull className="h-3 w-3" />, className: "border-zinc-500/40 text-zinc-300 bg-zinc-700/30" },
  discovery: { label: "Discovery", icon: <Zap className="h-3 w-3" />, className: "border-gold/40 text-gold bg-gold/10" },
};

// ─── AgentLogPanel ────────────────────────────────────────────────────────────

function AgentLogPanel({ entries }: { entries: AgentLogEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <div className="rounded-lg border border-white/[0.06] bg-black/20 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.05]">
        <Activity className="h-3 w-3 text-gold/50" />
        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">Agent Log</span>
      </div>
      <div className="max-h-32 overflow-y-auto">
        {[...entries].reverse().slice(0, 8).map((e, i) => (
          <div key={i} className="flex items-start gap-2 px-3 py-1.5 border-b border-white/[0.03] last:border-0">
            <span className="text-xs shrink-0">🕯️</span>
            <div className="min-w-0">
              <p className="text-[11px] text-zinc-400 leading-tight">
                <span className="text-gold/70 font-medium">Chronicler</span> — {e.message}
              </p>
              <p className="text-[10px] text-zinc-600 mt-0.5">
                {e.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── LiveWorldState ───────────────────────────────────────────────────────────

function LiveWorldState({ extractions }: { extractions: LiveExtractions }) {
  const hasContent =
    extractions.session_outline_updates.length > 0 ||
    extractions.key_events.length > 0 ||
    extractions.npc_updates.length > 0 ||
    extractions.plot_threads.length > 0 ||
    extractions.inventory_changes.length > 0;
  if (!hasContent) return null;
  return (
    <div className="space-y-3">
      {extractions.session_outline_updates.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Session Outline</p>
          {extractions.session_outline_updates.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-2 text-sm text-zinc-300">
              <span className="text-zinc-600 shrink-0 font-mono text-xs mt-0.5">{i + 1}.</span>{item}
            </motion.div>
          ))}
        </div>
      )}
      {extractions.key_events.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Key Events</p>
          {extractions.key_events.map((e, i) => {
            const cfg = eventConfig[e.type as EventType];
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className={cn("flex items-start gap-2 px-2.5 py-1.5 rounded-md border text-xs", cfg.className)}>
                {cfg.icon}<span>{e.description}</span>
              </motion.div>
            );
          })}
        </div>
      )}
      {extractions.npc_updates.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">NPC Updates</p>
          {extractions.npc_updates.map((u, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-2 px-2.5 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.05] text-xs">
              <Users className="h-3 w-3 text-zinc-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-zinc-200 font-medium">{u.name}</span>
                {u.disposition_change && <Badge variant="outline" className="ml-1.5 text-[9px] h-3.5 px-1">{u.disposition_change}</Badge>}
                {u.status_change && <Badge variant="secondary" className="ml-1 text-[9px] h-3.5 px-1">{u.status_change}</Badge>}
                <p className="text-zinc-500 mt-0.5">{u.reason}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {extractions.plot_threads.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Plot Threads</p>
          {extractions.plot_threads.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-2 px-2.5 py-1.5 rounded-md bg-arcane/5 border border-arcane/10 text-xs">
              <GitMerge className="h-3 w-3 text-arcane-light mt-0.5 shrink-0" />
              <div>
                <span className="text-zinc-200 font-medium">{t.title}</span>
                <Badge variant="outline" className={cn("ml-1.5 text-[9px] h-3.5 px-1", t.status === "resolved" && "text-emerald-400 border-emerald-400/30")}>{t.status}</Badge>
                <p className="text-zinc-500 mt-0.5">{t.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {extractions.inventory_changes.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Inventory</p>
          {extractions.inventory_changes.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white/[0.02] border border-white/[0.04] text-xs">
              <Package className="h-3 w-3 text-zinc-400 shrink-0" />
              <span className="text-zinc-400">{c.character}</span>
              <span className={cn("font-medium", c.action === "gained" ? "text-emerald-400" : "text-red-400")}>{c.action === "gained" ? "+" : "−"}</span>
              <span className="text-zinc-200">{c.item}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SessionClosingScreen ─────────────────────────────────────────────────────

function SessionClosingScreen({ synthesis }: { synthesis: SessionSynthesis }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex items-center gap-2 text-gold">
        <Sparkles className="h-5 w-5" />
        <span className="text-base font-heading font-semibold">{synthesis.session_title}</span>
      </div>
      <div className="p-5 rounded-xl bg-gold/5 border border-gold/20">
        <p className="text-[10px] font-mono text-gold/50 uppercase tracking-widest mb-3">Previously on...</p>
        <p className="text-sm text-zinc-200 leading-relaxed italic">{synthesis.previously_on}</p>
      </div>
      <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.05]">
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">Session Summary</p>
        <p className="text-sm text-zinc-300 leading-relaxed">{synthesis.session_summary}</p>
      </div>
      {synthesis.key_events_final.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Key Events</p>
          {synthesis.key_events_final.map((e, i) => {
            const cfg = eventConfig[e.type as EventType];
            return (
              <div key={i} className={cn("flex items-start gap-2 px-3 py-2 rounded-lg border text-sm", cfg.className)}>
                {cfg.icon}<span>{e.description}</span>
              </div>
            );
          })}
        </div>
      )}
      {synthesis.npc_status_changes.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">NPC Changes</p>
          {synthesis.npc_status_changes.map((c, i) => (
            <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-sm">
              <Users className="h-3.5 w-3.5 text-zinc-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-zinc-200 font-medium">{c.name}</span>
                <span className="text-zinc-500 mx-1.5">·</span>
                <span className="text-zinc-500 line-through text-xs">{c.old_status}</span>
                <span className="text-zinc-400 mx-1">→</span>
                <span className={cn("text-xs font-medium", c.new_status === "dead" ? "text-zinc-400" : "text-emerald-400")}>{c.new_status}</span>
                <p className="text-zinc-500 text-xs mt-0.5">{c.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        {synthesis.unresolved_threads.length > 0 && (
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">Open Threads</p>
            <ul className="space-y-1">
              {synthesis.unresolved_threads.map((t, i) => (
                <li key={i} className="text-xs text-zinc-400 flex items-start gap-1.5"><span className="text-zinc-600 shrink-0">·</span>{t}</li>
              ))}
            </ul>
          </div>
        )}
        {synthesis.items_gained.length > 0 && (
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">Items Gained</p>
            <ul className="space-y-1">
              {synthesis.items_gained.map((item, i) => (
                <li key={i} className="text-xs text-zinc-400 flex items-start gap-1.5"><Package className="h-3 w-3 text-zinc-600 shrink-0 mt-0.5" />{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── LiveSessionPanel ─────────────────────────────────────────────────────────

function LiveSessionPanel({ session, onSessionEnded, isResumable }: {
  session: SessionData;
  onSessionEnded: (synthesis: SessionSynthesis) => void;
  isResumable: boolean;
}) {
  const {
    phase, activeSessionId,
    transcriptBuffer, extractions, agentLog, synthesis, micError,
    setPhase, setActiveSession, mergeIncomingExtractions, setSynthesis, addAgentLog,
  } = useChroniclerStore();

  const [showTranscript, setShowTranscript] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const isListening = phase === "recording" && activeSessionId === session.id;

  useEffect(() => {
    const es = new EventSource(`/api/session/updates?sessionId=${session.id}`);
    es.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.state === "log") {
        addAgentLog(msg.message);
      } else if (msg.state === "processing" && msg.data && Object.keys(msg.data).length > 0) {
        mergeIncomingExtractions(msg.data as LiveExtractions);
      } else if (msg.state === "done") {
        setSynthesis(msg.data as SessionSynthesis);
        setPhase("done");
        onSessionEnded(msg.data as SessionSynthesis);
        es.close();
      } else if (msg.state === "error") {
        setPhase("error");
        setIsEnding(false);
      } else if (msg.message) {
        addAgentLog(msg.message);
      }
    };
    return () => es.close();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id]);

  // Only auto-start for the most recent in_progress session
  useEffect(() => {
    if (!isResumable) return;
    if (!isRecording()) {
      setActiveSession(session.id);
      startRecording(session.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only resume on tab focus for the resumable session
  useEffect(() => {
    if (!isResumable) return;
    const onVisibilityChange = () => {
      if (!document.hidden && activeSessionId === session.id && !isRecording()) {
        startRecording(session.id);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [session.id, activeSessionId, isResumable]);

  const endSession = async () => {
    stopRecording();
    setIsEnding(true);
    setPhase("processing");
    addAgentLog("synthesizing full session — the Chronicler is writing...");
    try {
      const res = await fetch("/api/session/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
    } catch (err) {
      console.error(err);
      setPhase("error");
      setIsEnding(false);
    }
  };

  if (synthesis && phase === "done") return <SessionClosingScreen synthesis={synthesis} />;

  // Non-resumable: old in_progress session — can only be ended, not resumed
  if (!isResumable) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <MicOff className="h-4 w-4 shrink-0" />
            <span>Recording closed — only the most recent session can be resumed.</span>
          </div>
          <Button variant="destructive" size="sm" onClick={endSession} disabled={isEnding} className="gap-1.5 text-xs shrink-0">
            <Square className="h-3 w-3" />End Session
          </Button>
        </div>
        {session.transcript && (
          <div className="border border-white/[0.04] rounded-lg overflow-hidden">
            <button onClick={() => setShowTranscript(!showTranscript)} className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <FileText className="h-3.5 w-3.5" />View Transcript
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-mono">{session.transcript.split(/\s+/).length} words</Badge>
              </div>
              {showTranscript ? <ChevronUp className="h-3.5 w-3.5 text-zinc-600" /> : <ChevronDown className="h-3.5 w-3.5 text-zinc-600" />}
            </button>
            {showTranscript && (
              <div className="px-4 pb-4 pt-1 max-h-48 overflow-y-auto border-t border-white/[0.04]">
                <p className="text-xs text-zinc-400 leading-relaxed font-mono whitespace-pre-wrap">{session.transcript}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isListening ? (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crimson opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-crimson" />
              </span>
              <Mic className="h-4 w-4 text-crimson-light" />
              <span className="text-sm font-medium text-zinc-200">Chronicler is listening</span>
            </>
          ) : (
            <>
              <MicOff className="h-4 w-4 text-zinc-500" />
              <span className="text-sm text-zinc-500">Microphone off</span>
            </>
          )}
          {!isListening && !isEnding && (
            <Button size="sm" variant="ghost" onClick={() => { setActiveSession(session.id); startRecording(session.id); }} className="text-xs h-7 gap-1">
              <Mic className="h-3 w-3" /> Resume
            </Button>
          )}
        </div>
        <Button variant="destructive" size="sm" onClick={endSession} disabled={isEnding} className="gap-1.5 text-xs shrink-0">
          <Square className="h-3 w-3" />End Session
        </Button>
      </div>

      {micError && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-crimson/10 border border-crimson/20 text-xs text-crimson-light">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />{micError}
        </div>
      )}

      <AnimatePresence>
        {phase === "processing" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-arcane/10 border border-arcane/20">
            <Scroll className="h-4 w-4 text-arcane-light animate-pulse" />
            <span className="text-sm text-arcane-light">The Chronicler is at work...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <LiveWorldState extractions={extractions} />

      {transcriptBuffer && (
        <div className="border border-white/[0.04] rounded-lg overflow-hidden">
          <button onClick={() => setShowTranscript(!showTranscript)} className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <FileText className="h-3.5 w-3.5" />View Transcript
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-mono">{transcriptBuffer.split(/\s+/).length} words</Badge>
            </div>
            {showTranscript ? <ChevronUp className="h-3.5 w-3.5 text-zinc-600" /> : <ChevronDown className="h-3.5 w-3.5 text-zinc-600" />}
          </button>
          <AnimatePresence>
            {showTranscript && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="px-4 pb-4 pt-1 max-h-48 overflow-y-auto">
                  <p className="text-xs text-zinc-400 leading-relaxed font-mono whitespace-pre-wrap">{transcriptBuffer}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <AgentLogPanel entries={agentLog} />
    </div>
  );
}

function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
  count,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  count?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border dark:border-white/[0.04] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-3 hover:bg-card hover:bg-muted/50 dark:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-foreground/80 dark:text-zinc-300">
          {icon}
          {title}
          {count !== undefined && count > 0 && (
            <Badge variant="secondary" className="text-[10px] h-5 ml-1">
              {count}
            </Badge>
          )}
        </div>
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground dark:text-zinc-500" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground dark:text-zinc-500" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── EditableList ─────────────────────────────────────────────────────────────

function EditableList({
  items,
  onChange,
  placeholder,
  multiline = false,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-start">
          {multiline ? (
            <textarea
              value={item}
              onChange={(e) => {
                const updated = [...items];
                updated[i] = e.target.value;
                onChange(updated);
              }}
              placeholder={placeholder}
              rows={2}
              className="flex-1 text-sm bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.15] resize-none"
            />
          ) : (
            <input
              value={item}
              onChange={(e) => {
                const updated = [...items];
                updated[i] = e.target.value;
                onChange(updated);
              }}
              placeholder={placeholder}
              className="flex-1 text-sm bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.15]"
            />
          )}
          <button
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="p-2 mt-0.5 rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...items, ""])}
        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mt-1"
      >
        <Plus className="h-3.5 w-3.5" /> Add item
      </button>
    </div>
  );
}

// ─── SessionDetail ────────────────────────────────────────────────────────────

interface EditDraft {
  title: string;
  status: string;
  keyBeats: string[];
  encounters: string[];
  reminders: string[];
  checklist: string[];
}

function SessionDetail({ session, onStartSession, onSessionEnded, onSave, onResumeSession, isResumable }: {
  session: SessionData;
  onStartSession: () => void;
  onSessionEnded: (synthesis: SessionSynthesis) => void;
  onSave: (updated: SessionData) => void;
  onResumeSession: (sessionId: string) => void;
  isResumable: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<EditDraft>({
    title: session.title,
    status: session.status,
    keyBeats: parseJsonField<string>(session.keyBeats),
    encounters: parseJsonField<string>(session.encounters),
    reminders: parseJsonField<string>(session.reminders),
    checklist: parseJsonField<string>(session.checklist),
  });

  // Reset draft when session changes
  React.useEffect(() => {
    setIsEditing(false);
    setDraft({
      title: session.title,
      status: session.status,
      keyBeats: parseJsonField<string>(session.keyBeats),
      encounters: parseJsonField<string>(session.encounters),
      reminders: parseJsonField<string>(session.reminders),
      checklist: parseJsonField<string>(session.checklist),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id]);

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/session/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id, ...draft }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const updated = await res.json();
      onSave(updated);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const keyBeats = isEditing ? draft.keyBeats : parseJsonField<string>(session.keyBeats);
  const encounters = isEditing ? draft.encounters : parseJsonField<string>(session.encounters);
  const hooks = parseJsonField<string>(session.hooks);
  const locations = parseJsonField<string>(session.locations);
  const playerNotes = parseJsonField<string>(session.playerNotes);
  const contingencies = parseJsonField<string>(session.contingencies);
  const improvPrompts = parseJsonField<string>(session.improvPrompts);
  const reminders = parseJsonField<string>(session.reminders);
  const checklist = parseJsonField<string>(session.checklist);
  const keyEvents = parseJsonField<KeyEvent>(session.keyEvents ?? null);

  const isInProgress = session.status === "in_progress";
  const isCompleted = session.status === "completed";
  const canStart = ["ready", "planning", "draft"].includes(session.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <input
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                className="w-full text-xl font-heading font-semibold bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-white/[0.2]"
              />
              <select
                value={draft.status}
                onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
                className="text-xs bg-[#141416] border border-white/[0.08] rounded-md px-2 py-1 text-zinc-300 focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="planning">Planning</option>
                <option value="ready">Ready</option>
              </select>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-heading font-semibold text-foreground dark:text-white">
                {session.title.toLowerCase().startsWith(`session ${session.sessionNumber}`)
                  ? session.title
                  : `Session ${session.sessionNumber}: ${session.title}`}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                {session.date && (
                  <span className="text-sm text-muted-foreground dark:text-zinc-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDate(session.date)}
                  </span>
                )}
                <StatusBadge status={session.status} />
                {session.template && (
                  <Badge variant="outline" className="text-xs gap-1">
                    {templateIcons[session.template]}
                    {session.template}
                  </Badge>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isEditing ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="gap-1.5 text-xs h-8">
                <X className="h-3.5 w-3.5" />Cancel
              </Button>
              <Button variant="gold" size="sm" onClick={handleSaveEdit} disabled={isSaving} className="gap-1.5 text-xs h-8">
                <Check className="h-3.5 w-3.5" />{isSaving ? "Saving…" : "Save"}
              </Button>
            </>
          ) : (
            <>
              {!isInProgress && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="gap-1.5 text-xs h-8 text-zinc-400 hover:text-zinc-200">
                  <Pencil className="h-3.5 w-3.5" />Edit Plan
                </Button>
              )}
              {isCompleted && isResumable && (
                <Button variant="outline" size="sm" onClick={() => onResumeSession(session.id)} className="gap-1.5 text-xs h-8 border-crimson/40 text-crimson hover:bg-crimson/10">
                  <Mic className="h-3.5 w-3.5" />Continue Recording
                </Button>
              )}
              {canStart && (
                <Button variant="gold" size="sm" onClick={onStartSession} className="gap-1.5">
                  <Play className="h-3.5 w-3.5" />Start Session
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Live session panel */}
      {isInProgress && (
        <div className="rounded-xl border border-crimson/20 bg-crimson/[0.03] p-5">
          <LiveSessionPanel session={session} onSessionEnded={onSessionEnded} isResumable={isResumable} />
        </div>
      )}

      {/* Completed recap */}
      {isCompleted && session.recapForNext && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gold">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium font-heading">Chronicler Summary</span>
          </div>
          <div className="p-4 rounded-lg bg-gold/5 border border-gold/20">
            <p className="text-xs text-gold/60 font-mono mb-2 uppercase tracking-wider">Previously on...</p>
            <p className="text-sm text-zinc-200 leading-relaxed italic">{session.recapForNext}</p>
          </div>
          {keyEvents.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-mono">Key Events</p>
              {keyEvents.map((e, i) => {
                const cfg = eventConfig[e.type as EventType];
                return (
                  <div key={i} className={cn("flex items-start gap-2 px-3 py-2 rounded-lg border text-sm", cfg.className)}>
                    {cfg.icon}<span>{e.description}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Session Transcript (completed sessions) */}
      {isCompleted && session.transcript && (
        <CollapsibleSection
          title="Session Transcript"
          icon={<Scroll className="h-4 w-4 text-zinc-500" />}
        >
          <p className="text-xs text-zinc-400 leading-relaxed font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
            {session.transcript}
          </p>
        </CollapsibleSection>
      )}

      {/* Checklist */}
      {(isEditing || checklist.length > 0) && (
        <CollapsibleSection
          title="Pre-Session Checklist"
          icon={<ListChecks className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
          defaultOpen={true}
          count={isEditing ? draft.checklist.length : checklist.length}
        >
          {isEditing ? (
            <EditableList
              items={draft.checklist}
              onChange={(v) => setDraft((d) => ({ ...d, checklist: v }))}
              placeholder="Add a checklist item…"
            />
          ) : (
            <div className="space-y-2">
              {checklist.map((item, i) => (
                <label key={i} className="flex items-start gap-2 text-sm text-foreground/80 dark:text-zinc-300 cursor-pointer group">
                  <input type="checkbox" className="mt-1 h-3.5 w-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="group-hover:text-foreground">{item}</span>
                </label>
              ))}
            </div>
          )}
        </CollapsibleSection>
      )}

      {/* Reminders */}
      {(isEditing || reminders.length > 0) && (
        <CollapsibleSection
          title="Important Reminders"
          icon={<AlertCircle className="h-4 w-4 text-red-400" />}
          defaultOpen={true}
          count={isEditing ? draft.reminders.length : reminders.length}
        >
          {isEditing ? (
            <EditableList
              items={draft.reminders}
              onChange={(v) => setDraft((d) => ({ ...d, reminders: v }))}
              placeholder="Add a reminder…"
            />
          ) : (
            <div className="space-y-2">
              {reminders.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-red-300/80">
                  <AlertCircle className="h-3.5 w-3.5 text-red-400/50 mt-0.5 shrink-0" />
                  {r}
                </div>
              ))}
            </div>
          )}
        </CollapsibleSection>
      )}

      {session.summary && (
        <p className="text-sm text-foreground/80 dark:text-zinc-300 leading-relaxed bg-card hover:bg-muted/50 dark:bg-white/[0.02] rounded-lg p-4 border border-border dark:border-white/[0.04]">
          {session.summary}
        </p>
      )}

      {/* Connected Entities (Separated & Labeled) */}
      {(session.storylineLinks.length > 0 || session.npcLinks.length > 0 || session.secretLinks.length > 0) && (
      <div className="space-y-3 p-4 bg-muted/30 dark:bg-white/[0.01] rounded-lg border border-border dark:border-white/[0.04]">
        {session.storylineLinks.length > 0 && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-3">Plot Lines</span>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {session.storylineLinks.map((sl) => (
                <Badge key={sl.storylineId} variant="arcane" className="text-xs gap-1">
                  <GitBranch className="h-3 w-3" />
                  {sl.storyline.title}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {session.npcLinks.length > 0 && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-3">NPCs</span>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {session.npcLinks.map((nl) => (
                <Badge key={nl.npcId} variant="emerald" className="text-xs gap-1">
                  <Users className="h-3 w-3" />
                  {nl.npc.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {session.secretLinks.length > 0 && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-3">Secrets & Missions</span>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {session.secretLinks.map((sl) => (
                <Badge key={sl.secretId} variant="purple" className="text-xs gap-1">
                  <KeyRound className="h-3 w-3" />
                  {sl.secret.title}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
      )}

      <div className="space-y-3">
        {/* Key Beats -> Acts */}
        {(isEditing || keyBeats.length > 0) && (
          <CollapsibleSection
            title="Acts"
            icon={<Bookmark className="h-4 w-4 text-amber-600 dark:text-gold" />}
            defaultOpen={true}
            count={isEditing ? draft.keyBeats.length : keyBeats.length}
          >
            {isEditing ? (
              <EditableList
                items={draft.keyBeats}
                onChange={(v) => setDraft((d) => ({ ...d, keyBeats: v }))}
                placeholder="Describe this act…"
                multiline
              />
            ) : (
              <div className="space-y-3">
                {keyBeats.map((beat, i) => (
                  <div key={i} className="flex flex-col gap-1 p-3 rounded-lg bg-card border border-border dark:border-white/[0.02]">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-gold/80">Act {i + 1}</span>
                    <span className="text-sm text-foreground/80 dark:text-zinc-300 whitespace-pre-wrap">{beat}</span>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>
        )}

        {/* Encounters/Scenes */}
        {(isEditing || encounters.length > 0) && (
          <CollapsibleSection
            title="Encounters & Scenes"
            icon={<Swords className="h-4 w-4 text-red-600 dark:text-crimson-light" />}
            defaultOpen={true}
            count={isEditing ? draft.encounters.length : encounters.length}
          >
            {isEditing ? (
              <EditableList
                items={draft.encounters}
                onChange={(v) => setDraft((d) => ({ ...d, encounters: v }))}
                placeholder="Describe an encounter or scene…"
                multiline
              />
            ) : (
              <div className="space-y-2">
                {encounters.map((enc, i) => (
                  <div key={i} className="p-3 rounded-lg bg-card hover:bg-muted/50 dark:bg-white/[0.02] border-l-2 border-crimson/30">
                    <span className="text-sm text-foreground/80 dark:text-zinc-300">{enc}</span>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>
        )}

        {/* Hooks */}
        {hooks.length > 0 && (
          <CollapsibleSection
            title="Possible Hooks"
            icon={<Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
            count={hooks.length}
          >
            <div className="space-y-2">
              {hooks.map((hook, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-sm text-foreground/80 dark:text-zinc-300"
                >
                  <Lightbulb className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400/50 mt-0.5 shrink-0" />
                  {hook}
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Locations */}
        {locations.length > 0 && (
          <CollapsibleSection
            title="Locations"
            icon={<MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
            count={locations.length}
          >
            <div className="flex flex-wrap gap-2">
              {locations.map((loc, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  {loc}
                </Badge>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Player Notes */}
        {playerNotes.length > 0 && (
          <CollapsibleSection
            title="Player-Specific Notes"
            icon={<FileText className="h-4 w-4 text-blue-400" />}
            count={playerNotes.length}
          >
            <div className="space-y-2">
              {playerNotes.map((note, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-card hover:bg-muted/50 dark:bg-white/[0.02] text-sm text-foreground/80 dark:text-zinc-300"
                >
                  {note}
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Contingencies */}
        {contingencies.length > 0 && (
          <CollapsibleSection
            title="Contingency Branches"
            icon={<AlertCircle className="h-4 w-4 text-orange-400" />}
            count={contingencies.length}
          >
            <div className="space-y-2">
              {contingencies.map((c, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-orange-400/5 border border-orange-400/10 text-sm text-foreground/80 dark:text-zinc-300"
                >
                  {c}
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Improv Prompts */}
        {improvPrompts.length > 0 && (
          <CollapsibleSection
            title="Improv Prompts"
            icon={<MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
            count={improvPrompts.length}
          >
            <div className="space-y-2">
              {improvPrompts.map((p, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-purple-400/5 border border-purple-400/10 text-sm text-foreground/80 dark:text-zinc-300 italic"
                >
                  &ldquo;{p}&rdquo;
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}
      </div>
    </motion.div>
  );
}

export function SessionsClient({ campaign }: { campaign: CampaignData }) {
  const [sessions, setSessions] = useState(campaign.sessions);
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(
    [...campaign.sessions].sort((a, b) => b.sessionNumber - a.sessionNumber)[0] ?? null,
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [newSessionOpen, setNewSessionOpen] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredSessions = statusFilter === "all" ? sessions : sessions.filter((s) => s.status === statusFilter);
  const sortedSessions = [...filteredSessions].sort((a, b) => b.sessionNumber - a.sessionNumber);

  // The most recent session by session number can always be resumed (re-opened if completed)
  const resumableSessionId = [...sessions]
    .sort((a, b) => b.sessionNumber - a.sessionNumber)[0]?.id ?? null;

  const handleCreateSession = async () => {
    if (!newSessionTitle.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/session/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newSessionTitle.trim(), campaignId: campaign.id }),
      });
      if (!res.ok) throw new Error("Failed to create session");
      const newSession = await res.json();
      setSessions((prev) => [...prev, newSession]);
      setSelectedSession(newSession);
      setNewSessionTitle("");
      setNewSessionOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/session/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) throw new Error("Failed to delete session");
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (selectedSession?.id === sessionId) {
        setSelectedSession(sessions.find((s) => s.id !== sessionId) ?? null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleSaveSession = (updated: SessionData) => {
    setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setSelectedSession((prev) => (prev?.id === updated.id ? updated : prev));
  };

  const handleStartSession = async () => {
    if (!selectedSession) return;
    const res = await fetch("/api/session/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: selectedSession.id }),
    });
    if (!res.ok) return;
    const updated = sessions.map((s) => s.id === selectedSession.id ? { ...s, status: "in_progress", liveLog: "[]" } : s);
    setSessions(updated);
    setSelectedSession(updated.find((s) => s.id === selectedSession.id) ?? selectedSession);
  };

  const handleSessionEnded = (synthesis: SessionSynthesis) => {
    if (!selectedSession) return;
    const updated = sessions.map((s) =>
      s.id === selectedSession.id
        ? { ...s, status: "completed", summary: synthesis.session_summary, keyEvents: JSON.stringify(synthesis.key_events_final), recapForNext: synthesis.previously_on, title: synthesis.session_title || s.title }
        : s
    );
    setSessions(updated);
    setSelectedSession(updated.find((s) => s.id === selectedSession.id) ?? selectedSession);
  };

  const handleResumeSession = async (sessionId: string) => {
    try {
      const res = await fetch("/api/session/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) return;
      const updated = await res.json();
      setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, ...updated } : s)));
      setSelectedSession((prev) => (prev?.id === sessionId ? { ...prev, ...updated } : prev));
    } catch (err) {
      console.error("[handleResumeSession]", err);
    }
  };

  return (
    <div>
      {/* New Session Dialog */}
      <Dialog open={newSessionOpen} onOpenChange={setNewSessionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">New Session</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              placeholder="Session title…"
              value={newSessionTitle}
              onChange={(e) => setNewSessionTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreateSession(); }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setNewSessionOpen(false)}>Cancel</Button>
            <Button variant="gold" size="sm" onClick={handleCreateSession} disabled={!newSessionTitle.trim() || isCreating}>
              {isCreating ? "Creating…" : "Create Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">Delete Session?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-400">This will permanently delete the session and all its data. This cannot be undone.</p>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={() => deleteConfirmId && handleDeleteSession(deleteConfirmId)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PageHeader
        title="Session Planner"
        subtitle="Plan, organize, and track your campaign sessions"
        icon={<CalendarClock className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
        actions={
          <div className="flex gap-2 flex-wrap items-center">
            {["all", "draft", "planning", "ready", "in_progress", "completed"].map((s) => (
              <Button key={s} variant={statusFilter === s ? "gold" : "ghost"} size="sm" onClick={() => setStatusFilter(s)} className="text-xs capitalize">
                {s === "in_progress" ? "live" : s}
              </Button>
            ))}
            <Button variant="gold" size="sm" onClick={() => setNewSessionOpen(true)} className="gap-1.5 text-xs ml-2">
              <Plus className="h-3.5 w-3.5" />New Session
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Session List */}
        <div className="lg:col-span-4 space-y-2">
          {sortedSessions.map((session) => (
            <motion.div key={session.id} whileHover={{ x: 2 }} whileTap={{ scale: 0.99 }} className="group">
              <Card
                className={cn(
                  "cursor-pointer transition-all duration-200",
                  selectedSession?.id === session.id ? "border-gold/30 glow-gold" : "hover:border-white/[0.1]",
                  session.status === "in_progress" && "border-crimson/30"
                )}
                onClick={() => setSelectedSession(session)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gold/60">#{session.sessionNumber}</span>
                        <StatusBadge status={session.status} />
                        {session.status === "in_progress" && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crimson opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-crimson" />
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-medium text-zinc-200 mt-1 truncate">{session.title}</h3>
                      {session.date && <p className="text-xs text-zinc-500 mt-1">{formatDate(session.date)}</p>}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(session.id); }}
                      className="p-1.5 rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                      title="Delete session"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {(session.storylineLinks.length > 0 || session.npcLinks.length > 0) && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {session.storylineLinks.slice(0, 2).map((sl) => (
                        <Badge key={sl.storylineId} variant="arcane" className="text-[10px] h-4 px-1.5">{sl.storyline.title}</Badge>
                      ))}
                      {session.npcLinks.slice(0, 2).map((nl) => (
                        <Badge key={nl.npcId} variant="emerald" className="text-[10px] h-4 px-1.5">{nl.npc.name}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Session Detail */}
        <div className="lg:col-span-8">
          {selectedSession ? (
            <Card className="p-6">
              <SessionDetail
                session={selectedSession}
                onStartSession={handleStartSession}
                onSessionEnded={handleSessionEnded}
                onSave={handleSaveSession}
                onResumeSession={handleResumeSession}
                isResumable={selectedSession.id === resumableSessionId}
              />
            </Card>
          ) : (
            <Card className="p-12">
              <div className="text-center text-zinc-500">
                <CalendarClock className="h-8 w-8 mx-auto mb-3 text-zinc-600" />
                <p className="text-sm">Select a session to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
