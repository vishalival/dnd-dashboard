"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NoteDocumentData } from "@/lib/data";

interface CreateDocDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId: string | null;
  campaignId: string;
  onCreated: (doc: NoteDocumentData) => void;
}

export function CreateDocDialog({
  open,
  onOpenChange,
  folderId,
  campaignId,
  onCreated,
}: CreateDocDialogProps) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !folderId) return;

    setLoading(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId, title: title.trim(), campaignId }),
      });

      if (res.ok) {
        const raw = await res.json();
        const doc: NoteDocumentData = {
          ...raw,
          createdAt: new Date(raw.createdAt),
          updatedAt: new Date(raw.updatedAt),
        };
        onCreated(doc);
        setTitle("");
        onOpenChange(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-white/[0.08]">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">New Document</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            placeholder="Document title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-zinc-900 border-white/[0.08] text-zinc-100"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
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
      </DialogContent>
    </Dialog>
  );
}
