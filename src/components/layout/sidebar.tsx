"use client";

import { motion } from "framer-motion";
import {
	BookOpen,
	CalendarClock,
	ChevronLeft,
	ChevronRight,
	Command,
	GitBranch,
	KeyRound,
	LayoutDashboard,
	NotebookPen,
	Search,
	Shield,
	Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCampaignStore } from "@/stores/campaign-store";
import { useChroniclerStore } from "@/stores/chronicler-store";

const navItems = [
	{
		label: "Overview",
		href: "/dashboard",
		icon: LayoutDashboard,
		color: "text-indigo-400",
	},
	{
		label: "Tome of Schemes",
		href: "/notes",
		icon: NotebookPen,
		color: "text-orange-400",
	},
	{
		label: "Session Planner",
		href: "/sessions",
		icon: CalendarClock,
		color: "text-sky-400",
	},
	{
		label: "Story Timeline",
		href: "/storylines",
		icon: GitBranch,
		color: "text-purple-400",
	},
	{
		label: "NPC Tracker",
		href: "/npcs",
		icon: Users,
		color: "text-emerald-400",
	},
	{
		label: "Secrets & Goals",
		href: "/secrets",
		icon: KeyRound,
		color: "text-pink-400",
	},
	{
		label: "DM Journal",
		href: "/journal",
		icon: BookOpen,
		color: "text-rose-400",
	},
	{
		label: "Party Hub",
		href: "/party",
		icon: Shield,
		color: "text-blue-400",
	},
];

export function Sidebar({
	dmName,
	campaignName,
}: {
	dmName: string | null;
	campaignName: string | null;
}) {
	const pathname = usePathname();
	const { toggleCommandPalette } = useCampaignStore();
	const isRecording = useChroniclerStore((s) => s.phase === "recording");

	const displayName = dmName || "Dungeon Master";
	const initials = displayName
		.split(" ")
		.map((w) => w[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<motion.aside
			initial={false}
			animate={{ width: 260 }}
			transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
			className="fixed left-0 top-0 z-40 h-screen border-r border-[#1F1F22] bg-[#0A0A0B] flex flex-col"
		>
			{/* Header / Logo */}
			<div className="flex items-center px-6 h-20 mb-4">
				<Image src="/logo.svg" alt="Logo" width={140} height={33} priority />
			</div>

			{/* Command */}
			<div className="px-4 mb-6">
				<button
					onClick={toggleCommandPalette}
					className="w-full h-10 px-3 flex items-center gap-3 rounded-lg bg-transparent border border-[#1F1F22] text-zinc-500 hover:text-zinc-300 hover:border-[#2A2A2D] transition-all"
				>
					<Search className="h-4 w-4 shrink-0" />
					<span className="text-sm font-medium flex-1 text-left">Search</span>
					<Command className="h-3.5 w-3.5 opacity-50" />
				</button>
			</div>

			{/* Navigation */}
			<nav className="flex-1 w-full px-4 space-y-1.5 overflow-y-auto scrollbar-thin flex flex-col">
				{navItems.map((item) => {
					const isActive =
						pathname === item.href ||
						(item.href !== "/dashboard" && pathname?.startsWith(item.href));
					return (
						<Link key={item.href} href={item.href} className="w-full">
							<div
								className={cn(
									"flex items-center gap-3 w-full h-11 px-3 rounded-xl transition-all duration-300 group",
									isActive
										? "bg-gradient-to-r from-white/[0.08] to-transparent text-white border-l-2 border-indigo-400"
										: "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] border-l-2 border-transparent",
								)}
							>
								<item.icon
									className={cn(
										"h-4 w-4 transition-colors duration-300 shrink-0",
										isActive
											? item.color
											: "text-zinc-500 group-hover:text-zinc-300",
									)}
								/>
								<span className="text-sm font-medium tracking-wide truncate flex-1">
									{item.label}
								</span>
								{isRecording && item.href === "/sessions" && (
									<span className="relative flex h-2 w-2 shrink-0">
										<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
										<span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
									</span>
								)}
							</div>
						</Link>
					);
				})}
			</nav>

			{/* Bottom Profile */}
			<div className="p-4 mt-auto border-t border-[#1F1F22]">
				<div className="flex items-center gap-3 p-3 rounded-xl bg-[#141416] border border-[#1F1F22]">
					<div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
						<span className="text-xs font-semibold text-white">{initials}</span>
					</div>
					<div className="min-w-0 flex-1">
						<p className="text-sm font-medium text-white truncate">
							{displayName}
						</p>
						<p className="text-[10px] text-zinc-500 truncate">Dungeon Master</p>
					</div>
				</div>
			</div>
		</motion.aside>
	);
}
