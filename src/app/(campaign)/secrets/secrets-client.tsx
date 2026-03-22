"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
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
  Plus,
  Trash2,
  Pencil,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
  onDelete,
}: {
  secret: SecretData;
  isSelected: boolean;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  return (
    <motion.div variants={item} whileHover={{ y: -1 }}>
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200 group/card",
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
            <div className="flex items-center gap-1.5">
              <button
                onClick={onDelete}
                className="opacity-0 group-hover/card:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/20 text-zinc-500 hover:text-red-400"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              {visibilityIcons[secret.visibility]}
            </div>
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

function EditableText({
  value,
  onSave,
  multiline,
  placeholder,
  className,
}: {
  value: string;
  onSave: (val: string) => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft.trim() !== value) {
      onSave(draft.trim());
    }
  };

  if (!editing) {
    return (
      <span
        onClick={() => setEditing(true)}
        className={cn(
          "cursor-pointer hover:bg-white/[0.04] rounded px-1 -mx-1 transition-colors inline-flex items-center gap-1.5 group/edit",
          className,
        )}
        title="Click to edit"
      >
        {value || <span className="text-zinc-500 italic">{placeholder || "Click to add..."}</span>}
        <Pencil className="h-3 w-3 text-zinc-600 opacity-0 group-hover/edit:opacity-100 transition-opacity shrink-0" />
      </span>
    );
  }

  if (multiline) {
    return (
      <div className="flex flex-col gap-1.5">
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setDraft(value);
              setEditing(false);
            }
          }}
          placeholder={placeholder}
          className={cn(
            "w-full bg-white/[0.03] border border-white/[0.08] rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-500/50 min-h-[80px] resize-y",
            className,
          )}
        />
        <div className="flex justify-end">
          <button
            onClick={commit}
            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <Check className="h-3 w-3" /> Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") {
          setDraft(value);
          setEditing(false);
        }
      }}
      placeholder={placeholder}
      className={cn(
        "bg-white/[0.03] border border-white/[0.08] rounded-md px-2 py-1 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-500/50 w-full",
        className,
      )}
    />
  );
}

function SecretDetail({
  secret,
  onUpdate,
}: {
  secret: SecretData;
  onUpdate: (field: string, value: string) => void;
}) {
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
          <div className="mt-2 mb-1">
            <EditableText
              value={secret.owner}
              onSave={(v) => onUpdate("owner", v)}
              className="text-sm font-medium text-muted-foreground dark:text-zinc-400 uppercase tracking-wider"
              placeholder="Add owner..."
            />
          </div>
        )}
        <div className={cn(!secret.owner && "mt-2")}>
          <EditableText
            value={secret.title}
            onSave={(v) => onUpdate("title", v)}
            className="text-xl font-heading font-semibold text-foreground dark:text-white"
          />
        </div>
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

      <div className="p-4 rounded-lg bg-card hover:bg-muted/50 dark:bg-white/[0.02] border border-border dark:border-white/[0.04]">
        <h4 className="text-xs font-medium text-muted-foreground dark:text-zinc-400 uppercase tracking-wider mb-2">
          Description
        </h4>
        <EditableText
          value={secret.description || ""}
          onSave={(v) => onUpdate("description", v)}
          multiline
          placeholder="Add a description..."
          className="text-sm text-foreground/80 dark:text-zinc-300 leading-relaxed"
        />
      </div>

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
      <div>
        <h4 className="text-xs font-medium text-muted-foreground dark:text-zinc-400 uppercase tracking-wider mb-2">
          Notes
        </h4>
        <div className="p-3 rounded-lg bg-card hover:bg-muted/50 dark:bg-white/[0.02] border border-border dark:border-white/[0.04]">
          <EditableText
            value={secret.notes || ""}
            onSave={(v) => onUpdate("notes", v)}
            multiline
            placeholder="Add DM notes..."
            className="text-sm text-muted-foreground dark:text-zinc-400 whitespace-pre-wrap"
          />
        </div>
      </div>
    </motion.div>
  );
}

const defaultFormState = {
  title: "",
  type: "dm_secret",
  owner: "",
  description: "",
  visibility: "dm_only",
  urgency: "medium",
  status: "active",
  notes: "",
};

export function SecretsClient({ campaign }: { campaign: CampaignData }) {
  const [secrets, setSecrets] = useState<SecretData[]>(campaign.secrets);
  const [selectedSecret, setSelectedSecret] = useState<SecretData | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"secrets" | "goals">("secrets");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(defaultFormState);
  const [creating, setCreating] = useState(false);

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<SecretData | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!createForm.title.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/secrets/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: campaign.id,
          title: createForm.title,
          type: createForm.type,
          owner: createForm.owner || null,
          description: createForm.description || null,
          visibility: createForm.visibility,
          urgency: createForm.urgency,
          status: createForm.status,
          notes: createForm.notes || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to create");
      const newSecret = await res.json();
      setSecrets((prev) => [newSecret, ...prev]);
      setCreateForm(defaultFormState);
      setCreateOpen(false);
    } catch (err) {
      console.error("Failed to create secret:", err);
    } finally {
      setCreating(false);
    }
  }, [createForm, campaign.id]);

  const handleUpdate = useCallback(async (secretId: string, field: string, value: string) => {
    try {
      const res = await fetch("/api/secrets/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretId, [field]: value }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setSecrets((prev) => prev.map((s) => (s.id === secretId ? updated : s)));
      if (selectedSecret?.id === secretId) setSelectedSecret(updated);
    } catch (err) {
      console.error("Failed to update secret:", err);
    }
  }, [selectedSecret]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/secrets/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretId: deleteTarget.id }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      setSecrets((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      if (selectedSecret?.id === deleteTarget.id) setSelectedSecret(null);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete secret:", err);
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, selectedSecret]);

  const filtered = useMemo(() => {
    return secrets.filter((s) => {
      if (activeTab === "secrets" && !s.type.endsWith("_secret")) return false;
      if (activeTab === "goals" && !s.type.endsWith("_goal")) return false;

      if (search && !s.title.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (typeFilter !== "all" && s.type !== typeFilter) return false;
      if (visibilityFilter !== "all" && s.visibility !== visibilityFilter)
        return false;
      return true;
    });
  }, [secrets, search, activeTab, typeFilter, visibilityFilter]);

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
                secrets.filter((s) => s.visibility === "dm_only").length
              }{" "}
              Hidden
            </Badge>
            <Badge variant="amber">
              {
                secrets.filter((s) => s.visibility === "partial").length
              }{" "}
              Partial
            </Badge>
            <Badge variant="emerald">
              {
                secrets.filter((s) => s.visibility === "visible").length
              }{" "}
              Known
            </Badge>
            <Button
              variant="arcane"
              size="sm"
              onClick={() => {
                setCreateForm({
                  ...defaultFormState,
                  type: activeTab === "goals" ? "party_goal" : "dm_secret",
                });
                setCreateOpen(true);
              }}
              className="ml-2"
            >
              <Plus className="h-4 w-4 mr-1" />
              New {activeTab === "goals" ? "Goal" : "Secret"}
            </Button>
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
                      onDelete={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(secret);
                      }}
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
                  onDelete={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(secret);
                  }}
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
                <div className="flex justify-end mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(selectedSecret)}
                    className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
                <SecretDetail
                  secret={selectedSecret}
                  onUpdate={(field, value) => handleUpdate(selectedSecret.id, field, value)}
                />
              </Card>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create {activeTab === "goals" ? "Goal" : "Secret"}</DialogTitle>
            <DialogDescription>
              Add a new {activeTab === "goals" ? "goal" : "secret"} to your campaign.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Title</p>
              <Input
                placeholder="Enter title..."
                value={createForm.title}
                onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                className="bg-white/[0.03] border-white/[0.06]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Type</p>
                <Select value={createForm.type} onValueChange={(v) => setCreateForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.06]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dm_secret">DM Secret</SelectItem>
                    <SelectItem value="world_secret">World Secret</SelectItem>
                    <SelectItem value="faction_secret">Faction Secret</SelectItem>
                    <SelectItem value="party_goal">Party Goal</SelectItem>
                    <SelectItem value="player_goal">Player Goal</SelectItem>
                    <SelectItem value="npc_goal">NPC Goal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Visibility</p>
                <Select value={createForm.visibility} onValueChange={(v) => setCreateForm((f) => ({ ...f, visibility: v }))}>
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.06]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dm_only">DM Only</SelectItem>
                    <SelectItem value="partial">Partially Revealed</SelectItem>
                    <SelectItem value="visible">Visible to Party</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Urgency</p>
                <Select value={createForm.urgency} onValueChange={(v) => setCreateForm((f) => ({ ...f, urgency: v }))}>
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.06]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Status</p>
                <Select value={createForm.status} onValueChange={(v) => setCreateForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.06]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="revealed">Revealed</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dormant">Dormant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Owner (optional)</p>
              <Input
                placeholder="e.g. Faction name, NPC name..."
                value={createForm.owner}
                onChange={(e) => setCreateForm((f) => ({ ...f, owner: e.target.value }))}
                className="bg-white/[0.03] border-white/[0.06]"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Description</p>
              <Textarea
                placeholder="Describe the secret or goal..."
                value={createForm.description}
                onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                className="bg-white/[0.03] border-white/[0.06] min-h-[80px]"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Notes (optional)</p>
              <Textarea
                placeholder="DM notes..."
                value={createForm.notes}
                onChange={(e) => setCreateForm((f) => ({ ...f, notes: e.target.value }))}
                className="bg-white/[0.03] border-white/[0.06] min-h-[60px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button variant="arcane" onClick={handleCreate} disabled={creating || !createForm.title.trim()}>
              {creating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete {deleteTarget?.type.endsWith("_goal") ? "Goal" : "Secret"}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.title}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
