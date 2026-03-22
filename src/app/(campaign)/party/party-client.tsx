"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Swords,
  Heart,
  BookOpen,
  Target,
  Users,
  Sparkles,
  Star,
  Scroll,
  X,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { getRarityColor } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { CampaignData, CharacterData } from "@/lib/data";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

function CharacterCard({
  character,
  isSelected,
  onClick,
}: {
  character: CharacterData;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
    >
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200",
          isSelected
            ? "border-blue-400/30 glow-arcane"
            : "hover:border-border dark:border-white/[0.1]",
        )}
        onClick={onClick}
      >
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400/20 to-purple-400/10 border border-blue-400/20 flex items-center justify-center shrink-0">
              <span className="text-xl font-heading font-bold text-blue-400">
                {character.name.charAt(0)}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-heading font-semibold text-foreground dark:text-white">
                {character.name}
              </h3>
              <p className="text-sm text-muted-foreground dark:text-zinc-400 mt-0.5">
                Level {character.level}{" "}
                {[character.race, character.className]
                  .filter(Boolean)
                  .join(" ")}
                {character.subclass ? ` (${character.subclass})` : ""}
              </p>
              {character.playerName && (
                <p className="text-xs text-muted-foreground dark:text-zinc-500 mt-1">
                  Player: {character.playerName}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge status={character.status} />
                {character.wishlists.length > 0 && (
                  <Badge
                    variant="gold"
                    className="text-[10px] h-4 px-1.5 gap-0.5"
                  >
                    <Sparkles className="h-3 w-3" />
                    {character.wishlists.length}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CharacterDetail({ character }: { character: CharacterData }) {
  const bg = character.backgrounds[0];

  return (
    <motion.div
      key={character.id}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-400/20 to-purple-400/10 border border-blue-400/20 flex items-center justify-center shrink-0">
          <span className="text-2xl font-heading font-bold text-blue-400">
            {character.name.charAt(0)}
          </span>
        </div>
        <div>
          <h2 className="text-xl font-heading font-semibold text-foreground dark:text-white">
            {character.name}
          </h2>
          <p className="text-sm text-muted-foreground dark:text-zinc-400 mt-0.5">
            Level {character.level}{" "}
            {[character.race, character.className].filter(Boolean).join(" ")}
            {character.subclass ? ` (${character.subclass})` : ""}
          </p>
          {character.playerName && (
            <p className="text-xs text-muted-foreground dark:text-zinc-500 mt-1">
              Player: {character.playerName}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <StatusBadge status={character.status} />
            {character.background && (
              <Badge variant="secondary" className="text-xs">
                {character.background}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Personality Traits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {character.personality && (
          <div className="p-3 rounded-lg bg-card hover:bg-muted/50 dark:bg-white/[0.02] border border-border dark:border-white/[0.04]">
            <h4 className="text-[10px] text-muted-foreground dark:text-zinc-500 uppercase tracking-wider mb-1">
              Personality
            </h4>
            <p className="text-sm text-foreground/80 dark:text-zinc-300">
              {character.personality}
            </p>
          </div>
        )}
        {character.ideals && (
          <div className="p-3 rounded-lg bg-card hover:bg-muted/50 dark:bg-white/[0.02] border border-border dark:border-white/[0.04]">
            <h4 className="text-[10px] text-muted-foreground dark:text-zinc-500 uppercase tracking-wider mb-1">
              Ideals
            </h4>
            <p className="text-sm text-foreground/80 dark:text-zinc-300">
              {character.ideals}
            </p>
          </div>
        )}
        {character.bonds && (
          <div className="p-3 rounded-lg bg-card hover:bg-muted/50 dark:bg-white/[0.02] border border-border dark:border-white/[0.04]">
            <h4 className="text-[10px] text-muted-foreground dark:text-zinc-500 uppercase tracking-wider mb-1">
              Bonds
            </h4>
            <p className="text-sm text-foreground/80 dark:text-zinc-300">
              {character.bonds}
            </p>
          </div>
        )}
        {character.flaws && (
          <div className="p-3 rounded-lg bg-card hover:bg-muted/50 dark:bg-white/[0.02] border border-border dark:border-white/[0.04]">
            <h4 className="text-[10px] text-muted-foreground dark:text-zinc-500 uppercase tracking-wider mb-1">
              Flaws
            </h4>
            <p className="text-sm text-foreground/80 dark:text-zinc-300">
              {character.flaws}
            </p>
          </div>
        )}
      </div>

      {/* Backstory */}
      {character.backstory && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Scroll className="h-3 w-3" /> Backstory
          </h4>
          <p className="text-sm text-foreground/80 dark:text-zinc-300 p-4 rounded-lg bg-card hover:bg-muted/50 dark:bg-white/[0.02] border border-border dark:border-white/[0.04] leading-relaxed whitespace-pre-wrap">
            {character.backstory}
          </p>
        </div>
      )}

      {/* Current Goals */}
      {character.currentGoals && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Target className="h-3 w-3 text-amber-600 dark:text-amber-400" /> Current Goals
          </h4>
          <p className="text-sm text-foreground/80 dark:text-zinc-300 p-3 rounded-lg bg-amber-400/5 border border-amber-400/10">
            {character.currentGoals}
          </p>
        </div>
      )}

      {/* Background Details */}
      {bg && (
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <BookOpen className="h-3 w-3 text-red-600 dark:text-crimson-light" /> Background
            Details
          </h4>
          {bg.backgroundText && (
            <p className="text-sm text-foreground/80 dark:text-zinc-300 p-3 rounded-lg bg-card hover:bg-muted/50 dark:bg-white/[0.02] border border-border dark:border-white/[0.04] whitespace-pre-wrap">
              {bg.backgroundText}
            </p>
          )}
          {bg.plotHooks && (
            <div>
              <p className="text-[10px] text-muted-foreground dark:text-zinc-500 uppercase tracking-wider mb-1">
                Plot Hooks
              </p>
              <div className="space-y-1">
                {JSON.parse(bg.plotHooks).map((hook: string, i: number) => (
                  <div
                    key={i}
                    className="text-sm text-foreground/80 dark:text-zinc-300 p-2 rounded bg-gold/5 border border-gold/10"
                  >
                    {hook}
                  </div>
                ))}
              </div>
            </div>
          )}
          {bg.unresolvedThreads && (
            <div>
              <p className="text-[10px] text-muted-foreground dark:text-zinc-500 uppercase tracking-wider mb-1">
                Unresolved Threads
              </p>
              <div className="space-y-1">
                {JSON.parse(bg.unresolvedThreads).map(
                  (thread: string, i: number) => (
                    <div
                      key={i}
                      className="text-sm text-foreground/80 dark:text-zinc-300 p-2 rounded bg-purple-400/5 border border-purple-400/10"
                    >
                      {thread}
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Magic Item Wishlists */}
      {character.wishlists.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground dark:text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-600 dark:text-amber-300" /> Magic Item Wishlist
          </h4>
          <div className="space-y-2">
            {character.wishlists.map((wish) => (
              <div
                key={wish.id}
                className="p-3 rounded-lg bg-card hover:bg-muted/50 dark:bg-white/[0.02] border border-border dark:border-white/[0.04]"
              >
                <div className="flex items-center justify-between mb-1">
                  <h5
                    className={cn(
                      "text-sm font-medium",
                      getRarityColor(wish.rarity),
                    )}
                  >
                    {wish.itemName}
                  </h5>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] capitalize",
                        getRarityColor(wish.rarity),
                      )}
                    >
                      {wish.rarity.replace(/_/g, " ")}
                    </Badge>
                    <StatusBadge status={wish.status} />
                  </div>
                </div>
                {wish.reason && (
                  <p className="text-xs text-muted-foreground dark:text-zinc-400 mt-1">
                    {wish.reason}
                  </p>
                )}
                {wish.storyHook && (
                  <p className="text-xs text-amber-600 dark:text-gold/70 mt-1 italic">
                    Story hook: {wish.storyHook}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {character.notes && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground dark:text-zinc-400 uppercase tracking-wider mb-2">
            DM Notes
          </h4>
          <p className="text-sm text-muted-foreground dark:text-zinc-400 p-3 rounded-lg bg-card hover:bg-muted/50 dark:bg-white/[0.02] border border-border dark:border-white/[0.04] whitespace-pre-wrap">
            {character.notes}
          </p>
        </div>
      )}
    </motion.div>
  );
}

interface NewMemberForm {
  name: string;
  playerName: string;
  className: string;
  subclass: string;
  race: string;
  level: string;
  background: string;
  personality: string;
  backstory: string;
}

const emptyForm = (): NewMemberForm => ({
  name: "", playerName: "", className: "", subclass: "",
  race: "", level: "1", background: "", personality: "", backstory: "",
});

export function PartyClient({ campaign }: { campaign: CampaignData }) {
  const [characters, setCharacters] = useState<CharacterData[]>(campaign.characters);
  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterData | null>(campaign.characters[0] || null);
  const [newMemberOpen, setNewMemberOpen] = useState(false);
  const [form, setForm] = useState<NewMemberForm>(emptyForm());
  const [isCreating, setIsCreating] = useState(false);

  const partyCharacters = characters.filter((c) => c.isPlayerCharacter);

  const handleCreateMember = async () => {
    if (!form.name.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/characters/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: campaign.id, ...form }),
      });
      if (!res.ok) throw new Error("Failed to create character");
      const newChar = await res.json();
      setCharacters((prev) => [...prev, newChar]);
      setSelectedCharacter(newChar);
      setForm(emptyForm());
      setNewMemberOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      {/* New Party Member Dialog */}
      <Dialog open={newMemberOpen} onOpenChange={setNewMemberOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Add Party Member</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2">
              <label className="text-xs text-zinc-400 mb-1 block">Character Name *</label>
              <Input placeholder="e.g. Arannis Brightwood" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} autoFocus />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-zinc-400 mb-1 block">Player Name</label>
              <Input placeholder="Who plays this character?" value={form.playerName} onChange={(e) => setForm((f) => ({ ...f, playerName: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Class</label>
              <Input placeholder="e.g. Wizard, Fighter" value={form.className} onChange={(e) => setForm((f) => ({ ...f, className: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Subclass</label>
              <Input placeholder="e.g. Evocation" value={form.subclass} onChange={(e) => setForm((f) => ({ ...f, subclass: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Race</label>
              <Input placeholder="e.g. Elf, Human" value={form.race} onChange={(e) => setForm((f) => ({ ...f, race: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Level</label>
              <Input type="number" min={1} max={20} value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-zinc-400 mb-1 block">Background</label>
              <Input placeholder="e.g. Sage, Criminal" value={form.background} onChange={(e) => setForm((f) => ({ ...f, background: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-zinc-400 mb-1 block">Personality</label>
              <Input placeholder="Key personality traits" value={form.personality} onChange={(e) => setForm((f) => ({ ...f, personality: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-zinc-400 mb-1 block">Backstory</label>
              <Input placeholder="Brief backstory" value={form.backstory} onChange={(e) => setForm((f) => ({ ...f, backstory: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => { setNewMemberOpen(false); setForm(emptyForm()); }}>Cancel</Button>
            <Button variant="gold" size="sm" onClick={handleCreateMember} disabled={!form.name.trim() || isCreating}>
              {isCreating ? "Adding…" : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PageHeader
        title="Party Hub"
        subtitle="Player characters, backgrounds, and wishlists"
        icon={<Shield className="h-5 w-5 text-blue-400" />}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="gold" size="sm" onClick={() => setNewMemberOpen(true)} className="gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />Add Member
            </Button>
            <Badge variant="arcane">{partyCharacters.length} Party Members</Badge>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Character Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="lg:col-span-4 space-y-3"
        >
          {partyCharacters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              isSelected={selectedCharacter?.id === character.id}
              onClick={() => setSelectedCharacter(character)}
            />
          ))}
          {partyCharacters.length === 0 && (
            <div className="text-center py-12 text-zinc-500">
              <Shield className="h-8 w-8 mx-auto mb-3 text-zinc-600" />
              <p className="text-sm">No party members yet</p>
              <Button variant="ghost" size="sm" onClick={() => setNewMemberOpen(true)} className="mt-3 gap-1.5 text-xs text-blue-400">
                <Plus className="h-3.5 w-3.5" />Add your first member
              </Button>
            </div>
          )}
        </motion.div>

        {/* Character Detail */}
        <div className="lg:col-span-8">
          {selectedCharacter ? (
            <Card className="p-6">
              <CharacterDetail character={selectedCharacter} />
            </Card>
          ) : (
            <Card className="p-12">
              <div className="text-center text-muted-foreground dark:text-zinc-500">
                <Shield className="h-8 w-8 mx-auto mb-3 text-muted-foreground dark:text-zinc-600" />
                <p className="text-sm">Select a character to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
