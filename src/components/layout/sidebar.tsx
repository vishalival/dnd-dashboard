"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	BookOpen,
	CalendarClock,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Command,
	GitBranch,
	KeyRound,
	LayoutDashboard,
	Moon,
	NotebookPen,
	RotateCcw,
	Search,
	Shield,
	Sun,
	Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import type { LucideIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useCampaignStore } from "@/stores/campaign-store";
import { useChroniclerStore } from "@/stores/chronicler-store";
import { AgentLogStrip } from "./agent-log-strip";

interface NavItem {
	label: string;
	href: string;
	icon: LucideIcon;
	color: string;
	dataTour?: string;
	children?: NavItem[];
}

const navItems: NavItem[] = [
	{
		label: "Overview",
		href: "/dashboard",
		icon: LayoutDashboard,
		color: "text-indigo-400",
		dataTour: "nav-dashboard",
	},
	{
		label: "Tome of Schemes",
		href: "/notes",
		icon: NotebookPen,
		color: "text-orange-400",
		dataTour: "nav-notes",
	},
	{
		label: "Session Planner",
		href: "/sessions",
		icon: CalendarClock,
		color: "text-sky-400",
		dataTour: "nav-sessions",
		children: [
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
		],
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
	const router = useRouter();
	const { sidebarOpen, toggleSidebar, toggleCommandPalette } =
		useCampaignStore();
	const isRecording = useChroniclerStore((s) => s.phase === "recording");
	const { theme, setTheme } = useTheme();
	const [showResetConfirm, setShowResetConfirm] = useState(false);
	const [resetting, setResetting] = useState(false);
	const [sessionPlannerOpen, setSessionPlannerOpen] = useState(true);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const handleReset = async () => {
		setResetting(true);
		try {
			const res = await fetch("/api/reset", { method: "POST" });
			if (!res.ok) throw new Error("Reset failed");
			router.push("/");
		} catch (err) {
			console.error("Reset failed:", err);
			setResetting(false);
			setShowResetConfirm(false);
		}
	};

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
			animate={{ width: sidebarOpen ? 260 : 72 }}
			transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
			className="fixed left-0 top-0 z-40 h-screen border-r border-border bg-secondary dark:bg-[#0A0A0B] flex flex-col overflow-hidden"
		>
			{/* Header / Logo */}
			<div className="flex items-center h-20 px-4 mb-4 shrink-0">
				<a href="/dashboard">
					<Image src={mounted && theme === "light" ? "/darcmind_black.svg" : "/darcmind_white.svg"} alt="DarcMind" width={140} height={33} priority />
				</a>

				<div className="ml-auto flex items-center gap-1 shrink-0">
					<button
						onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
						className="flex items-center justify-center w-7 h-7 rounded-md text-zinc-500 hover:text-foreground hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-all"
						title={mounted && theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
					>
						{mounted && theme === "light" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
					</button>
					<button
						onClick={toggleSidebar}
						className="flex items-center justify-center w-7 h-7 rounded-md text-zinc-500 hover:text-foreground hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-all"
						title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
					>
						{sidebarOpen ? (
							<ChevronLeft className="h-4 w-4" />
						) : (
							<ChevronRight className="h-4 w-4" />
						)}
					</button>
				</div>
			</div>

			{/* Search — hidden when collapsed */}
			<AnimatePresence initial={false}>
				{sidebarOpen && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.2 }}
						className="px-4 mb-6 shrink-0 overflow-hidden"
					>
						<button
							onClick={toggleCommandPalette}
							className="w-full h-10 px-3 flex items-center gap-3 rounded-lg bg-transparent border border-border text-muted-foreground hover:text-foreground transition-all"
						>
							<Search className="h-4 w-4 shrink-0" />
							<span className="text-sm font-medium flex-1 text-left">
								Search
							</span>
							<Command className="h-3.5 w-3.5 opacity-50" />
						</button>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Navigation */}
			<nav className="flex-1 w-full px-2 space-y-1 overflow-y-auto scrollbar-thin">
				{navItems.map((item) => {
					const hasChildren = item.children && item.children.length > 0;
					const childActive = hasChildren && item.children!.some(
						(child) => pathname === child.href || pathname?.startsWith(child.href),
					);
					const isActive =
						pathname === item.href ||
						(item.href !== "/dashboard" && pathname?.startsWith(item.href)) ||
						childActive;

					return (
						<div key={item.href}>
							<div className="flex items-center w-full">
								<Link href={item.href} className="block flex-1 min-w-0">
									<div
										data-tour={item.dataTour}
										title={!sidebarOpen ? item.label : undefined}
										className={cn(
											"flex items-center gap-3 w-full h-11 px-3 rounded-xl transition-all duration-300 group",
											!sidebarOpen && "justify-center px-0 rounded-lg border-l-0",
											isActive
												? cn(
														"bg-gradient-to-r from-black/[0.06] dark:from-white/[0.08] to-transparent text-foreground dark:text-white",
														sidebarOpen && "border-l-2 border-indigo-400",
													)
												: cn(
														"text-foreground/60 dark:text-zinc-400 hover:text-foreground dark:hover:text-zinc-200 hover:bg-black/[0.06] dark:hover:bg-white/[0.03]",
														sidebarOpen && "border-l-2 border-transparent",
													),
										)}
									>
										<item.icon
											className={cn(
												"h-4 w-4 transition-colors duration-300 shrink-0",
												isActive
													? item.color
													: "text-foreground/40 dark:text-zinc-500 group-hover:text-foreground/70 dark:group-hover:text-zinc-300",
											)}
										/>

										<AnimatePresence initial={false}>
											{sidebarOpen && (
												<motion.span
													initial={{ opacity: 0, width: 0 }}
													animate={{ opacity: 1, width: "auto" }}
													exit={{ opacity: 0, width: 0 }}
													transition={{ duration: 0.15 }}
													className="text-xs font-semibold tracking-widest uppercase truncate flex-1 overflow-hidden whitespace-nowrap"
												>
													{item.label}
												</motion.span>
											)}
										</AnimatePresence>

										{isRecording && item.href === "/sessions" && sidebarOpen && (
											<span className="relative flex h-2 w-2 shrink-0">
												<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
												<span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
											</span>
										)}
									</div>
								</Link>

								{hasChildren && sidebarOpen && (
									<button
										onClick={() => setSessionPlannerOpen((prev) => !prev)}
										className="flex items-center justify-center w-7 h-7 rounded-md text-foreground/40 dark:text-zinc-500 hover:text-foreground dark:hover:text-zinc-300 hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-all shrink-0 mr-1"
									>
										<motion.div
											animate={{ rotate: sessionPlannerOpen ? 0 : -90 }}
											transition={{ duration: 0.2 }}
										>
											<ChevronDown className="h-3.5 w-3.5" />
										</motion.div>
									</button>
								)}
							</div>

							{/* Children */}
							{hasChildren && sidebarOpen && (
								<AnimatePresence initial={false}>
									{sessionPlannerOpen && (
										<motion.div
											initial={{ height: 0, opacity: 0 }}
											animate={{ height: "auto", opacity: 1 }}
											exit={{ height: 0, opacity: 0 }}
											transition={{ duration: 0.2 }}
											className="overflow-hidden"
										>
											{item.children!.map((child) => {
												const isChildActive =
													pathname === child.href ||
													pathname?.startsWith(child.href);
												return (
													<Link
														key={child.href}
														href={child.href}
														className="block w-full"
													>
														<div
															className={cn(
																"flex items-center gap-3 w-full h-10 pl-9 pr-3 rounded-xl transition-all duration-300 group",
																isChildActive
																	? "bg-gradient-to-r from-black/[0.06] dark:from-white/[0.06] to-transparent text-foreground dark:text-white"
																	: "text-foreground/60 dark:text-zinc-400 hover:text-foreground dark:hover:text-zinc-200 hover:bg-black/[0.06] dark:hover:bg-white/[0.03]",
															)}
														>
															<child.icon
																className={cn(
																	"h-3.5 w-3.5 transition-colors duration-300 shrink-0",
																	isChildActive
																		? child.color
																		: "text-foreground/40 dark:text-zinc-500 group-hover:text-foreground/70 dark:group-hover:text-zinc-300",
																)}
															/>
															<span className="text-xs font-semibold tracking-widest uppercase truncate flex-1">
																{child.label}
															</span>
														</div>
													</Link>
												);
											})}
										</motion.div>
									)}
								</AnimatePresence>
							)}
						</div>
					);
				})}
			</nav>

			{/* Agent Log Strip — only when sidebar is expanded */}
			{sidebarOpen && <AgentLogStrip />}

			{/* Reset Confirmation Overlay */}
			<AnimatePresence>
				{showResetConfirm && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
					>
						<div className="bg-card border border-red-500/30 rounded-xl p-5 max-w-[220px] space-y-3 text-center">
							<p className="text-sm font-semibold text-white">
								Reset Campaign?
							</p>
							<p className="text-xs text-zinc-400">
								This will delete all data and return to onboarding.
							</p>
							<div className="flex gap-2">
								<button
									onClick={() => setShowResetConfirm(false)}
									disabled={resetting}
									className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-white/10 text-zinc-300 hover:bg-white/5 transition-colors"
								>
									Cancel
								</button>
								<button
									onClick={handleReset}
									disabled={resetting}
									className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50"
								>
									{resetting ? "Resetting..." : "Reset"}
								</button>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Profile */}
			<div className="p-3 mt-auto border-t border-[#1F1F22] shrink-0 space-y-2">
				{/* Reset Button */}
				<button
					onClick={() => setShowResetConfirm(true)}
					title="Reset campaign & re-onboard"
					className={cn(
						"flex items-center gap-3 w-full h-9 px-3 rounded-lg text-foreground/50 dark:text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all text-sm",
						!sidebarOpen && "justify-center px-0",
					)}
				>
					<RotateCcw className="h-4 w-4 shrink-0" />
					<AnimatePresence initial={false}>
						{sidebarOpen && (
							<motion.span
								initial={{ opacity: 0, width: 0 }}
								animate={{ opacity: 1, width: "auto" }}
								exit={{ opacity: 0, width: 0 }}
								transition={{ duration: 0.15 }}
								className="font-medium truncate overflow-hidden whitespace-nowrap"
							>
								Reset Campaign
							</motion.span>
						)}
					</AnimatePresence>
				</button>

				<div
					className={cn(
						"flex items-center gap-3 p-3 rounded-xl bg-card border border-border",
						!sidebarOpen && "justify-center p-2",
					)}
				>
					<div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
						<span className="text-xs font-semibold text-white">{initials}</span>
					</div>
					<AnimatePresence initial={false}>
						{sidebarOpen && (
							<motion.div
								initial={{ opacity: 0, width: 0 }}
								animate={{ opacity: 1, width: "auto" }}
								exit={{ opacity: 0, width: 0 }}
								transition={{ duration: 0.15 }}
								className="min-w-0 flex-1 overflow-hidden"
							>
								<p className="text-xs font-bold uppercase tracking-widest text-foreground truncate whitespace-nowrap">
									{displayName}
								</p>
								<p className="text-[10px] text-zinc-500 uppercase tracking-widest truncate whitespace-nowrap">
									Dungeon Master
								</p>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</motion.aside>
	);
}
