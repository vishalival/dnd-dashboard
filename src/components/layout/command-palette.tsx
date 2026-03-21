"use client";

import React, { useEffect, useCallback } from "react";
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
} from "lucide-react";
import { useCampaignStore } from "@/stores/campaign-store";

const pages = [
  { name: "Command Center", href: "/dashboard", icon: LayoutDashboard },
  { name: "Session Planner", href: "/sessions", icon: CalendarClock },
  { name: "Story Timeline", href: "/storylines", icon: GitBranch },
  { name: "NPC Tracker", href: "/npcs", icon: Users },
  { name: "Secrets & Goals", href: "/secrets", icon: KeyRound },
  { name: "DM Journal", href: "/journal", icon: BookOpen },
  { name: "Party Hub", href: "/party", icon: Shield },
  { name: "Magic Items", href: "/wishlists", icon: Sparkles },
];

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, toggleCommandPalette } = useCampaignStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggleCommandPalette();
      }
    },
    [toggleCommandPalette]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={toggleCommandPalette}
      />
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg">
        <Command className="rounded-xl border border-white/[0.08] bg-zinc-900/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          <Command.Input
            placeholder="Search pages, NPCs, storylines..."
            className="w-full px-4 py-4 text-sm bg-transparent border-b border-white/[0.06] text-white placeholder:text-zinc-500 outline-none"
            autoFocus
          />
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-zinc-500">
              No results found.
            </Command.Empty>
            <Command.Group heading="Pages" className="text-xs text-zinc-500 px-2 py-1.5">
              {pages.map((page) => (
                <Command.Item
                  key={page.href}
                  value={page.name}
                  onSelect={() => {
                    router.push(page.href);
                    toggleCommandPalette();
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 cursor-pointer data-[selected=true]:bg-white/[0.06] data-[selected=true]:text-white transition-colors"
                >
                  <page.icon className="h-4 w-4 text-zinc-500" />
                  {page.name}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
