"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  KeyRound,
  Eye,
  EyeOff,
  Search,
  Users,
  GitBranch,
  CalendarClock,
  Pin,
  Filter,
  Layers,
  Target,
  Shield,
  Globe,
  User,
  Crown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import type { CampaignData, SecretData } from "@/lib/data";

const typeIcons: Record<string, React.ReactNode> = {
  party_goal: <Users className="h-3.5 w-3.5 text-blue-400" />,
  player_goal: <User className="h-3.5 w-3.5 text-cyan-400" />,
  npc_goal: <Crown className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />,
  dm_secret: <EyeOff className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />,
  world_secret: <Globe className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />,
  faction_secret: <Shield className="h-3.5 w-3.5 text-red-600 dark:text-crimson-light" />,
};

const typeLabels: Record<string, string> = {
  party_goal: "Party Goal",
  player_goal: "Player Goal",
  npc_goal: "NPC Goal",
  dm_secret: "DM Secret",
  world_secret: "World Secret",
  faction_secret: "Faction Secret",
};

const visibilityIcons: Record<string, React.ReactNode> = {
  visible: <Eye className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />,
  partial: <Eye className="h-3 w-3 text-amber-600 dark:text-amber-400" />,
  dm_only: <EyeOff className="h-3 w-3 text-purple-600 dark:text-purple-400" />,
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

function SecretCard({
  secret,
  isSelected,
  onClick,
}: {
  secret: SecretData;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div variants={item} whileHover={{ y: -1 }}>
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200",
          isSelected
            ? "border-purple-400/30 glow-arcane"
            : "hover:border-border dark:border-white/[0.1]",
        )}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              {typeIcons[secret.type]}
              <h3 className="text-sm font-medium text-foreground dark:text-zinc-200 truncate">
                {secret.title}
              </h3>
              {secret.isPinned && (
                <Pin className="h-3 w-3 text-amber-600 dark:text-gold shrink-0" />
              )}
            </div>
            {visibilityIcons[secret.visibility]}
          </div>
          {secret.description && (
            <p className="text-xs text-muted-foreground dark:text-zinc-400 line-clamp-2 mb-3">
              {secret.description}
            </p>
          )}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <StatusBadge status={secret.status} />
              <StatusBadge status={secret.urgency} type="urgency" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SecretDetail({ secret }: { secret: SecretData }) {
  return (
    <motion.div
      key={secret.id}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-5"
    >
      <div>
        <div className="flex items-center gap-3 mb-2">
          {typeIcons[secret.type]}
          <Badge variant="outline" className="text-xs capitalize">
            {typeLabels[secret.type]}
          </Badge>
          {secret.isPinned && (
            <Badge variant="gold" className="text-xs gap-1">
              <Pin className="h-3 w-3" /> Pinned
            </Badge>
          )}
        </div>
        {secret.owner && (
          <p className="text-sm font-medium text-muted-foreground dark:text-zinc-400 mt-2 mb-1 uppercase tracking-wider">
            {secret.owner}
          </p>
        )}
        <h2 className={cn("text-xl font-heading font-semibold text-foreground dark:text-white", !secret.owner && "mt-2")}>
          {secret.title}
        </h2>
      </div>

      <div className="flex flex-wrap gap-2">
        <StatusBadge status={secret.status} />
        <StatusBadge status={secret.urgency} type="urgency" />
        <Badge
          variant={
            secret.visibility === "dm_only"
              ? "purple"
              : secret.visibility === "partial"
                ? "amber"
                : "emerald"
          }
          className="text-xs gap-1"
        >
          {visibilityIcons[secret.visibility]}
          {secret.visibility === "dm_only"
            ? "DM Only"
            : secret.visibility === "partial"
              ? "Partially Revealed"
              : "Visible to Party"}
        </Badge>
      </div>

      {secret.description && (
        <div className="p-4 rounded-lg bg-card hover:bg-muted/50 dark:bg-white/[0.02] border border-border dark:border-white/[0.04]">
          <p className="text-sm text-foreground/80 dark:text-zinc-300 leading-relaxed">
            {secret.description}
          </p>
        </div>
      )}

      {/* Progress */}
      {secret.progress > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-muted-foreground dark:text-zinc-400 uppercase tracking-wider">
              Progress
            </h4>
            <span className="text-sm font-medium text-amber-600 dark:text-gold">
              {secret.progress}%
            </span>
          </div>
          <Progress value={secret.progress} className="h-2" />
        </div>
      )}

      {/* Connected Storylines */}
      {secret.storylineLinks.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <GitBranch className="h-3 w-3 text-blue-600 dark:text-arcane" /> Related Storylines
          </h4>
          <div className="flex flex-wrap gap-2">
            {secret.storylineLinks.map((sl) => (
              <Badge key={sl.storylineId} variant="arcane" className="text-xs">
                {sl.storyline.title}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Connected NPCs */}
      {secret.npcLinks.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Users className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> Related NPCs
          </h4>
          <div className="flex flex-wrap gap-2">
            {secret.npcLinks.map((nl) => (
              <Badge key={nl.npcId} variant="emerald" className="text-xs">
                {nl.npc.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Connected Sessions */}
      {secret.sessionLinks.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <CalendarClock className="h-3 w-3 text-amber-600 dark:text-amber-400" /> Related
            Sessions
          </h4>
          <div className="flex flex-wrap gap-2">
            {secret.sessionLinks.map((sl) => (
              <Badge key={sl.sessionId} variant="gold" className="text-xs">
                {sl.session.title.toLowerCase().startsWith(`session ${sl.session.sessionNumber}`)
                  ? sl.session.title
                  : `Session #${sl.session.sessionNumber}: ${sl.session.title}`}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {secret.notes && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground dark:text-zinc-400 uppercase tracking-wider mb-2">
            Notes
          </h4>
          <p className="text-sm text-muted-foreground dark:text-zinc-400 p-3 rounded-lg bg-card hover:bg-muted/50 dark:bg-white/[0.02] border border-border dark:border-white/[0.04] whitespace-pre-wrap">
            {secret.notes}
          </p>
        </div>
      )}
    </motion.div>
  );
}

export function SecretsClient({ campaign }: { campaign: CampaignData }) {
  const [selectedSecret, setSelectedSecret] = useState<SecretData | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"secrets" | "goals">("secrets");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return campaign.secrets.filter((s) => {
      if (activeTab === "secrets" && !s.type.endsWith("_secret")) return false;
      if (activeTab === "goals" && !s.type.endsWith("_goal")) return false;

      if (search && !s.title.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (typeFilter !== "all" && s.type !== typeFilter) return false;
      if (visibilityFilter !== "all" && s.visibility !== visibilityFilter)
        return false;
      return true;
    });
  }, [campaign.secrets, search, activeTab, typeFilter, visibilityFilter]);

  const groupedByType = useMemo(() => {
    const groups: Record<string, SecretData[]> = {};
    filtered.forEach((s) => {
      if (!groups[s.type]) groups[s.type] = [];
      groups[s.type].push(s);
    });
    return groups;
  }, [filtered]);

  return (
    <div>
      <PageHeader
        title="Secrets & Goals"
        subtitle="Track campaign secrets, party goals, and hidden motivations"
        icon={<KeyRound className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="purple">
              {
                campaign.secrets.filter((s) => s.visibility === "dm_only")
                  .length
              }{" "}
              Hidden
            </Badge>
            <Badge variant="amber">
              {
                campaign.secrets.filter((s) => s.visibility === "partial")
                  .length
              }{" "}
              Partial
            </Badge>
            <Badge variant="emerald">
              {
                campaign.secrets.filter((s) => s.visibility === "visible")
                  .length
              }{" "}
              Known
            </Badge>
          </div>
        }
      />

      <Tabs
        defaultValue="secrets"
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val as "secrets" | "goals");
          setTypeFilter("all");
          setSelectedSecret(null);
        }}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="secrets">Secrets</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-zinc-500" />
          <Input
            placeholder="Search secrets & goals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card hover:bg-muted/60 dark:bg-white/[0.03] border-border dark:border-white/[0.06]"
          />
        </div>
        <div className="flex gap-1.5">
          <Button
            variant={typeFilter === "all" ? "arcane" : "ghost"}
            size="sm"
            onClick={() => setTypeFilter("all")}
            className="text-xs"
          >
            All
          </Button>
          {(activeTab === "secrets"
            ? ["dm_secret", "world_secret", "faction_secret"]
            : ["party_goal", "player_goal", "npc_goal"]
          ).map((t) => (
            <Button
              key={t}
              variant={typeFilter === t ? "arcane" : "ghost"}
              size="sm"
              onClick={() => setTypeFilter(t)}
              className="text-xs"
            >
              {typeLabels[t]}
            </Button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {["all", "visible", "partial", "dm_only"].map((v) => (
            <Button
              key={v}
              variant={visibilityFilter === v ? "gold" : "ghost"}
              size="sm"
              onClick={() => setVisibilityFilter(v)}
              className="text-xs capitalize"
            >
              {v === "dm_only" ? "DM Only" : v}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Secrets List */}
        <div
          className={cn(
            "space-y-6",
            selectedSecret ? "lg:col-span-5" : "lg:col-span-12",
          )}
        >
          {typeFilter === "all" ? (
            Object.entries(groupedByType).map(([type, secrets]) => (
              <div key={type}>
                <h3 className="text-sm font-medium text-muted-foreground dark:text-zinc-400 mb-3 flex items-center gap-2">
                  {typeIcons[type]}
                  {typeLabels[type]}
                  <Badge variant="secondary" className="text-[10px] h-4">
                    {secrets.length}
                  </Badge>
                </h3>
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className={cn(
                    "grid gap-3",
                    selectedSecret
                      ? "grid-cols-1"
                      : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
                  )}
                >
                  {secrets.map((secret) => (
                    <SecretCard
                      key={secret.id}
                      secret={secret}
                      isSelected={selectedSecret?.id === secret.id}
                      onClick={() => setSelectedSecret(secret)}
                    />
                  ))}
                </motion.div>
              </div>
            ))
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className={cn(
                "grid gap-3",
                selectedSecret
                  ? "grid-cols-1"
                  : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
              )}
            >
              {filtered.map((secret) => (
                <SecretCard
                  key={secret.id}
                  secret={secret}
                  isSelected={selectedSecret?.id === secret.id}
                  onClick={() => setSelectedSecret(secret)}
                />
              ))}
            </motion.div>
          )}
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedSecret && (
            <div className="lg:col-span-7">
              <Card className="p-6 sticky top-6">
                <SecretDetail secret={selectedSecret} />
              </Card>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
