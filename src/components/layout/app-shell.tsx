"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sidebar } from "./sidebar";
import { CommandPalette } from "./command-palette";
import { useCampaignStore } from "@/stores/campaign-store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useCampaignStore();

  return (
    <div className="min-h-screen">
      <Sidebar />
      <CommandPalette />
      <motion.main
        initial={false}
        animate={{ marginLeft: sidebarOpen ? 260 : 72 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="min-h-screen"
      >
        <div className="px-6 py-6 max-w-[1600px] mx-auto">{children}</div>
      </motion.main>
    </div>
  );
}
