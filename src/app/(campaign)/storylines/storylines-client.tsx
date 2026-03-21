"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch,
  Filter,
  Clock,
  Users,
  KeyRound,
  CalendarClock,
  ChevronRight,
  Milestone,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, parseJsonField } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { CampaignData, StorylineData } from "@/lib/data";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

function StorylineCard({
  storyline,
  isSelected,
  onClick,
}: {
  storyline: StorylineData;
  isSelected: boolean;
  onClick: () => void;
}) {
  const tags = parseJsonField<string>(storyline.tags);

  return (
    <motion.div
      variants={item}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
    >
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200",
          isSelected
            ? "border-arcane/30 glow-arcane"
            : "hover:border-border dark:border-white/[0.1]",
        )}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-foreground dark:text-zinc-200 truncate">
                {storyline.title}
              </h3>
              {storyline.arcName && (
                <p className="text-xs text-blue-600 dark:text-arcane-light/70 mt-0.5">
                  {storyline.arcName}
                </p>
              )}
            </div>
            <StatusBadge status={storyline.status} />
          </div>
          {storyline.summary && (
            <p className="text-xs text-muted-foreground dark:text-zinc-400 line-clamp-2 mb-2">
              {storyline.summary}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground dark:text-zinc-500">
            <StatusBadge status={storyline.urgency} type="urgency" />
            {storyline.npcLinks.length > 0 && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {storyline.npcLinks.length}
              </span>
            )}
            {storyline.secretLinks.length > 0 && (
              <span className="flex items-center gap-1">
                <KeyRound className="h-3 w-3" />
                {storyline.secretLinks.length}
              </span>
            )}
            {storyline.events.length > 0 && (
              <span className="flex items-center gap-1">
                <Milestone className="h-3 w-3" />
                {storyline.events.length}
              </span>
            )}
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.slice(0, 3).map((tag, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="text-[10px] h-4 px-1.5"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StorylineDetail({ storyline }: { storyline: StorylineData }) {
  const tags = parseJsonField<string>(storyline.tags);

  return (
    <motion.div
      key={storyline.id}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-heading font-semibold text-foreground dark:text-white">
              {storyline.title}
            </h2>
            {storyline.arcName && (
              <p className="text-sm text-blue-600 dark:text-arcane-light/70 mt-1">
                Arc: {storyline.arcName}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={storyline.status} />
            <StatusBadge status={storyline.urgency} type="urgency" />
          </div>
        </div>
        {storyline.summary && (
          <p className="text-sm text-foreground/80 dark:text-zinc-300 leading-relaxed mt-3 p-4 rounded-lg bg-card hover:bg-muted/50 dark:bg-white/[0.02] border border-border dark:border-white/[0.04]">
            {storyline.summary}
          </p>
        )}
        {/* Notes (Moved to Top) */}
        {storyline.notes && (
          <div className="p-4 rounded-lg bg-card hover:bg-muted/50 dark:bg-white/[0.02] border border-border dark:border-white/[0.04] mt-3">
            <h4 className="text-sm font-medium text-foreground/80 dark:text-zinc-300 mb-2">
              DM Notes
            </h4>
            <p className="text-sm text-muted-foreground dark:text-zinc-400 whitespace-pre-wrap">
              {storyline.notes}
            </p>
          </div>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Next Development */}
      {storyline.nextDevelopment && (
        <div className="p-4 rounded-lg bg-gold/5 border border-gold/20">
          <h4 className="text-sm font-medium text-amber-600 dark:text-gold-light flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4" />
            Next Likely Development
          </h4>
          <p className="text-sm text-foreground/80 dark:text-zinc-300">
            {storyline.nextDevelopment}
          </p>
        </div>
      )}

      {/* Timeline Events */}
      {storyline.events.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-foreground/80 dark:text-zinc-300 mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600 dark:text-arcane" />
            Timeline Events
          </h3>
          <div className="relative pl-6 space-y-4">
            <div className="absolute left-[9px] top-2 bottom-2 w-px bg-arcane/20" />
            {storyline.events.map((event) => (
              <div key={event.id} className="relative">
                <div className="absolute -left-6 top-1.5 w-[7px] h-[7px] rounded-full bg-arcane border-2 border-zinc-900" />
                <div className="p-3 rounded-lg bg-card hover:bg-muted/50 dark:bg-white/[0.02] border border-border dark:border-white/[0.04]">
                  <div className="flex items-center gap-2 mb-1">
                    {event.session && (
                      <span className="text-[10px] text-muted-foreground dark:text-zinc-500">
                        Session #{event.session}
                      </span>
                    )}
                    {event.date && (
                      <span className="text-[10px] text-muted-foreground dark:text-zinc-500">
                        {event.date}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-medium text-foreground dark:text-zinc-200">
                    {event.title}
                  </h4>
                  {event.description && (
                    <p className="text-xs text-muted-foreground dark:text-zinc-400 mt-1">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connected NPCs */}
      {storyline.npcLinks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-foreground/80 dark:text-zinc-300 mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Connected NPCs
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {storyline.npcLinks.map((nl) => (
              <div
                key={nl.npcId}
                className="flex items-center gap-3 p-3 rounded-lg bg-card hover:bg-muted/50 dark:bg-white/[0.02] border border-border dark:border-white/[0.04]"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-400/10 border border-emerald-300 dark:border-emerald-400/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {nl.npc.name.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground dark:text-zinc-200 truncate">
                    {nl.npc.name}
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-zinc-500">
                    {nl.npc.role || nl.npc.race}
                  </p>
                </div>
                <StatusBadge status={nl.npc.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connected Secrets */}
      {storyline.secretLinks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-foreground/80 dark:text-zinc-300 mb-3 flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            Connected Secrets
          </h3>
          <div className="space-y-2">
            {storyline.secretLinks.map((sl) => (
              <div
                key={sl.secretId}
                className="p-3 rounded-lg bg-purple-400/5 border border-purple-400/10"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground dark:text-zinc-200">
                    {sl.secret.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={sl.secret.visibility} />
                    {sl.secret.status !== "active" && <StatusBadge status={sl.secret.status} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connected Sessions */}
      {storyline.sessionLinks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-foreground/80 dark:text-zinc-300 mb-3 flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            Appears in Sessions
          </h3>
          <div className="flex flex-wrap gap-2">
            {storyline.sessionLinks.map((sl) => (
              <Badge key={sl.sessionId} variant="gold" className="text-xs">
                {sl.session.title.toLowerCase().startsWith(`session ${sl.session.sessionNumber}`)
                  ? sl.session.title
                  : `Session #${sl.session.sessionNumber}: ${sl.session.title}`}
              </Badge>
            ))}
          </div>
        </div>
      )}

    </motion.div>
  );
}

export function StorylinesClient({ campaign }: { campaign: CampaignData }) {
  const [selectedStoryline, setSelectedStoryline] =
    useState<StorylineData | null>(campaign.storylines[0] || null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [view, setView] = useState<"cards" | "timeline">("cards");

  const filtered =
    statusFilter === "all"
      ? campaign.storylines
      : campaign.storylines.filter((s) => s.status === statusFilter);

  return (
    <div>
      <PageHeader
        title="Story Timeline"
        subtitle="Track your campaign's evolving narrative"
        icon={<GitBranch className="h-5 w-5 text-blue-600 dark:text-arcane-light" />}
        actions={
          <div className="flex gap-2">
            {["all", "active", "resolved", "dormant"].map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "arcane" : "ghost"}
                size="sm"
                onClick={() => setStatusFilter(s)}
                className="text-xs capitalize"
              >
                {s}
              </Button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Storyline Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="lg:col-span-4 space-y-3"
        >
          {filtered.map((storyline) => (
            <StorylineCard
              key={storyline.id}
              storyline={storyline}
              isSelected={selectedStoryline?.id === storyline.id}
              onClick={() => setSelectedStoryline(storyline)}
            />
          ))}
        </motion.div>

        {/* Storyline Detail */}
        <div className="lg:col-span-8">
          {selectedStoryline ? (
            <Card className="p-6">
              <StorylineDetail storyline={selectedStoryline} />
            </Card>
          ) : (
            <Card className="p-12">
              <div className="text-center text-muted-foreground dark:text-zinc-500">
                <GitBranch className="h-8 w-8 mx-auto mb-3 text-muted-foreground dark:text-zinc-600" />
                <p className="text-sm">Select a storyline to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
