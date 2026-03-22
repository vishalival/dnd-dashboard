"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Pin,
  Eye,
  EyeOff,
  MapPin,
  Swords,
  GitBranch,
  KeyRound,
  CalendarClock,
  Heart,
  Skull,
  HelpCircle,
  Shield,
  MessageSquare,
  FileText,
  X,
  Network,
  List,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { NPCWeb } from "@/components/shared/npc-web";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { CampaignData, NPCData } from "@/lib/data";

const dispositionIcons: Record<string, React.ReactNode> = {
  friendly: <Heart className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />,
  neutral: (
    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground dark:text-zinc-400" />
  ),
  hostile: <Skull className="h-3.5 w-3.5 text-red-400" />,
  unknown: (
    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground dark:text-zinc-500" />
  ),
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

function NPCDetail({ npc, onClose }: { npc: NPCData; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-400/5 border border-emerald-300 dark:border-emerald-400/20 flex items-center justify-center shrink-0">
            <span className="text-xl font-heading font-bold text-emerald-600 dark:text-emerald-400">
              {npc.name.charAt(0)}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-heading font-semibold text-foreground dark:text-white">
                {npc.name}
              </h2>
              {npc.isPinned && <Pin className="h-4 w-4 text-amber-600 dark:text-gold" />}
              {!npc.isPlayerKnown && (
                <Badge variant="purple" className="text-[10px]">
                  <EyeOff className="h-3 w-3 mr-1" />
                  DM Only
                </Badge>
              )}
            </div>
            <div className="flex flex-col gap-1 mt-3 text-sm text-muted-foreground dark:text-zinc-400 bg-muted/30 dark:bg-white/[0.01] p-3 rounded-lg border border-border dark:border-white/[0.04]">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="font-medium text-foreground/80 dark:text-zinc-300">Race/Species:</span> {npc.race || "—"}</div>
                <div><span className="font-medium text-foreground/80 dark:text-zinc-300">Class:</span> {npc.role || "—"}</div>
                <div><span className="font-medium text-foreground/80 dark:text-zinc-300">Age:</span> —</div>
              </div>
              <div className="mt-2 text-xs">
                 <span className="font-medium text-foreground/80 dark:text-zinc-300">Physical Appearance:</span> —
              </div>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-muted-foreground dark:text-zinc-500 hover:text-foreground/80 dark:text-zinc-300 lg:hidden"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Status Row */}
      <div className="flex flex-wrap gap-2">
        <StatusBadge status={npc.status} />
        {npc.disposition.toLowerCase() !== npc.status.toLowerCase() && (
          <Badge variant="outline" className="text-xs gap-1">
            {dispositionIcons[npc.disposition]}
            {npc.disposition}
          </Badge>
        )}
        {npc.faction && (
          <Badge variant="gold" className="text-xs gap-1">
            <Shield className="h-3 w-3" />
            {npc.faction}
          </Badge>
        )}
        {npc.location && (
          <Badge variant="outline" className="text-xs gap-1">
            <MapPin className="h-3 w-3" />
            {npc.location}
          </Badge>
        )}
      </div>

      {/* Appearances */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-card hover:bg-muted/50 dark:bg-white/[0.02] border border-border dark:border-white/[0.04]">
          <p className="text-[10px] text-muted-foreground dark:text-zinc-500 uppercase tracking-wider">
            First Appearance
          </p>
          <p className="text-sm text-foreground/80 dark:text-zinc-300 font-medium mt-0.5">
            {npc.firstAppearance ? `Session #${npc.firstAppearance}` : "—"}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-card hover:bg-muted/50 dark:bg-white/[0.02] border border-border dark:border-white/[0.04]">
          <p className="text-[10px] text-muted-foreground dark:text-zinc-500 uppercase tracking-wider">
            Latest Appearance
          </p>
          <p className="text-sm text-foreground/80 dark:text-zinc-300 font-medium mt-0.5">
            {npc.lastAppearance ? `Session #${npc.lastAppearance}` : "—"}
          </p>
        </div>
      </div>

      {/* Goals */}
      {npc.goals && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground dark:text-zinc-400 uppercase tracking-wider mb-2">
            Goals
          </h4>
          <p className="text-sm text-foreground/80 dark:text-zinc-300 p-3 rounded-lg bg-card hover:bg-muted/50 dark:bg-white/[0.02] border border-border dark:border-white/[0.04]">
            {npc.goals}
          </p>
          <div className="grid grid-cols-2 gap-3 mt-3">
             <div>
               <h5 className="text-[10px] font-medium text-muted-foreground dark:text-zinc-500 uppercase tracking-wider mb-1">Leverages</h5>
               <p className="text-sm text-foreground/80 dark:text-zinc-300 p-2.5 rounded-lg bg-card border border-border dark:border-white/[0.02]">
                 Unknown
               </p>
             </div>
             <div>
               <h5 className="text-[10px] font-medium text-muted-foreground dark:text-zinc-500 uppercase tracking-wider mb-1">Weaknesses</h5>
               <p className="text-sm text-foreground/80 dark:text-zinc-300 p-2.5 rounded-lg bg-card border border-border dark:border-white/[0.02]">
                 Unknown
               </p>
             </div>
          </div>
        </div>
      )}

      {/* Secrets */}
      {npc.secrets && (
        <div>
          <h4 className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <EyeOff className="h-3 w-3" /> Secrets
          </h4>
          <p className="text-sm text-foreground/80 dark:text-zinc-300 p-3 rounded-lg bg-purple-400/5 border border-purple-400/10">
            {npc.secrets}
          </p>
        </div>
      )}

      {/* Voice/Personality */}
      {npc.voiceNotes && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <MessageSquare className="h-3 w-3" /> Voice & Personality
          </h4>
          <p className="text-sm text-foreground/80 dark:text-zinc-300 p-3 rounded-lg bg-card hover:bg-muted/50 dark:bg-white/[0.02] border border-border dark:border-white/[0.04] italic">
            {npc.voiceNotes}
          </p>
        </div>
      )}

      {/* Story Relevance */}
      {npc.storyRelevance && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground dark:text-zinc-400 uppercase tracking-wider mb-2">
            Story Relevance
          </h4>
          <p className="text-sm text-foreground/80 dark:text-zinc-300 p-3 rounded-lg bg-card hover:bg-muted/50 dark:bg-white/[0.02] border border-border dark:border-white/[0.04]">
            {npc.storyRelevance}
          </p>
        </div>
      )}

      {/* Connected Storylines */}
      {npc.storylineLinks.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <GitBranch className="h-3 w-3 text-blue-600 dark:text-arcane" /> Storylines
          </h4>
          <div className="flex flex-wrap gap-2">
            {npc.storylineLinks.map((sl) => (
              <Badge key={sl.storylineId} variant="arcane" className="text-xs">
                {sl.storyline.title}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Connected Secrets */}
      {npc.secretLinks.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <KeyRound className="h-3 w-3 text-purple-600 dark:text-purple-400" /> Connected Secrets
          </h4>
          <div className="space-y-2">
            {npc.secretLinks.map((sl) => (
              <div
                key={sl.secretId}
                className="p-2.5 rounded-lg bg-purple-400/5 border border-purple-400/10 flex items-center justify-between"
              >
                <span className="text-sm text-foreground/80 dark:text-zinc-300">
                  {sl.secret.title}
                </span>
                <StatusBadge status={sl.secret.visibility} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sessions */}
      {npc.sessionLinks.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <CalendarClock className="h-3 w-3 text-amber-600 dark:text-amber-400" /> Session Appearances
          </h4>
          <div className="flex flex-wrap gap-2">
            {npc.sessionLinks.map((sl) => (
              <Badge key={sl.sessionId} variant="gold" className="text-xs">
                {sl.session.title.toLowerCase().startsWith(`session ${sl.session.sessionNumber}`)
                  ? sl.session.title
                  : `Session #${sl.session.sessionNumber}: ${sl.session.title}`}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* DM Notes */}
      {npc.dmNotes && (
        <div>
          <h4 className="text-xs font-medium text-red-600 dark:text-crimson-light uppercase tracking-wider mb-2 flex items-center gap-1">
            <FileText className="h-3 w-3" /> DM Notes
          </h4>
          <p className="text-sm text-muted-foreground dark:text-zinc-400 p-3 rounded-lg bg-crimson/5 border border-crimson/10 whitespace-pre-wrap">
            {npc.dmNotes}
          </p>
        </div>
      )}
    </motion.div>
  );
}

interface NewNPCForm {
  name: string;
  race: string;
  role: string;
  faction: string;
  disposition: string;
  status: string;
  location: string;
  goals: string;
  dmNotes: string;
  isPlayerKnown: boolean;
}

const emptyForm = (): NewNPCForm => ({
  name: "", race: "", role: "", faction: "", disposition: "neutral",
  status: "alive", location: "", goals: "", dmNotes: "", isPlayerKnown: true,
});

export function NPCsClient({ campaign }: { campaign: CampaignData }) {
  const [npcs, setNpcs] = useState<NPCData[]>(campaign.npcs);
  const [selectedNPC, setSelectedNPC] = useState<NPCData | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [factionFilter, setFactionFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "web">("list");
  const [newNPCOpen, setNewNPCOpen] = useState(false);
  const [form, setForm] = useState<NewNPCForm>(emptyForm());
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateNPC = async () => {
    if (!form.name.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/npcs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: campaign.id, ...form }),
      });
      if (!res.ok) throw new Error("Failed to create NPC");
      const newNPC = await res.json();
      setNpcs((prev) => [...prev, newNPC]);
      setSelectedNPC(newNPC);
      setForm(emptyForm());
      setNewNPCOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const factions = useMemo(() => {
    const set = new Set<string>();
    npcs.forEach((n) => {
      if (n.faction) set.add(n.faction);
    });
    return Array.from(set).sort();
  }, [npcs]);

  const filtered = useMemo(() => {
    return npcs.filter((npc) => {
      if (
        search &&
        !npc.name.toLowerCase().includes(search.toLowerCase()) &&
        !(npc.role || "").toLowerCase().includes(search.toLowerCase()) &&
        !(npc.race || "").toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      if (statusFilter !== "all" && npc.status !== statusFilter) return false;
      if (factionFilter !== "all" && npc.faction !== factionFilter)
        return false;
      return true;
    });
  }, [npcs, search, statusFilter, factionFilter]);

  return (
    <div>
      {/* New NPC Dialog */}
      <Dialog open={newNPCOpen} onOpenChange={setNewNPCOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Add NPC</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2">
              <label className="text-xs text-zinc-400 mb-1 block">Name *</label>
              <Input placeholder="Character name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} autoFocus />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Race / Species</label>
              <Input placeholder="e.g. Human, Elf" value={form.race} onChange={(e) => setForm((f) => ({ ...f, race: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Role / Class</label>
              <Input placeholder="e.g. Merchant, Guard" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Faction</label>
              <Input placeholder="e.g. The Guild" value={form.faction} onChange={(e) => setForm((f) => ({ ...f, faction: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Location</label>
              <Input placeholder="e.g. Waterdeep" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Disposition</label>
              <select value={form.disposition} onChange={(e) => setForm((f) => ({ ...f, disposition: e.target.value }))} className="w-full text-sm bg-[#141416] border border-white/[0.08] rounded-md px-3 py-2 text-zinc-300 focus:outline-none">
                <option value="friendly">Friendly</option>
                <option value="neutral">Neutral</option>
                <option value="hostile">Hostile</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Status</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full text-sm bg-[#141416] border border-white/[0.08] rounded-md px-3 py-2 text-zinc-300 focus:outline-none">
                <option value="alive">Alive</option>
                <option value="dead">Dead</option>
                <option value="missing">Missing</option>
                <option value="hostile">Hostile</option>
                <option value="ally">Ally</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-zinc-400 mb-1 block">Goals</label>
              <Input placeholder="What does this character want?" value={form.goals} onChange={(e) => setForm((f) => ({ ...f, goals: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-zinc-400 mb-1 block">DM Notes</label>
              <Input placeholder="Private notes (DM only)" value={form.dmNotes} onChange={(e) => setForm((f) => ({ ...f, dmNotes: e.target.value }))} />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" id="isPlayerKnown" checked={form.isPlayerKnown} onChange={(e) => setForm((f) => ({ ...f, isPlayerKnown: e.target.checked }))} className="accent-emerald-500" />
              <label htmlFor="isPlayerKnown" className="text-xs text-zinc-400">Players know this NPC exists</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => { setNewNPCOpen(false); setForm(emptyForm()); }}>Cancel</Button>
            <Button variant="gold" size="sm" onClick={handleCreateNPC} disabled={!form.name.trim() || isCreating}>
              {isCreating ? "Adding…" : "Add NPC"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex items-center justify-between mb-2">
        <PageHeader
          title="NPC Tracker"
          subtitle={`${npcs.length} characters in your world`}
          icon={<Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
        />
        <div className="flex items-center gap-2">
        <Button variant="gold" size="sm" onClick={() => setNewNPCOpen(true)} className="gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />Add NPC
        </Button>
        <div className="flex gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <Button
            variant={viewMode === "list" ? "gold" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="text-xs gap-1.5"
          >
            <List className="h-3.5 w-3.5" />
            List
          </Button>
          <Button
            variant={viewMode === "web" ? "gold" : "ghost"}
            size="sm"
            onClick={() => setViewMode("web")}
            className="text-xs gap-1.5"
          >
            <Network className="h-3.5 w-3.5" />
            Web
          </Button>
        </div>
        </div>
      </div>

      {viewMode === "web" ? (
        <NPCWeb campaign={campaign} />
      ) : (
        <>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-zinc-500" />
          <Input
            placeholder="Search NPCs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card hover:bg-muted/60 dark:bg-white/[0.03] border-border dark:border-white/[0.06]"
          />
        </div>
        <div className="flex gap-1.5">
          {["all", "alive", "dead", "missing", "hostile", "ally"].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "gold" : "ghost"}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className="text-xs capitalize"
            >
              {s}
            </Button>
          ))}
        </div>
        {factions.length > 0 && (
          <div className="flex gap-1.5">
            <Button
              variant={factionFilter === "all" ? "arcane" : "ghost"}
              size="sm"
              onClick={() => setFactionFilter("all")}
              className="text-xs"
            >
              All Factions
            </Button>
            {factions.map((f) => (
              <Button
                key={f}
                variant={factionFilter === f ? "arcane" : "ghost"}
                size="sm"
                onClick={() => setFactionFilter(f)}
                className="text-xs"
              >
                {f}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* NPC Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className={cn(
            "grid gap-3",
            selectedNPC
              ? "lg:col-span-5 grid-cols-1"
              : "lg:col-span-12 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
          )}
        >
          {filtered.map((npc) => (
            <motion.div key={npc.id} variants={item} whileHover={{ y: -2 }}>
              <Card
                className={cn(
                  "cursor-pointer transition-all duration-200",
                  selectedNPC?.id === npc.id
                    ? "border-emerald-300 dark:border-emerald-400/30 glow-arcane"
                    : "hover:border-border dark:border-white/[0.1]",
                )}
                onClick={() => setSelectedNPC(npc)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400/20 to-emerald-400/5 border border-emerald-300 dark:border-emerald-400/20 flex items-center justify-center shrink-0">
                      <span className="text-sm font-heading font-bold text-emerald-600 dark:text-emerald-400">
                        {npc.name.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-foreground dark:text-zinc-200 truncate">
                          {npc.name}
                        </h3>
                        {npc.isPinned && (
                          <Pin className="h-3 w-3 text-amber-600 dark:text-gold shrink-0" />
                        )}
                        {!npc.isPlayerKnown && (
                          <EyeOff className="h-3 w-3 text-purple-600 dark:text-purple-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground dark:text-zinc-500 mt-0.5">
                        {[npc.race, npc.role].filter(Boolean).join(" · ")}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <StatusBadge status={npc.status} />
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground dark:text-zinc-500">
                          {dispositionIcons[npc.disposition]}
                        </span>
                        {npc.faction && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-4 px-1.5"
                          >
                            {npc.faction}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedNPC && (
            <div className="lg:col-span-7">
              <Card className="p-6 sticky top-6">
                <NPCDetail
                  npc={selectedNPC}
                  onClose={() => setSelectedNPC(null)}
                />
              </Card>
            </div>
          )}
        </AnimatePresence>
      </div>
      </>
      )}
    </div>
  );
}
