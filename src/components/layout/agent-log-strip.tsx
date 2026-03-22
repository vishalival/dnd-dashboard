"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useChroniclerStore } from "@/stores/chronicler-store";
import { cn } from "@/lib/utils";

function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function AgentLogStrip() {
  const { agentLog, phase } = useChroniclerStore();
  const [expanded, setExpanded] = useState(false);
  const [pulsing, setPulsing] = useState(false);
  const prevLen = useRef(agentLog.length);

  // Pulse for 2s whenever a new entry arrives
  useEffect(() => {
    if (agentLog.length > prevLen.current) {
      setPulsing(true);
      const t = setTimeout(() => setPulsing(false), 2000);
      prevLen.current = agentLog.length;
      return () => clearTimeout(t);
    }
    prevLen.current = agentLog.length;
  }, [agentLog.length]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isIdle = phase === "idle" && agentLog.length === 0;
  const latest = agentLog[agentLog.length - 1];
  const displayed = agentLog.slice(-30); // oldest → newest order

  // Auto-scroll to bottom when new entries arrive
  useEffect(() => {
    if (expanded && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [agentLog.length, expanded]);

  return (
    <div className="border-t border-[#1F1F22] shrink-0">
      {/* Collapsed strip / toggle row */}
      <button
        onClick={() => !isIdle && setExpanded((v) => !v)}
        className={cn(
          "w-full flex items-center gap-2 px-3 h-9 transition-colors",
          !isIdle && "hover:bg-white/[0.03] cursor-pointer",
          isIdle && "cursor-default",
          pulsing && "bg-amber-500/[0.04]"
        )}
      >
        {/* Status dot */}
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          {pulsing && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
          )}
          <span className={cn(
            "relative inline-flex rounded-full h-1.5 w-1.5",
            isIdle ? "bg-zinc-700" : "bg-amber-500/70"
          )} />
        </span>

        {/* Timestamp */}
        <span className={cn(
          "font-mono text-[10px] shrink-0 tabular-nums",
          isIdle ? "text-zinc-700" : "text-amber-600/60"
        )}>
          {latest ? formatElapsed(latest.elapsedMs) : "00:00"}
        </span>

        {/* Message */}
        <span className={cn(
          "font-mono text-[11px] truncate flex-1 text-left leading-none",
          isIdle ? "text-zinc-700" : "text-amber-400/75"
        )}>
          {isIdle ? "no active session" : (latest?.message ?? "agent log")}
        </span>

        {/* Chevron — only when there are entries */}
        {!isIdle && (
          expanded
            ? <ChevronDown className="h-3 w-3 text-zinc-600 shrink-0" />
            : <ChevronUp className="h-3 w-3 text-zinc-600 shrink-0" />
        )}
      </button>

      {/* Expanded list — oldest at top, newest at bottom */}
      {expanded && !isIdle && (
        <div ref={scrollRef} className="max-h-48 overflow-y-auto scrollbar-thin border-t border-[#1F1F22] bg-black/20">
          {displayed.map((entry, i) => {
            // Oldest entries are dimmer, newest (bottom) are brightest
            const opacity = Math.max(0.45, 0.45 + (i / displayed.length) * 0.55);
            return (
              <div
                key={i}
                className="flex items-start gap-2 px-3 py-1.5 border-b border-white/[0.025] last:border-0"
                style={{ opacity }}
              >
                <span className="font-mono text-[10px] text-amber-600/50 shrink-0 tabular-nums mt-px">
                  {formatElapsed(entry.elapsedMs)}
                </span>
                <span className="font-mono text-[11px] text-amber-400/70 leading-tight break-words min-w-0">
                  {entry.message}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
