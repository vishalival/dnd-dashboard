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
  Search,
  Bell,
  MoreVertical,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { formatDate, formatRelativeDate, parseJsonField } from "@/lib/utils";
import { InteractiveMap } from "@/components/shared/interactive-map";
import { useCampaignStore } from "@/stores/campaign-store";
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
  const toggleCommandPalette = useCampaignStore((state) => state.toggleCommandPalette);

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
      {/* Custom Sleek Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-zinc-950/20 p-6 rounded-2xl border border-white/5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1.5 flex items-center gap-2">
            Hello, Dungeon Master Rachel! 
            <span className="text-xl">👋</span>
          </h1>
          <p className="text-xs text-zinc-400 max-w-lg">
            Manage your campaign flow, track critical storylines, and prepare for your next epic adventure.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
            <input
              type="text"
              readOnly
              onClick={toggleCommandPalette}
              placeholder="Search Anything... (Cmd+K)"
              className="w-full md:w-64 h-9 pl-9 pr-4 text-xs font-medium rounded-full bg-white/[0.02] border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all hover:bg-white/[0.04] cursor-text"
            />
          </div>
          
          {/* Notifications */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="relative h-9 w-9 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors">
                <Bell className="h-4 w-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border border-zinc-950" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Notifications</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 dark:bg-white/[0.02] border border-border dark:border-white/[0.04]">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                    <span className="text-blue-500">✨</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Session 4 Scheduled</h4>
                    <p className="text-xs text-muted-foreground mt-1">Tomorrow at 7:00 PM. Don't forget prep materials!</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 dark:bg-white/[0.02] border border-border dark:border-white/[0.04]">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                    <span className="text-amber-500">⚠️</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">NPC missing location</h4>
                    <p className="text-xs text-muted-foreground mt-1">Garrick is missing a primary location tag.</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* User Avatar */}
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center border border-white/10 shrink-0 cursor-pointer shadow-lg shadow-amber-900/20">
            <span className="text-xs font-bold text-white shadow-sm">DR</span>
          </div>
        </div>
      </div>

      <motion.div variants={item} className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            World Map
            <Badge variant="secondary" className="bg-white/5 border-white/10 text-zinc-400 text-[10px] py-0 h-5">
              Interactive
            </Badge>
          </h2>
        </div>
        <InteractiveMap 
          src="/map.jpg" 
          className="w-full aspect-[16/9] lg:aspect-[21/9]" 
        />
      </motion.div>

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
                        {upcomingSession.title.toLowerCase().startsWith(`session ${upcomingSession.sessionNumber}`)
                          ? upcomingSession.title
                          : `Session ${upcomingSession.sessionNumber}: ${upcomingSession.title}`}
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
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-semibold capitalize tracking-wide">
                          {entry.type.replace(/_/g, " ")}
                        </span>
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
