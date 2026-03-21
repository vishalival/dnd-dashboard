"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CalendarClock,
  GitBranch,
  Users,
  KeyRound,
  BookOpen,
  Sparkles,
  Clock,
  AlertTriangle,
  Eye,
  Pin,
  ArrowRight,
  Scroll,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { formatDate, formatRelativeDate, parseJsonField } from "@/lib/utils";
import type { CampaignData } from "@/lib/data";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export function DashboardClient({ campaign }: { campaign: CampaignData }) {
  const upcomingSession = campaign.sessions
    .filter((s) => s.status !== "completed")
    .sort((a, b) => a.sessionNumber - b.sessionNumber)[0];

  const activeStorylines = campaign.storylines.filter(
    (s) => s.status === "active",
  );
  const unresolvedSecrets = campaign.secrets.filter(
    (s) => s.status === "active" && s.visibility === "dm_only",
  );
  const criticalSecrets = campaign.secrets.filter(
    (s) => s.urgency === "critical" || s.urgency === "high",
  );
  const pinnedNPCs = campaign.npcs.filter((n) => n.isPinned);
  const recentNPCs = campaign.npcs
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 5);
  const partyGoals = campaign.secrets.filter((s) => s.type === "party_goal");
  const recentJournals = campaign.journals.slice(0, 4);
  const completedSessions = campaign.sessions.filter(
    (s) => s.status === "completed",
  ).length;

  return (
    <div>
      <PageHeader
        title={campaign.name}
        subtitle={
          campaign.currentArc
            ? `Current Arc: ${campaign.currentArc}`
            : "Campaign Command Center"
        }
        icon={<LayoutDashboard className="h-5 w-5 text-amber-600 dark:text-gold" />}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="gold" className="font-heading">
              {campaign.sessions.length} Sessions
            </Badge>
            <Badge variant="arcane" className="font-heading">
              {campaign.npcs.length} NPCs
            </Badge>
          </div>
        }
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Upcoming Session - Full width top */}
        {upcomingSession && (
          <motion.div variants={item} className="lg:col-span-2">
            <Link href={`/sessions`}>
              <Card className="group hover:border-gold/20 transition-all duration-300 glow-gold cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <CardTitle className="text-base text-purple-600 dark:text-purple-300">
                        Next Session
                      </CardTitle>
                    </div>
                    <StatusBadge status={upcomingSession.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-heading font-semibold text-foreground dark:text-white">
                        Session {upcomingSession.sessionNumber}:{" "}
                        {upcomingSession.title}
                      </h3>
                      {upcomingSession.date && (
                        <p className="text-sm text-muted-foreground dark:text-zinc-400 mt-1">
                          <Clock className="inline h-3 w-3 mr-1" />
                          {formatRelativeDate(upcomingSession.date)} —{" "}
                          {formatDate(upcomingSession.date)}
                        </p>
                      )}
                    </div>
                    {upcomingSession.summary && (
                      <p className="text-sm text-foreground/80 dark:text-zinc-300 line-clamp-2">
                        {upcomingSession.summary}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {upcomingSession.storylineLinks.map((sl) => (
                        <Badge
                          key={sl.storylineId}
                          variant="arcane"
                          className="text-xs"
                        >
                          <GitBranch className="h-3 w-3 mr-1" />
                          {sl.storyline.title}
                        </Badge>
                      ))}
                      {upcomingSession.npcLinks.slice(0, 4).map((nl) => (
                        <Badge
                          key={nl.npcId}
                          variant="emerald"
                          className="text-xs"
                        >
                          <Users className="h-3 w-3 mr-1" />
                          {nl.npc.name}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center text-xs text-purple-600 dark:text-purple-400 group-hover:text-purple-500 dark:group-hover:text-purple-300 transition-colors pt-1">
                      Open Session Plan
                      <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        )}

        {/* Campaign Stats */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground/80 dark:text-zinc-300 flex items-center gap-2">
                <Scroll className="h-4 w-4 text-blue-600 dark:text-arcane" />
                Campaign Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground dark:text-zinc-400">
                    Sessions Completed
                  </span>
                  <span className="text-foreground dark:text-white font-medium">
                    {completedSessions}/{campaign.sessions.length}
                  </span>
                </div>
                <Progress
                  value={
                    (completedSessions /
                      Math.max(campaign.sessions.length, 1)) *
                    100
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-card hover:bg-muted/60 dark:bg-white/[0.03] border border-border dark:border-white/[0.04]">
                  <div className="text-2xl font-heading font-bold text-blue-600 dark:text-arcane-light">
                    {activeStorylines.length}
                  </div>
                  <div className="text-xs text-muted-foreground dark:text-zinc-500">
                    Active Plots
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-card hover:bg-muted/60 dark:bg-white/[0.03] border border-border dark:border-white/[0.04]">
                  <div className="text-2xl font-heading font-bold text-purple-600 dark:text-purple-400">
                    {unresolvedSecrets.length}
                  </div>
                  <div className="text-xs text-muted-foreground dark:text-zinc-500">
                    Hidden Secrets
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-card hover:bg-muted/60 dark:bg-white/[0.03] border border-border dark:border-white/[0.04]">
                  <div className="text-2xl font-heading font-bold text-emerald-600 dark:text-emerald-400">
                    {campaign.npcs.length}
                  </div>
                  <div className="text-xs text-muted-foreground dark:text-zinc-500">
                    NPCs
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-card hover:bg-muted/60 dark:bg-white/[0.03] border border-border dark:border-white/[0.04]">
                  <div className="text-2xl font-heading font-bold text-amber-600 dark:text-amber-400">
                    {campaign.characters.length}
                  </div>
                  <div className="text-xs text-muted-foreground dark:text-zinc-500">
                    Party Members
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Plot Threads */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-foreground/80 dark:text-zinc-300 flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-blue-600 dark:text-arcane" />
                  Active Plot Threads
                </CardTitle>
                <Link href="/storylines">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground dark:text-zinc-500 hover:text-foreground/80 dark:text-zinc-300 h-7"
                  >
                    View All <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeStorylines.slice(0, 5).map((storyline) => (
                  <Dialog key={storyline.id}>
                    <DialogTrigger asChild>
                      <div className="p-2.5 rounded-lg hover:bg-card hover:bg-muted/60 dark:bg-white/[0.03] transition-colors cursor-pointer group hover:border text-left">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground dark:text-zinc-200 truncate group-hover:text-foreground dark:text-white transition-colors">
                              {storyline.title}
                            </p>
                            {storyline.arcName && (
                              <p className="text-xs text-muted-foreground dark:text-zinc-500 mt-0.5">
                                {storyline.arcName}
                              </p>
                            )}
                            {storyline.summary && (
                              <p className="text-xs text-muted-foreground dark:text-zinc-400 mt-1 line-clamp-1">
                                {storyline.summary}
                              </p>
                            )}
                          </div>
                          <StatusBadge
                            status={storyline.urgency}
                            type="urgency"
                            className="shrink-0"
                          />
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{storyline.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="flex gap-2">
                          <StatusBadge status={storyline.urgency} type="urgency" />
                          <StatusBadge status={storyline.status} />
                          {storyline.arcName && (
                            <Badge variant="outline">{storyline.arcName}</Badge>
                          )}
                        </div>
                        {storyline.summary && (
                          <div className="text-sm text-foreground/80 dark:text-zinc-300">
                            {storyline.summary}
                          </div>
                        )}
                        <Link href="/storylines">
                          <Button variant="outline" className="w-full mt-4">
                            Open Storylines Dashboard
                          </Button>
                        </Link>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* High-Priority Secrets */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-foreground/80 dark:text-zinc-300 flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  Critical Secrets
                </CardTitle>
                <Link href="/secrets">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground dark:text-zinc-500 hover:text-foreground/80 dark:text-zinc-300 h-7"
                  >
                    View All <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {criticalSecrets.slice(0, 5).map((secret) => (
                  <Dialog key={secret.id}>
                    <DialogTrigger asChild>
                      <div className="p-2.5 rounded-lg bg-card hover:bg-muted/50 dark:bg-white/[0.02] border border-border dark:border-white/[0.04] cursor-pointer text-left">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              {secret.visibility === "dm_only" && (
                                <Eye className="h-3 w-3 text-purple-600 dark:text-purple-400 shrink-0" />
                              )}
                              <p className="text-sm font-medium text-foreground dark:text-zinc-200 truncate">
                                {secret.title}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground dark:text-zinc-500 mt-0.5">
                              {secret.owner || secret.type.replace(/_/g, " ")}
                            </p>
                            {secret.description && (
                              <p className="text-xs text-muted-foreground dark:text-zinc-400 mt-1 line-clamp-1">
                                {secret.description}
                              </p>
                            )}
                          </div>
                          <StatusBadge status={secret.urgency} type="urgency" className="shrink-0" />
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          {secret.visibility === "dm_only" && (
                            <Eye className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
                          )}
                          {secret.title}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="flex gap-2">
                          <StatusBadge status={secret.urgency} type="urgency" />
                          <StatusBadge status={secret.status} />
                          <Badge variant="outline">{secret.owner || secret.type.replace(/_/g, " ")}</Badge>
                        </div>
                        {secret.description && (
                          <div className="text-sm text-foreground/80 dark:text-zinc-300">
                            {secret.description}
                          </div>
                        )}
                        <Link href="/secrets">
                          <Button variant="outline" className="w-full mt-4">
                            Open Secrets Vault
                          </Button>
                        </Link>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
                {criticalSecrets.length === 0 && (
                  <p className="text-sm text-muted-foreground dark:text-zinc-500 text-center py-4">
                    No critical secrets
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recently Active NPCs */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-foreground/80 dark:text-zinc-300 flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Active NPCs
                </CardTitle>
                <Link href="/npcs">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground dark:text-zinc-500 hover:text-foreground/80 dark:text-zinc-300 h-7"
                  >
                    View All <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(pinnedNPCs.length > 0 ? pinnedNPCs : recentNPCs)
                  .slice(0, 5)
                  .map((npc) => (
                    <Dialog key={npc.id}>
                      <DialogTrigger asChild>
                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-card hover:bg-muted/60 dark:bg-white/[0.03] transition-colors cursor-pointer text-left hover:border">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400/20 to-emerald-400/5 border border-emerald-300 dark:border-emerald-400/20 flex items-center justify-center shrink-0">
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              {npc.name.charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground dark:text-zinc-200 truncate">
                                {npc.name}
                              </p>
                              {npc.isPinned && (
                                <Pin className="h-3 w-3 text-amber-600 dark:text-gold shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground dark:text-zinc-500">
                              {npc.role || npc.race}
                              {npc.faction ? ` · ${npc.faction}` : ""}
                            </p>
                            {(npc.dmNotes || npc.goals) && (
                              <p className="text-xs text-muted-foreground dark:text-zinc-400 mt-1 line-clamp-1">
                                {npc.dmNotes || npc.goals}
                              </p>
                            )}
                          </div>
                          <StatusBadge status={npc.status} />
                        </div>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {npc.name}
                            {npc.isPinned && <Pin className="h-4 w-4 text-amber-600 dark:text-gold" />}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="flex gap-2">
                            <StatusBadge status={npc.status} />
                            <Badge variant="outline">{npc.role || npc.race}</Badge>
                            {npc.faction && <Badge variant="arcane">{npc.faction}</Badge>}
                          </div>
                          {(npc.dmNotes || npc.goals) && (
                            <div className="text-sm text-foreground/80 dark:text-zinc-300">
                              <strong>Notes:</strong> {npc.dmNotes || npc.goals}
                            </div>
                          )}
                          <Link href="/npcs">
                            <Button variant="outline" className="w-full mt-4">
                              Open NPC Registry
                            </Button>
                          </Link>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Party Goals */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground/80 dark:text-zinc-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                Party Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {partyGoals.slice(0, 5).map((goal) => (
                  <div
                    key={goal.id}
                    className="p-2.5 rounded-lg bg-card hover:bg-muted/50 dark:bg-white/[0.02] border border-border dark:border-white/[0.04]"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <p className="text-sm font-medium text-foreground dark:text-zinc-200 truncate">
                        {goal.title}
                      </p>
                      <span className="text-xs text-muted-foreground dark:text-zinc-500 shrink-0">
                        {goal.progress}%
                      </span>
                    </div>
                    <Progress value={goal.progress} className="h-1.5" />
                  </div>
                ))}
                {partyGoals.length === 0 && (
                  <p className="text-sm text-muted-foreground dark:text-zinc-500 text-center py-4">
                    No party goals set
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Journal Entries */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-foreground/80 dark:text-zinc-300 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-red-600 dark:text-crimson-light" />
                  Recent Journal Entries
                </CardTitle>
                <Link href="/journal">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground dark:text-zinc-500 hover:text-foreground/80 dark:text-zinc-300 h-7"
                  >
                    View All <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recentJournals.map((entry) => (
                  <Link key={entry.id} href="/journal">
                    <div className="p-3 rounded-lg bg-card hover:bg-muted/50 dark:bg-white/[0.02] border border-border dark:border-white/[0.04] hover:bg-muted dark:bg-white/[0.04] transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-[10px] h-5">
                          {entry.type.replace(/_/g, " ")}
                        </Badge>
                        {entry.isPinned && (
                          <Pin className="h-3 w-3 text-amber-600 dark:text-gold" />
                        )}
                      </div>
                      <h4 className="text-sm font-medium text-foreground dark:text-zinc-200 line-clamp-1">
                        {entry.title}
                      </h4>
                      <p className="text-xs text-muted-foreground dark:text-zinc-500 mt-1 line-clamp-2">
                        {entry.content}
                      </p>
                      <p className="text-[10px] text-muted-foreground dark:text-zinc-600 mt-2">
                        {formatDate(entry.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Links */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground/80 dark:text-zinc-300 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                Quick Navigation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {[
                  {
                    label: "Session Plans",
                    href: "/sessions",
                    icon: CalendarClock,
                    color: "text-amber-600 dark:text-amber-400",
                  },
                  {
                    label: "Story Timeline",
                    href: "/storylines",
                    icon: GitBranch,
                    color: "text-blue-600 dark:text-arcane-light",
                  },
                  {
                    label: "NPC Registry",
                    href: "/npcs",
                    icon: Users,
                    color: "text-emerald-600 dark:text-emerald-400",
                  },
                  {
                    label: "Secrets Vault",
                    href: "/secrets",
                    icon: KeyRound,
                    color: "text-purple-600 dark:text-purple-400",
                  },
                  {
                    label: "Campaign Journal",
                    href: "/journal",
                    icon: BookOpen,
                    color: "text-red-600 dark:text-crimson-light",
                  },
                  {
                    label: "Magic Items",
                    href: "/wishlists",
                    icon: Sparkles,
                    color: "text-amber-600 dark:text-amber-300",
                  },
                ].map((link) => (
                  <Link key={link.href} href={link.href}>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted dark:bg-white/[0.04] transition-colors cursor-pointer group">
                      <link.icon className={`h-4 w-4 ${link.color}`} />
                      <span className="text-sm text-muted-foreground dark:text-zinc-400 group-hover:text-foreground dark:text-zinc-200 transition-colors flex-1">
                        {link.label}
                      </span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground dark:text-zinc-600 group-hover:text-muted-foreground dark:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
