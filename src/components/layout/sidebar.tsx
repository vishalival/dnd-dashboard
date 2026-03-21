"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarClock,
  GitBranch,
  Users,
  KeyRound,
  BookOpen,
  Shield,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Search,
  Command,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCampaignStore } from "@/stores/campaign-store";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

const navItems = [
  {
    label: "Command Center",
    href: "/dashboard",
    icon: LayoutDashboard,
    color: "text-amber-600 dark:text-gold",
  },
  {
    label: "Session Planner",
    href: "/sessions",
    icon: CalendarClock,
    color: "text-amber-600 dark:text-amber-400",
  },
  {
    label: "Story Timeline",
    href: "/storylines",
    icon: GitBranch,
    color: "text-blue-600 dark:text-arcane-light",
  },
  {
    label: "NPC Tracker",
    href: "/npcs",
    icon: Users,
    color: "text-emerald-600 dark:text-emerald-400",
  },
  {
    label: "Secrets & Goals",
    href: "/secrets",
    icon: KeyRound,
    color: "text-purple-600 dark:text-purple-400",
  },
  {
    label: "DM Journal",
    href: "/journal",
    icon: BookOpen,
    color: "text-red-600 dark:text-crimson-light",
  },
  {
    label: "Party Hub",
    href: "/party",
    icon: Shield,
    color: "text-blue-400",
  },
  {
    label: "Magic Items",
    href: "/wishlists",
    icon: Sparkles,
    color: "text-amber-600 dark:text-amber-300",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, toggleCommandPalette } =
    useCampaignStore();
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 260 : 72 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 z-40 h-screen border-r border-border dark:border-white/[0.06] bg-background/95 dark:bg-zinc-950/80 backdrop-blur-xl flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center h-16 px-4 border-b border-border dark:border-white/[0.06]">
        <AnimatePresence mode="wait">
          {sidebarOpen ? (
            <motion.div
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shrink-0">
                <span className="text-sm font-heading font-bold text-zinc-900">
                  DM
                </span>
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-heading font-semibold dark:text-gold-light text-foreground truncate">
                  Campaign HQ
                </h1>
                <p className="text-[10px] text-muted-foreground truncate">
                  Dungeon Master OS
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="mini"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center flex-1"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
                <span className="text-sm font-heading font-bold text-zinc-900">
                  DM
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search / Command */}
      <div className="px-3 py-3">
        <Button
          variant="ghost"
          onClick={toggleCommandPalette}
          className={cn(
            "w-full justify-start gap-2 text-muted-foreground hover:text-foreground h-9",
            !sidebarOpen && "justify-center px-0",
          )}
        >
          <Search className="h-4 w-4 shrink-0" />
          {sidebarOpen && (
            <>
              <span className="text-xs flex-1 text-left">Search...</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border dark:border-white/[0.06] bg-muted dark:bg-zinc-800 px-1.5 font-mono text-[10px] font-medium text-muted-foreground dark:text-zinc-400">
                <Command className="h-3 w-3" />K
              </kbd>
            </>
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group relative",
                  isActive
                    ? "bg-muted/80 dark:bg-white/[0.06] text-foreground dark:text-white"
                    : "text-muted-foreground dark:text-zinc-400 hover:text-foreground dark:text-zinc-200 hover:bg-card hover:bg-muted/60 dark:bg-white/[0.03]",
                  !sidebarOpen && "justify-center px-0",
                )}
              >

                <item.icon
                  className={cn(
                    "h-4.5 w-4.5 shrink-0 transition-colors",
                    isActive
                      ? item.color
                      : "text-muted-foreground dark:text-zinc-500 group-hover:text-foreground/80 dark:text-zinc-300",
                  )}
                  style={{ width: 18, height: 18 }}
                />
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Toggle */}
      <div className="px-3 py-3 border-t border-border flex flex-col gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={cn(
            "w-full text-muted-foreground dark:text-zinc-500 hover:text-foreground/80 dark:text-zinc-300 h-8 dark:text-muted-foreground dark:text-zinc-500 dark:hover:text-foreground/80 dark:text-zinc-300 dark:bg-transparent text-muted-foreground dark:text-zinc-600 hover:text-zinc-900 bg-transparent",
            !sidebarOpen && "justify-center px-0",
          )}
        >
          {!mounted ? (
            <Moon className="h-4 w-4" />
          ) : theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          {sidebarOpen && <span className="text-xs ml-2">Toggle Theme</span>}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className={cn(
            "w-full text-muted-foreground dark:text-zinc-500 hover:text-foreground/80 dark:text-zinc-300 h-8",
            !sidebarOpen && "justify-center px-0",
          )}
        >
          {sidebarOpen ? (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="text-xs">Collapse</span>
            </>
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>
    </motion.aside>
  );
}
