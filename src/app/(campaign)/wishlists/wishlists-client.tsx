"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Search, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { getRarityColor, cn } from "@/lib/utils";
import type { CampaignData } from "@/lib/data";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const rarityOrder: Record<string, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  very_rare: 3,
  legendary: 4,
  artifact: 5,
};

export function WishlistsClient({ campaign }: { campaign: CampaignData }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [rarityFilter, setRarityFilter] = useState<string>("all");

  const filtered = campaign.wishlists
    .filter((w) => {
      if (search && !w.itemName.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== "all" && w.status !== statusFilter) return false;
      if (rarityFilter !== "all" && w.rarity !== rarityFilter) return false;
      return true;
    })
    .sort((a, b) => (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0));

  // Group by character
  const grouped: Record<string, typeof filtered> = {};
  filtered.forEach((w) => {
    const name = w.character.name;
    if (!grouped[name]) grouped[name] = [];
    grouped[name].push(w);
  });

  return (
    <div>
      <PageHeader
        title="Magic Item Wishlists"
        subtitle="Track desired items, their rarity, and story connections"
        icon={<Sparkles className="h-5 w-5 text-amber-300" />}
        actions={
          <div className="flex gap-2">
            <Badge variant="gold">{campaign.wishlists.length} Items</Badge>
            <Badge variant="emerald">
              {campaign.wishlists.filter((w) => w.status === "obtained").length} Obtained
            </Badge>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/[0.03] border-white/[0.06]"
          />
        </div>
        <div className="flex gap-1.5">
          {["all", "rumored", "planned", "found", "obtained"].map((s) => (
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
        <div className="flex gap-1.5">
          {["all", "common", "uncommon", "rare", "very_rare", "legendary", "artifact"].map((r) => (
            <Button
              key={r}
              variant={rarityFilter === r ? "arcane" : "ghost"}
              size="sm"
              onClick={() => setRarityFilter(r)}
              className={cn("text-xs capitalize", r !== "all" && getRarityColor(r))}
            >
              {r === "all" ? "All Rarity" : r.replace(/_/g, " ")}
            </Button>
          ))}
        </div>
      </div>

      {/* Grouped by Character */}
      <div className="space-y-8">
        {Object.entries(grouped).map(([charName, items]) => (
          <div key={charName}>
            <h3 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-400/10 border border-blue-400/20 flex items-center justify-center">
                <span className="text-xs font-medium text-blue-400">
                  {charName.charAt(0)}
                </span>
              </div>
              {charName}
              <Badge variant="secondary" className="text-[10px] h-4">
                {items.length} items
              </Badge>
            </h3>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3"
            >
              {items.map((wish) => (
                <motion.div key={wish.id} variants={item} whileHover={{ y: -2 }}>
                  <Card className="hover:border-white/[0.1] transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Star className={cn("h-4 w-4", getRarityColor(wish.rarity))} />
                          <h4 className={cn("text-sm font-medium", getRarityColor(wish.rarity))}>
                            {wish.itemName}
                          </h4>
                        </div>
                        <StatusBadge status={wish.status} />
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] capitalize mb-2", getRarityColor(wish.rarity))}
                      >
                        {wish.rarity.replace(/_/g, " ")}
                      </Badge>
                      {wish.reason && (
                        <p className="text-xs text-zinc-400 mt-2">{wish.reason}</p>
                      )}
                      {wish.storyHook && (
                        <p className="text-xs text-gold/70 mt-2 italic border-t border-white/[0.04] pt-2">
                          {wish.storyHook}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
