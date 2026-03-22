"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarClock,
  ChevronDown,
  ChevronRight,
  MapPin,
  Users,
  GitBranch,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Swords,
  MessageSquare,
  ListChecks,
  Clock,
  Bookmark,
  FileText,
  Plus,
  Wand2,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, parseExtractedItems } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { CampaignData, SessionData } from "@/lib/data";
import { CreateSessionDialog } from "@/components/sessions/create-session-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TipTapReadonlyViewer } from "@/components/sessions/tiptap-readonly-viewer";
import { SourceSnippet } from "@/components/sessions/source-snippet";
import { ExtractionProgress } from "@/components/sessions/extraction-progress";

const templateIcons: Record<string, React.ReactNode> = {
  tavern: <MapPin className="h-3.5 w-3.5" />,
  travel: <MapPin className="h-3.5 w-3.5" />,
  mystery: <KeyRound className="h-3.5 w-3.5" />,
  combat: <Swords className="h-3.5 w-3.5" />,
  political: <Users className="h-3.5 w-3.5" />,
};

function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
  count,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  count?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border dark:border-white/[0.04] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-3 hover:bg-card hover:bg-muted/50 dark:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-foreground/80 dark:text-zinc-300">
          {icon}
          {title}
          {count !== undefined && count > 0 && (
            <Badge variant="secondary" className="text-[10px] h-5 ml-1">
              {count}
            </Badge>
          )}
        </div>
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground dark:text-zinc-500" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground dark:text-zinc-500" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SessionDetail({ session }: { session: SessionData }) {
  const keyBeats = parseExtractedItems(session.keyBeats);
  const encounters = parseExtractedItems(session.encounters);
  const hooks = parseExtractedItems(session.hooks);
  const locations = parseExtractedItems(session.locations);
  const playerNotes = parseExtractedItems(session.playerNotes);
  const contingencies = parseExtractedItems(session.contingencies);
  const improvPrompts = parseExtractedItems(session.improvPrompts);
  const reminders = parseExtractedItems(session.reminders);
  const checklist = parseExtractedItems(session.checklist);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-heading font-semibold text-foreground dark:text-white">
            {session.title.toLowerCase().startsWith(`session ${session.sessionNumber}`)
              ? session.title
              : `Session ${session.sessionNumber}: ${session.title}`}
          </h2>
          <div className="flex items-center gap-3 mt-2">
            {session.date && (
              <span className="text-sm text-muted-foreground dark:text-zinc-400 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDate(session.date)}
              </span>
            )}
            <StatusBadge status={session.status} />
            {session.template && (
              <Badge variant="outline" className="text-xs gap-1">
                {templateIcons[session.template]}
                {session.template}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Checklist (Moved to Top & Clickable) */}
      {checklist.length > 0 && (
        <CollapsibleSection
          title="Pre-Session Checklist"
          icon={<ListChecks className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
          defaultOpen={true}
          count={checklist.length}
        >
          <div className="space-y-2">
            {checklist.map((item, i) => (
              <label
                key={i}
                className="flex items-start gap-2 text-sm text-foreground/80 dark:text-zinc-300 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  className="mt-1 h-3.5 w-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="group-hover:text-foreground">
                  <SourceSnippet source={item.source}>{item.text}</SourceSnippet>
                </span>
              </label>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Reminders (Moved to Top) */}
      {reminders.length > 0 && (
        <CollapsibleSection
          title="Important Reminders"
          icon={<AlertCircle className="h-4 w-4 text-red-400" />}
          defaultOpen={true}
          count={reminders.length}
        >
          <div className="space-y-2">
            {reminders.map((r, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm text-red-300/80"
              >
                <AlertCircle className="h-3.5 w-3.5 text-red-400/50 mt-0.5 shrink-0" />
                <SourceSnippet source={r.source}>{r.text}</SourceSnippet>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {session.summary && (
        <p className="text-sm text-foreground/80 dark:text-zinc-300 leading-relaxed bg-card hover:bg-muted/50 dark:bg-white/[0.02] rounded-lg p-4 border border-border dark:border-white/[0.04]">
          {session.summary}
        </p>
      )}

      {/* Connected Entities (Separated & Labeled) */}
      <div className="space-y-3 p-4 bg-muted/30 dark:bg-white/[0.01] rounded-lg border border-border dark:border-white/[0.04]">
        {session.storylineLinks.length > 0 && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-3">Plot Lines</span>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {session.storylineLinks.map((sl) => (
                <Badge key={sl.storylineId} variant="arcane" className="text-xs gap-1">
                  <GitBranch className="h-3 w-3" />
                  {sl.storyline.title}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {session.npcLinks.length > 0 && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-3">NPCs</span>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {session.npcLinks.map((nl) => (
                <Badge key={nl.npcId} variant="emerald" className="text-xs gap-1">
                  <Users className="h-3 w-3" />
                  {nl.npc.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {session.secretLinks.length > 0 && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-3">Secrets & Missions</span>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {session.secretLinks.map((sl) => (
                <Badge key={sl.secretId} variant="purple" className="text-xs gap-1">
                  <KeyRound className="h-3 w-3" />
                  {sl.secret.title}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {/* Key Beats -> Acts */}
        {keyBeats.length > 0 && (
          <CollapsibleSection
            title="Acts"
            icon={<Bookmark className="h-4 w-4 text-amber-600 dark:text-gold" />}
            defaultOpen={true}
            count={keyBeats.length}
          >
            <div className="space-y-3">
              {keyBeats.map((beat, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-1 p-3 rounded-lg bg-card border border-border dark:border-white/[0.02]"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-gold/80">
                    Act {i + 1}
                  </span>
                  <span className="text-sm text-foreground/80 dark:text-zinc-300 whitespace-pre-wrap">
                    <SourceSnippet source={beat.source}>{beat.text}</SourceSnippet>
                  </span>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Encounters/Scenes */}
        {encounters.length > 0 && (
          <CollapsibleSection
            title="Encounters & Scenes"
            icon={<Swords className="h-4 w-4 text-red-600 dark:text-crimson-light" />}
            defaultOpen={true}
            count={encounters.length}
          >
            <div className="space-y-2">
              {encounters.map((enc, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-card hover:bg-muted/50 dark:bg-white/[0.02] border-l-2 border-crimson/30"
                >
                  <span className="text-sm text-foreground/80 dark:text-zinc-300">
                    <SourceSnippet source={enc.source}>{enc.text}</SourceSnippet>
                  </span>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Hooks */}
        {hooks.length > 0 && (
          <CollapsibleSection
            title="Possible Hooks"
            icon={<Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
            count={hooks.length}
          >
            <div className="space-y-2">
              {hooks.map((hook, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-sm text-foreground/80 dark:text-zinc-300"
                >
                  <Lightbulb className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400/50 mt-0.5 shrink-0" />
                  <SourceSnippet source={hook.source}>{hook.text}</SourceSnippet>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Locations */}
        {locations.length > 0 && (
          <CollapsibleSection
            title="Locations"
            icon={<MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
            count={locations.length}
          >
            <div className="flex flex-wrap gap-2">
              {locations.map((loc, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  {loc.text}
                </Badge>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Player Notes */}
        {playerNotes.length > 0 && (
          <CollapsibleSection
            title="Player-Specific Notes"
            icon={<FileText className="h-4 w-4 text-blue-400" />}
            count={playerNotes.length}
          >
            <div className="space-y-2">
              {playerNotes.map((note, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-card hover:bg-muted/50 dark:bg-white/[0.02] text-sm text-foreground/80 dark:text-zinc-300"
                >
                  <SourceSnippet source={note.source}>{note.text}</SourceSnippet>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Contingencies */}
        {contingencies.length > 0 && (
          <CollapsibleSection
            title="Contingency Branches"
            icon={<AlertCircle className="h-4 w-4 text-orange-400" />}
            count={contingencies.length}
          >
            <div className="space-y-2">
              {contingencies.map((c, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-orange-400/5 border border-orange-400/10 text-sm text-foreground/80 dark:text-zinc-300"
                >
                  <SourceSnippet source={c.source}>{c.text}</SourceSnippet>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Improv Prompts */}
        {improvPrompts.length > 0 && (
          <CollapsibleSection
            title="Improv Prompts"
            icon={<MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
            count={improvPrompts.length}
          >
            <div className="space-y-2">
              {improvPrompts.map((p, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-purple-400/5 border border-purple-400/10 text-sm text-foreground/80 dark:text-zinc-300 italic"
                >
                  &ldquo;<SourceSnippet source={p.source}>{p.text}</SourceSnippet>&rdquo;
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}
      </div>
    </motion.div>
  );
}

export function SessionsClient({ campaign }: { campaign: CampaignData }) {
  const [sessions, setSessions] = useState<SessionData[]>(campaign.sessions);
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(
    sessions
      .filter((s) => s.status !== "completed")
      .sort((a, b) => a.sessionNumber - b.sessionNumber)[0] ||
      sessions[0] ||
      null,
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  const outlineDoc = selectedSession
    ? campaign.noteFolders
        .find((f) => f.slug === "session-outlines")
        ?.documents.find(
          (d) => d.slug === `session-outline-${selectedSession.sessionNumber}`
        ) ?? null
    : null;

  const filteredSessions =
    statusFilter === "all"
      ? sessions
      : sessions.filter((s) => s.status === statusFilter);

  const sortedSessions = [...filteredSessions].sort(
    (a, b) => b.sessionNumber - a.sessionNumber,
  );

  async function handleExtractFromOutline() {
    if (!selectedSession) return;
    setExtracting(true);
    setExtractError(null);
    try {
      const res = await fetch("/api/session/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: selectedSession.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Extraction failed");
      }
      const data = await res.json();
      const updatedSession: SessionData = {
        ...selectedSession,
        checklist: JSON.stringify(data.checklist),
        reminders: JSON.stringify(data.reminders),
        keyBeats: JSON.stringify(data.keyBeats),
        encounters: JSON.stringify(data.encounters),
        hooks: JSON.stringify(data.hooks),
        locations: JSON.stringify(data.locations),
        playerNotes: JSON.stringify(data.playerNotes),
        contingencies: JSON.stringify(data.contingencies),
        improvPrompts: JSON.stringify(data.improvPrompts),
        npcLinks: data.linkedNpcs ?? selectedSession.npcLinks,
        storylineLinks: data.linkedStorylines ?? selectedSession.storylineLinks,
        secretLinks: data.linkedSecrets ?? selectedSession.secretLinks,
      };
      setSessions((prev) =>
        prev.map((s) => (s.id === selectedSession.id ? updatedSession : s)),
      );
      setSelectedSession(updatedSession);
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setExtracting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Session Planner"
        subtitle="Plan, organize, and track your campaign sessions"
        icon={<CalendarClock className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="gold"
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="text-xs gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              New Session
            </Button>
            <Separator orientation="vertical" className="h-5" />
            {["all", "draft", "planning", "ready", "completed"].map((s) => (
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
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Session List */}
        <div className="lg:col-span-4 space-y-2">
          {sortedSessions.map((session) => (
            <motion.div
              key={session.id}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.99 }}
            >
              <Card
                className={cn(
                  "cursor-pointer transition-all duration-200",
                  selectedSession?.id === session.id
                    ? "border-gold/30 glow-gold"
                    : "hover:border-border dark:border-white/[0.1]",
                )}
                onClick={() => setSelectedSession(session)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-amber-600 dark:text-gold/60">
                          #{session.sessionNumber}
                        </span>
                        <StatusBadge status={session.status} />
                      </div>
                      <h3 className="text-sm font-medium text-foreground dark:text-zinc-200 mt-1 truncate">
                        {session.title}
                      </h3>
                      {session.date && (
                        <p className="text-xs text-muted-foreground dark:text-zinc-500 mt-1">
                          {formatDate(session.date)}
                        </p>
                      )}
                    </div>
                    {session.template && (
                      <div className="text-muted-foreground dark:text-zinc-500">
                        {templateIcons[session.template]}
                      </div>
                    )}
                  </div>
                  {(session.storylineLinks.length > 0 ||
                    session.npcLinks.length > 0) && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {session.storylineLinks.slice(0, 2).map((sl) => (
                        <Badge
                          key={sl.storylineId}
                          variant="arcane"
                          className="text-[10px] h-4 px-1.5"
                        >
                          {sl.storyline.title}
                        </Badge>
                      ))}
                      {session.npcLinks.slice(0, 2).map((nl) => (
                        <Badge
                          key={nl.npcId}
                          variant="emerald"
                          className="text-[10px] h-4 px-1.5"
                        >
                          {nl.npc.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Session Detail */}
        <div className="lg:col-span-8">
          {selectedSession ? (
            <Card className="p-6">
              <Tabs defaultValue="planning">
                <TabsList className="mb-4">
                  <TabsTrigger value="planning" className="gap-1.5">
                    <ListChecks className="h-3.5 w-3.5" />
                    Planning
                  </TabsTrigger>
                  <TabsTrigger value="outline" className="gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Session Outline
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="planning">
                  {outlineDoc && (
                    <div className="mb-4">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleExtractFromOutline}
                          disabled={extracting}
                          className="gap-1.5 text-xs"
                        >
                          {extracting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Wand2 className="h-3.5 w-3.5" />
                          )}
                          {extracting ? "Extracting..." : "Extract from Outline"}
                        </Button>
                        {extractError && (
                          <span className="text-xs text-red-400">{extractError}</span>
                        )}
                      </div>
                      {extracting && selectedSession && (
                        <ExtractionProgress
                          sessionId={selectedSession.id}
                          isActive={extracting}
                        />
                      )}
                    </div>
                  )}
                  <SessionDetail session={selectedSession} />
                </TabsContent>
                <TabsContent value="outline">
                  {outlineDoc ? (
                    <TipTapReadonlyViewer content={outlineDoc.content} />
                  ) : (
                    <div className="text-center py-12 text-muted-foreground dark:text-zinc-500">
                      <FileText className="h-8 w-8 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No outline document found for this session.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          ) : (
            <Card className="p-12">
              <div className="text-center text-muted-foreground dark:text-zinc-500">
                <CalendarClock className="h-8 w-8 mx-auto mb-3 text-muted-foreground dark:text-zinc-600" />
                <p className="text-sm">Select a session to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      <CreateSessionDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        campaignId={campaign.id}
        onCreated={(session) => {
          setSessions((prev) => [...prev, session]);
          setSelectedSession(session);
        }}
      />
    </div>
  );
}
