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

export function formatRelativeDate(date: Date | string | null | undefined): string {
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

export function parseJsonField<T>(field: string | null | undefined, fallback: T[] = [] as unknown as T[]): T[] {
  if (!field) return fallback;
  try {
    return JSON.parse(field);
  } catch {
    return fallback;
  }
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    resolved: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    dormant: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    failed: "text-red-400 bg-red-400/10 border-red-400/20",
    draft: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
    planning: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    ready: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    completed: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    alive: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    dead: "text-red-400 bg-red-400/10 border-red-400/20",
    missing: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    hostile: "text-red-400 bg-red-400/10 border-red-400/20",
    ally: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    unknown: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
    revealed: "text-amber-300 bg-amber-300/10 border-amber-300/20",
    abandoned: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20",
    visible: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    partial: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    dm_only: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  };
  return colors[status] || "text-zinc-400 bg-zinc-400/10 border-zinc-400/20";
}

export function getUrgencyColor(urgency: string): string {
  const colors: Record<string, string> = {
    low: "text-zinc-400 bg-zinc-400/10",
    medium: "text-amber-400 bg-amber-400/10",
    high: "text-orange-400 bg-orange-400/10",
    critical: "text-red-400 bg-red-400/10",
  };
  return colors[urgency] || "text-zinc-400 bg-zinc-400/10";
}

export function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: "text-zinc-300",
    uncommon: "text-emerald-400",
    rare: "text-blue-400",
    very_rare: "text-purple-400",
    legendary: "text-amber-400",
    artifact: "text-red-400",
  };
  return colors[rarity] || "text-zinc-300";
}
