"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Search,
  Pin,
  CalendarClock,
  FileText,
  Lightbulb,
  Globe,
  PenLine,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { formatDate, parseJsonField } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { CampaignData, JournalData } from "@/lib/data";

const typeIcons: Record<string, React.ReactNode> = {
  session_recap: <CalendarClock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />,
  prep_notes: <FileText className="h-3.5 w-3.5 text-blue-400" />,
  reflection: <Lightbulb className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />,
  worldbuilding: <Globe className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />,
};

const typeLabels: Record<string, string> = {
  session_recap: "Session Recap",
  prep_notes: "Prep Notes",
  reflection: "Reflection",
  worldbuilding: "Worldbuilding",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export function JournalClient({ campaign }: { campaign: CampaignData }) {
  const [selectedEntry, setSelectedEntry] = useState<JournalData | null>(
    campaign.journals[0] || null,
  );
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return campaign.journals.filter((j) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !j.title.toLowerCase().includes(q) &&
          !j.content.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (typeFilter !== "all" && j.type !== typeFilter) return false;
      return true;
    });
  }, [campaign.journals, search, typeFilter]);

  return (
    <div>
      <PageHeader
        title="DM's Campaign Journal"
        subtitle="Session recaps, prep notes, reflections, and worldbuilding"
        icon={<BookOpen className="h-5 w-5 text-red-600 dark:text-crimson-light" />}
        actions={
          <Badge variant="gold">{campaign.journals.length} Entries</Badge>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-zinc-500" />
          <Input
            placeholder="Search journal entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card hover:bg-muted/60 dark:bg-white/[0.03] border-border dark:border-white/[0.06]"
          />
        </div>
        <div className="flex gap-1.5">
          {[
            "all",
            "session_recap",
            "prep_notes",
            "reflection",
            "worldbuilding",
          ].map((t) => (
            <Button
              key={t}
              variant={typeFilter === t ? "crimson" : "ghost"}
              size="sm"
              onClick={() => setTypeFilter(t)}
              className="text-xs"
            >
              {t === "all" ? "All" : typeLabels[t]}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Entry List */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="lg:col-span-4 space-y-2"
        >
          {filtered.map((entry) => (
            <motion.div key={entry.id} variants={item}>
              <Card
                className={cn(
                  "cursor-pointer transition-all duration-200",
                  selectedEntry?.id === entry.id
                    ? "border-crimson/30 glow-crimson"
                    : "hover:border-border dark:border-white/[0.1]",
                )}
                onClick={() => setSelectedEntry(entry)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    {typeIcons[entry.type]}
                    <Badge
                      variant="secondary"
                      className="text-[10px] h-4 px-1.5"
                    >
                      {typeLabels[entry.type]}
                    </Badge>
                    {entry.isPinned && <Pin className="h-3 w-3 text-amber-600 dark:text-gold" />}
                    {entry.session && (
                      <Badge variant="gold" className="text-[10px] h-4 px-1.5">
                        S#{entry.session.sessionNumber}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-foreground dark:text-zinc-200 line-clamp-1">
                    {entry.title}
                  </h3>
                  <p className="text-xs text-muted-foreground dark:text-zinc-500 line-clamp-2 mt-1">
                    {entry.content}
                  </p>
                  <p className="text-[10px] text-muted-foreground dark:text-zinc-600 mt-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(entry.createdAt)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Entry Detail */}
        <div className="lg:col-span-8">
          {selectedEntry ? (
            <motion.div
              key={selectedEntry.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  {typeIcons[selectedEntry.type]}
                  <Badge variant="outline" className="text-xs">
                    {typeLabels[selectedEntry.type]}
                  </Badge>
                  {selectedEntry.isPinned && (
                    <Badge variant="gold" className="text-xs gap-1">
                      <Pin className="h-3 w-3" /> Pinned
                    </Badge>
                  )}
                  {selectedEntry.session && (
                    <Badge variant="gold" className="text-xs">
                      Session #{selectedEntry.session.sessionNumber}:{" "}
                      {selectedEntry.session.title}
                    </Badge>
                  )}
                </div>

                <h2 className="text-xl font-heading font-semibold text-foreground dark:text-white mb-2">
                  {selectedEntry.title}
                </h2>

                <p className="text-xs text-muted-foreground dark:text-zinc-500 mb-6">
                  {formatDate(selectedEntry.createdAt)}
                </p>

                {parseJsonField<string>(selectedEntry.tags).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {parseJsonField<string>(selectedEntry.tags).map(
                      (tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ),
                    )}
                  </div>
                )}

                <div className="prose prose-invert prose-sm max-w-none">
                  <div className="text-sm text-foreground/80 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {selectedEntry.content}
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            <Card className="p-12">
              <div className="text-center text-muted-foreground dark:text-zinc-500">
                <PenLine className="h-8 w-8 mx-auto mb-3 text-muted-foreground dark:text-zinc-600" />
                <p className="text-sm">Select a journal entry to read</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
