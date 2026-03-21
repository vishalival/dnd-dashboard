import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeDate(
  date: Date | string | null | undefined,
): string {
  if (!date) return "—";
  const d = new Date(date);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  return formatDate(date);
}

export function parseJsonField<T>(
  field: string | null | undefined,
  fallback: T[] = [] as unknown as T[],
): T[] {
  if (!field) return fallback;
  try {
    return JSON.parse(field);
  } catch {
    return fallback;
  }
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-400/10 dark:border-emerald-400/20",
    resolved: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-400/10 dark:border-blue-400/20",
    dormant: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-400/10 dark:border-amber-400/20",
    failed: "text-red-500 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-400/10 dark:border-red-400/20",
    draft: "text-zinc-500 bg-zinc-50 border-zinc-200 dark:text-zinc-400 dark:bg-zinc-400/10 dark:border-zinc-400/20",
    planning: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-400/10 dark:border-amber-400/20",
    ready: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-400/10 dark:border-emerald-400/20",
    completed: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-400/10 dark:border-blue-400/20",
    alive: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-400/10 dark:border-emerald-400/20",
    dead: "text-red-500 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-400/10 dark:border-red-400/20",
    missing: "text-purple-500 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-400/10 dark:border-purple-400/20",
    hostile: "text-red-500 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-400/10 dark:border-red-400/20",
    ally: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-400/10 dark:border-emerald-400/20",
    unknown: "text-zinc-500 bg-zinc-50 border-zinc-200 dark:text-zinc-400 dark:bg-zinc-400/10 dark:border-zinc-400/20",
    revealed: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-300/10 dark:border-amber-300/20",
    abandoned: "text-zinc-500 bg-zinc-50 border-zinc-200 dark:text-zinc-500 dark:bg-zinc-500/10 dark:border-zinc-500/20",
    visible: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-400/10 dark:border-emerald-400/20",
    partial: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-400/10 dark:border-amber-400/20",
    dm_only: "text-purple-500 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-400/10 dark:border-purple-400/20",
  };
  return colors[status] || "text-zinc-500 bg-zinc-50 border-zinc-200 dark:text-zinc-400 dark:bg-zinc-400/10 dark:border-zinc-400/20";
}

export function getUrgencyColor(urgency: string): string {
  const colors: Record<string, string> = {
    low: "text-zinc-500 bg-zinc-50 border border-zinc-200 dark:text-zinc-400 dark:bg-zinc-400/10 dark:border-transparent",
    medium: "text-amber-600 bg-amber-50 border border-amber-200 dark:text-amber-400 dark:bg-amber-400/10 dark:border-transparent",
    high: "text-orange-600 bg-orange-50 border border-orange-200 dark:text-orange-400 dark:bg-orange-400/10 dark:border-transparent",
    critical: "text-red-500 bg-red-50 border border-red-200 dark:text-red-400 dark:bg-red-400/10 dark:border-transparent",
  };
  return colors[urgency] || "text-zinc-500 bg-zinc-50 border border-zinc-200 dark:text-zinc-400 dark:bg-zinc-400/10 dark:border-transparent";
}

export function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: "text-foreground dark:text-zinc-300",
    uncommon: "text-emerald-600 dark:text-emerald-400",
    rare: "text-blue-600 dark:text-blue-400",
    very_rare: "text-purple-500 dark:text-purple-400",
    legendary: "text-amber-600 dark:text-amber-400",
    artifact: "text-red-500 dark:text-red-400",
  };
  return colors[rarity] || "text-foreground dark:text-zinc-300";
}
