"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, CheckCircle2, ExternalLink } from "lucide-react";
import type { SessionData } from "@/lib/data";

interface CreateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  onCreated: (session: SessionData) => void;
}

export function CreateSessionDialog({
  open,
  onOpenChange,
  campaignId,
  onCreated,
}: CreateSessionDialogProps) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdOutline, setCreatedOutline] = useState<{
    sessionNumber: number;
    outlineDocId: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/session/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), campaignId }),
      });

      if (res.ok) {
        const raw = await res.json();
        const { outlineDocId, ...sessionRaw } = raw;
        const session: SessionData = {
          ...sessionRaw,
          date: sessionRaw.date ? new Date(sessionRaw.date) : null,
          createdAt: new Date(sessionRaw.createdAt),
          updatedAt: new Date(sessionRaw.updatedAt),
        };
        onCreated(session);

        if (outlineDocId) {
          setCreatedOutline({
            sessionNumber: session.sessionNumber,
            outlineDocId,
          });
        } else {
          setTitle("");
          onOpenChange(false);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setTitle("");
      setCreatedOutline(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-zinc-950 border-white/[0.08]">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">
            {createdOutline ? "Session Created" : "New Session"}
          </DialogTitle>
        </DialogHeader>

        {createdOutline ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm text-emerald-200 font-medium">
                  Session &amp; outline created
                </p>
                <p className="text-xs text-emerald-300/70">
                  A new session outline document (Session{" "}
                  {createdOutline.sessionNumber}) was created in Tome of
                  Schemes.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => handleClose(false)}
                className="text-zinc-400"
              >
                Close
              </Button>
              <Link href={`/notes?doc=${createdOutline.outlineDocId}`}>
                <Button className="bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open Outline
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              placeholder="Session title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-zinc-900 border-white/[0.08] text-zinc-100"
              autoFocus
            />
            <div className="flex items-start gap-2 rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2">
              <FileText className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-300/80">
                A session outline document will also be created in Tome of
                Schemes.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleClose(false)}
                className="text-zinc-400"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!title.trim() || loading}
                className="bg-orange-500/20 text-orange-300 hover:bg-orange-500/30"
              >
                {loading ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
