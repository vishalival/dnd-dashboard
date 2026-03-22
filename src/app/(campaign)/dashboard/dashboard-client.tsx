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

  const upcomingSession = [...campaign.sessions]
    .filter((s) => s.status !== "completed")
    .sort((a, b) => b.sessionNumber - a.sessionNumber)[0];

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
  const recentNPCs = [...campaign.npcs]
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
    <div data-tour-page="dashboard">
      {/* Custom Sleek Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 bg-amber-50/60 dark:bg-zinc-950/20 p-6 rounded-2xl border border-amber-200/60 dark:border-white/5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1.5 flex items-center gap-2">
            Hello, {campaign.dmName ? `Dungeon Master ${campaign.dmName}` : "Dungeon Master"}!
            <span className="text-xl">👋</span>
          </h1>
          <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg max-w-2xl">
            <h2 className="text-amber-400 font-bold flex items-center gap-1.5 mb-1 text-sm">
              <Sparkles className="h-4 w-4" /> 
              Fae, Campaign Assistant
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Hey there! I see Session 4 is scheduled for tomorrow at 7:00 PM — I can help you review your prep materials, or we can start by updating Garrick&apos;s missing location tag. Let me know what you&apos;d like to tackle!
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/sessions">
                <Button variant="outline" size="sm" className="h-7 text-[11px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30">
                  <CalendarClock className="h-3 w-3 mr-1.5" />
                  Review Session 4 plan
                </Button>
              </Link>
              <Link href="/npcs">
                <Button variant="outline" size="sm" className="h-7 text-[11px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                  <Users className="h-3 w-3 mr-1.5" />
                  Update Garrick&apos;s location
                </Button>
              </Link>
            </div>
          </div>
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
              className="w-full md:w-64 h-9 pl-9 pr-4 text-xs font-medium rounded-full bg-black/[0.04] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 text-foreground dark:text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all hover:bg-black/[0.06] dark:hover:bg-white/[0.04] cursor-text"
            />
          </div>
          
          {/* Notifications */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="relative h-9 w-9 rounded-full bg-black/[0.04] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.04] transition-colors">
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
                    <p className="text-xs text-muted-foreground mt-1">Tomorrow at 7:00 PM. Don&apos;t forget prep materials!</p>
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
            <span className="text-xs font-bold text-white shadow-sm">
              {(campaign.dmName || "DM").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
            </span>
          </div>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-12 gap-x-8 gap-y-6"
      >
        {/* Next Session & Map Row */}
        <div className="col-span-12 lg:col-span-8">
          {upcomingSession && (
            <motion.div variants={item}>
              <Link href={`/sessions`}>
                <Card className="group hover:border-gold/20 transition-all duration-300 glow-gold cursor-pointer h-full border-border bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <CardTitle className="text-base text-purple-600 dark:text-purple-300">
                          Next Session
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={upcomingSession.status} />
                        {upcomingSession.aiBadge && (
                          <Badge variant="outline" className="text-[10px] px-2 py-0 text-amber-400 border-amber-400/30">
                            <Sparkles className="h-3 w-3 mr-1" />
                            {upcomingSession.aiBadge}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-heading font-bold text-foreground dark:text-white group-hover:text-purple-400 transition-colors">
                          {upcomingSession.title.toLowerCase().startsWith(`session ${upcomingSession.sessionNumber}`)
                            ? upcomingSession.title
                            : `Session ${upcomingSession.sessionNumber}: ${upcomingSession.title}`}
                        </h3>
                        {upcomingSession.date && (
                          <p className="text-sm text-muted-foreground dark:text-zinc-400 mt-1 flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDate(upcomingSession.date)}
                          </p>
                        )}
                      </div>
                      
                      {((upcomingSession.summary && upcomingSession.summary !== "Session summary unavailable.") || upcomingSession.aiSummary) && (
                        <p className="text-sm text-foreground/80 dark:text-zinc-300 line-clamp-3 leading-relaxed">
                          {upcomingSession.summary || upcomingSession.aiSummary}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {upcomingSession.storylineLinks.map((sl) => (
                          <Badge key={sl.storylineId} variant="arcane" className="text-[10px] px-2 py-0">
                            <GitBranch className="h-3 w-3 mr-1" />
                            {sl.storyline.title}
                          </Badge>
                        ))}
                        {upcomingSession.npcLinks.slice(0, 3).map((nl) => (
                          <Badge key={nl.npcId} variant="emerald" className="text-[10px] px-2 py-0">
                            <Users className="h-3 w-3 mr-1" />
                            {nl.npc.name}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center text-xs font-semibold text-purple-500 hover:text-purple-400 transition-colors pt-2">
                        Open Session Plan
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          )}
        </div>

        <div className="col-span-12 lg:col-span-4">
          <motion.div variants={item} className="h-full">
            <Card className="h-full border-white/5 bg-zinc-900/40 relative overflow-hidden group min-h-[280px] max-h-[280px]">
              <div className="absolute top-3 left-3 z-10">
                <Badge variant="secondary" className="bg-black/60 backdrop-blur-md border-white/10 text-white text-[10px] py-0 h-5">
                  World Map
                </Badge>
              </div>
              <InteractiveMap 
                src="/map.jpg" 
                className="w-full h-full border-none rounded-none object-cover" 
                initialScale={0.4}
              />
            </Card>
          </motion.div>
        </div>

        {/* Triple Column Tracking Row */}
        <div className="col-span-12 lg:col-span-4">
          <motion.div variants={item} className="h-full">
            <Card className="h-full border-border bg-card">
              <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-indigo-400" />
                  Active Plots
                </CardTitle>
                <Link href="/storylines">
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] text-muted-foreground hover:text-foreground dark:hover:text-white px-2">
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-2">
                {activeStorylines.slice(0, 4).map((storyline) => (
                  <div key={storyline.id} className="p-3 rounded-xl bg-muted/60 dark:bg-zinc-800/30 border border-border dark:border-white/[0.03] hover:bg-muted dark:hover:border-white/10 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-indigo-400 transition-colors">{storyline.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{storyline.arcName || "Main Story"}</p>
                      </div>
                      <StatusBadge status={storyline.urgency} type="urgency" className="whitespace-nowrap" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <motion.div variants={item} className="h-full">
            <Card className="h-full border-border bg-card">
              <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-purple-400" />
                  Critical Secrets
                </CardTitle>
                <Link href="/secrets">
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] text-muted-foreground hover:text-foreground dark:hover:text-white px-2">
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-2">
                {criticalSecrets.slice(0, 4).map((secret) => (
                  <div key={secret.id} className="p-3 rounded-xl bg-muted/60 dark:bg-zinc-800/30 border border-border dark:border-white/[0.03] hover:bg-muted dark:hover:border-white/10 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-purple-400 transition-colors tracking-tight">{secret.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{secret.owner || "Universal"}</p>
                      </div>
                      <StatusBadge status={secret.urgency} type="urgency" className="whitespace-nowrap" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <motion.div variants={item} className="h-full">
            <Card className="h-full border-border bg-card">
              <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-400" />
                  Active NPCs
                </CardTitle>
                <Link href="/npcs">
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] text-muted-foreground hover:text-foreground dark:hover:text-white px-2">
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-2 flex-1 flex flex-col">
                <div className="space-y-2 flex-1">
                  {(pinnedNPCs.length > 0 ? pinnedNPCs : recentNPCs).slice(0, 6).map((npc) => (
                    <div key={npc.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/60 dark:bg-zinc-800/30 border border-border dark:border-white/[0.03] hover:bg-muted dark:hover:border-white/10 transition-all cursor-pointer group">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-emerald-400">{npc.name.charAt(0)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-emerald-400 transition-colors">{npc.name}</p>
                        <p className="text-[10px] text-muted-foreground">{npc.role || npc.race}</p>
                      </div>
                      <StatusBadge status={npc.status} className="whitespace-nowrap" />
                    </div>
                  ))}
                </div>

                {/* Visual filler / NPC context summary if list is short */}
                {(pinnedNPCs.length > 0 ? pinnedNPCs : recentNPCs).length < 4 && (
                  <div className="mt-4 p-3 rounded-xl border border-dashed border-border dark:border-white/5 bg-muted/30 dark:bg-white/[0.01]">
                    <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                      &quot;The shadows of the past cling to the residents of this world. Every face hides a secret, and every ally carries a price.&quot;
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Row - Journals & Quick Actions */}
        <div className="col-span-12 lg:col-span-8">
          <motion.div variants={item} className="h-full">
            <Card className="h-full border-border bg-card">
              <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-rose-400" />
                  Recent Journal Entries
                </CardTitle>
                <Link href="/journal">
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] text-muted-foreground hover:text-foreground dark:hover:text-white px-2">
                    Full Journal <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentJournals.map((entry) => (
                    <Link key={entry.id} href="/journal">
                      <div className="p-4 rounded-xl bg-muted/60 dark:bg-zinc-800/20 border border-border dark:border-white/[0.03] hover:bg-muted dark:hover:border-white/10 transition-all cursor-pointer group h-full">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-semibold capitalize tracking-wide">
                            {entry.type.replace(/_/g, " ")}
                          </span>
                          {entry.isPinned && <Pin className="h-3 w-3 text-amber-500" />}
                        </div>
                        <h4 className="text-sm font-bold text-foreground mb-2 group-hover:text-rose-400 transition-colors truncate">
                          {entry.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                          {entry.content}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 font-medium">
                          {formatDate(entry.createdAt)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <motion.div variants={item}>
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  Party Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {partyGoals.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span className="text-foreground truncate">{goal.title}</span>
                      <span className="text-muted-foreground">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-1 bg-white/5" indicatorClassName="bg-amber-500/80" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item} className="flex-1">
            <Card className="h-full border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  Quick Navigation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {[
                  { label: "Session Plans", href: "/sessions", icon: CalendarClock, color: "text-amber-500" },
                  { label: "Story Timeline", href: "/storylines", icon: GitBranch, color: "text-indigo-400" },
                  { label: "NPC Registry", href: "/npcs", icon: Users, color: "text-emerald-400" },
                  { label: "Secrets Vault", href: "/secrets", icon: KeyRound, color: "text-purple-400" },
                  { label: "Campaign Journal", href: "/journal", icon: BookOpen, color: "text-rose-400" },
                ].map((link) => (
                  <Link key={link.href} href={link.href}>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/60 dark:hover:bg-white/[0.04] transition-colors group">
                      <link.icon className={`h-4 w-4 ${link.color}`} />
                      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors flex-1">{link.label}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground/50 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
