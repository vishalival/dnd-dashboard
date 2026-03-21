"use client";

import React, { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  LayoutDashboard,
  CalendarClock,
  GitBranch,
  Users,
  KeyRound,
  BookOpen,
  Shield,
  Sparkles,
  Search,
  Loader2,
} from "lucide-react";
import { useCampaignStore } from "@/stores/campaign-store";
import { Badge } from "@/components/ui/badge";

import { searchCampaignData } from "@/lib/actions";

const staticPages = [
  { name: "Command Center", href: "/dashboard", icon: LayoutDashboard, type: "Page" },
  { name: "Session Planner", href: "/sessions", icon: CalendarClock, type: "Page" },
  { name: "Story Timeline", href: "/storylines", icon: GitBranch, type: "Page" },
  { name: "NPC Tracker", href: "/npcs", icon: Users, type: "Page" },
  { name: "Secrets & Goals", href: "/secrets", icon: KeyRound, type: "Page" },
  { name: "DM Journal", href: "/journal", icon: BookOpen, type: "Page" },
  { name: "Party Hub", href: "/party", icon: Shield, type: "Page" },
  { name: "Magic Items", href: "/wishlists", icon: Sparkles, type: "Page" },
];

export function CommandPalette() {
  const router = useRouter();
  const isOpen = useCampaignStore((state) => state.commandPaletteOpen);
  const toggle = useCampaignStore((state) => state.toggleCommandPalette);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchCampaignData(query);
        setResults(data);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const onSelect = useCallback(
    (href: string) => {
      router.push(href);
      toggle();
    },
    [router, toggle],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/5">
        <Command label="Command Palette" className="flex flex-col h-full bg-zinc-900 overflow-hidden" shouldFilter={false}>
          <div className="flex items-center border-b border-white/5 px-4 py-3">
            <Search className="h-4 w-4 text-zinc-500 mr-3 shrink-0" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search anything... NPCs, plots, sessions..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-zinc-600 h-9 w-full"
            />
            <div className="flex items-center gap-2">
              {loading && <Loader2 className="h-4 w-4 text-zinc-500 animate-spin mr-2" />}
              <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-zinc-500 opacity-100">
                <span className="text-xs">ESC</span>
              </kbd>
            </div>
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            {query.length < 2 ? (
              <Command.Group heading="Quick Navigation" className="px-2 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                {staticPages.map((page) => (
                  <Command.Item
                    key={page.href}
                    onValueChange={() => {}}
                    onSelect={() => onSelect(page.href)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 cursor-pointer hover:bg-white/5 hover:text-white aria-selected:bg-white/5 aria-selected:text-white transition-colors group"
                  >
                    <page.icon className="h-4 w-4 text-zinc-500 group-hover:text-indigo-400 group-aria-selected:text-indigo-400" />
                    <span>{page.name}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            ) : (
              <>
                <Command.Empty className="py-6 text-center text-sm text-zinc-500">
                  {loading ? "Searching Chronicles..." : "No results found for your quest."}
                </Command.Empty>
                
                {results.length > 0 && (
                  <Command.Group heading="Chronicles Search Results" className="px-2 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    {results.map((result) => (
                      <Command.Item
                        key={`${result.type}-${result.id}`}
                        onSelect={() => onSelect(result.href)}
                        className="flex items-center justify-between gap-3 px-3 py-3 rounded-lg text-sm text-white cursor-pointer hover:bg-white/5 aria-selected:bg-white/5 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0">
                            <Sparkles className="h-4 w-4 text-zinc-500" />
                          </div>
                          <span className="truncate">{result.title}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] uppercase tracking-tighter text-zinc-500 border-white/10 group-hover:border-white/20">
                          {result.type}
                        </Badge>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
              </>
            )}
          </Command.List>

          <div className="flex items-center justify-between border-t border-white/5 px-4 py-2 bg-black/20 text-[10px] text-zinc-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5">Enter</kbd>
                <span>to select</span>
              </div>
            </div>
            <span>Type to search across the Chronicles</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
