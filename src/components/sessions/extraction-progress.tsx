"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";

interface Step {
  message: string;
  status: "active" | "done";
}

interface ExtractionProgressProps {
  sessionId: string;
  isActive: boolean;
}

export function ExtractionProgress({ sessionId, isActive }: ExtractionProgressProps) {
  const [steps, setSteps] = useState<Step[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!isActive || !sessionId) return;

    setSteps([]);
    const es = new EventSource(`/api/session/updates?sessionId=${sessionId}`);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const message = data.message as string;
        const state = data.state as string;

        if (state === "done" || state === "error") {
          setSteps((prev) => prev.map((s) => ({ ...s, status: "done" as const })));
          es.close();
          return;
        }

        setSteps((prev) => {
          const updated = prev.map((s) =>
            s.status === "active" ? { ...s, status: "done" as const } : s,
          );
          return [...updated, { message, status: "active" }];
        });
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [isActive, sessionId]);

  if (steps.length === 0) return null;

  return (
    <div className="space-y-1.5 py-2">
      <AnimatePresence mode="popLayout">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 text-xs"
          >
            {step.status === "active" ? (
              <Loader2 className="h-3 w-3 animate-spin text-amber-400 shrink-0" />
            ) : (
              <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
            )}
            <span
              className={
                step.status === "active"
                  ? "text-zinc-300"
                  : "text-zinc-500"
              }
            >
              {step.message}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
