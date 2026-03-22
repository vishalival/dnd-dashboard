"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { driver, type DriveStep, type Driver } from "driver.js";
import "driver.js/dist/driver.css";

const STORAGE_KEY = "onboarding-tour-seen";

function waitForElement(selector: string, timeout = 3000): Promise<Element | null> {
	return new Promise((resolve) => {
		const el = document.querySelector(selector);
		if (el) return resolve(el);

		const observer = new MutationObserver(() => {
			const found = document.querySelector(selector);
			if (found) {
				observer.disconnect();
				resolve(found);
			}
		});

		observer.observe(document.body, { childList: true, subtree: true });
		setTimeout(() => {
			observer.disconnect();
			resolve(null);
		}, timeout);
	});
}

interface TourPage {
	navSelector: string;
	pageSelector: string;
	href: string;
	nav: { title: string; description: string };
	page: { title: string; description: string };
}

const tourPages: TourPage[] = [
	{
		navSelector: '[data-tour="nav-dashboard"]',
		pageSelector: '[data-tour-page="dashboard"]',
		href: "/dashboard",
		nav: {
			title: "Overview",
			description: "Start here — your campaign command center.",
		},
		page: {
			title: "Your Campaign at a Glance",
			description:
				"See upcoming sessions, track campaign stats, pinned NPCs, and recent activity all in one place.",
		},
	},
	{
		navSelector: '[data-tour="nav-sessions"]',
		pageSelector: '[data-tour-page="sessions"]',
		href: "/sessions",
		nav: {
			title: "Session Planner",
			description: "Head here to plan and run your sessions.",
		},
		page: {
			title: "Plan & Run Sessions",
			description:
				"Create sessions, set agendas, track encounters, and record live sessions with AI-powered transcription. Expand the sidebar to find Story Timeline, NPC Tracker, and more.",
		},
	},
	{
		navSelector: '[data-tour="nav-notes"]',
		pageSelector: '[data-tour-page="notes"]',
		href: "/notes",
		nav: {
			title: "Tome of Schemes",
			description: "Your personal notebook for plots and plans.",
		},
		page: {
			title: "Organize Your Campaign Notes",
			description:
				"Write and organize notes, plot threads, and secret plans. The Chronicle AI consults these pages when fate unfolds at the table.",
		},
	},
];

export function OnboardingTour() {
	const router = useRouter();
	const pathname = usePathname();
	const driverRef = useRef<Driver | null>(null);

	useEffect(() => {
		if (localStorage.getItem(STORAGE_KEY)) return;

		// Build steps: for each page, first highlight sidebar nav, then navigate & highlight page
		const steps: DriveStep[] = [];
		tourPages.forEach((tp, i) => {
			// Step 1: highlight the sidebar nav item
			steps.push({
				element: tp.navSelector,
				popover: {
					title: tp.nav.title,
					description: tp.nav.description,
					side: "right",
					align: "center",
					onNextClick: () => {
						// Navigate to the page, then wait for it to render before advancing
						router.push(tp.href);
						waitForElement(tp.pageSelector).then(() => {
							driverRef.current?.moveNext();
						});
					},
				},
			});
			// Step 2: highlight the page content
			steps.push({
				element: tp.pageSelector,
				popover: {
					title: tp.page.title,
					description: tp.page.description,
					side: "bottom",
					align: "start",
					// On the last page step, use default behavior (done button)
					...(i < tourPages.length - 1
						? {
								onPrevClick: () => {
									driverRef.current?.movePrevious();
								},
							}
						: {}),
				},
			});
		});

		const timeout = setTimeout(() => {
			const driverObj = driver({
				showProgress: true,
				animate: true,
				allowClose: true,
				popoverClass: "dnd-tour-popover",
				nextBtnText: "Next",
				prevBtnText: "Back",
				doneBtnText: "Let's go!",
				onDestroyStarted: () => {
					localStorage.setItem(STORAGE_KEY, "true");
					driverObj.destroy();
				},
				steps,
			});

			driverRef.current = driverObj;
			driverObj.drive();
		}, 800);

		return () => clearTimeout(timeout);
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	return null;
}
