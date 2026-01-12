"use client";

import Link from "next/link";
import { Plus, Search, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import EventsList from "./event-components/EventsList";
import EventStatusTabs from "./event-components/eventStatusTabs";
import { useSession } from "@/app/store/useSession";
import { useAuthModal } from "@/app/store/useAuthModal";
import { useQuery } from "@tanstack/react-query";
import { callApi } from "@/app/libs/helper/callApi";
import { ApiResponse } from "@/app/types";
import { EVENT_CATEGORIES } from "@/app/constants/eventCategories";

export default function Events() {
	const { user } = useSession((state) => state);
	const [selectedCategory, setSelectedCategory] = useState("All Events");
	const [searchQuery, setSearchQuery] = useState("");
	const [showDropdown, setShowDropdown] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

	// Number of categories to show before dropdown
	const VISIBLE_CATEGORIES = 5;
	const visibleCategories = EVENT_CATEGORIES.slice(0, VISIBLE_CATEGORIES);
	const dropdownCategories = EVENT_CATEGORIES.slice(VISIBLE_CATEGORIES);

	// Close dropdown when clicking outside or scrolling
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			// Only close if clicking outside both the dropdown and button
			const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(event.target as Node);
			const isOutsideButton = buttonRef.current && !buttonRef.current.contains(event.target as Node);

			if (isOutsideDropdown && isOutsideButton) {
				setShowDropdown(false);
			}
		};

		const handleScroll = () => {
			if (showDropdown) {
				setShowDropdown(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		window.addEventListener("scroll", handleScroll, true); // true for capture phase to catch all scroll events

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			window.removeEventListener("scroll", handleScroll, true);
		};
	}, [showDropdown]);

	// Handle dropdown toggle and position calculation
	const handleDropdownToggle = () => {
		if (showDropdown) {
			setShowDropdown(false);
			return;
		}

		if (buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			setDropdownPosition({
				top: rect.bottom + 8,
				right: window.innerWidth - rect.right,
			});
		}
		setShowDropdown(true);
	};

	return (
		<>
			{/* Header Section */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white px-6 py-5 rounded-2xl border border-gray-200 shadow-sm">
				<div className="flex-1">
					<h2 className="text-xl font-bold text-gray-900">Upcoming Events</h2>
					<p className="text-sm text-gray-600">
						Connect With The Nigerian Community In Chicago
					</p>
				</div>

				<Link
					href="/events/create-event"
					className="flex items-center gap-2 justify-center px-4 py-2.5 rounded-lg text-sm font-medium bg-[var(--primary-color)] text-white w-full sm:w-auto hover:bg-[var(--primary-color)]/90 transition shadow-sm"
				>
					<Plus className="w-4 h-4" />
					<span className="whitespace-nowrap">Create Event</span>
				</Link>
			</div>

			{/* My Events - Mobile View (above search and events) */}
			<div className="lg:hidden mt-6">
				<EventStatus user={user} />
			</div>

			{/* Search and Filters - Full Width Above Both Columns */}
			<div className="flex flex-col gap-3 mt-6 bg-white px-4 py-4 rounded-2xl border border-gray-200 shadow-sm">
				<div className="relative flex-shrink-0 w-full">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
					<input
						type="text"
						placeholder="Search Events..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 focus:border-[var(--primary-color)] bg-white"
					/>
				</div>

				{/* Mobile: Horizontal scroll, Desktop: Wrap */}
				<div className="flex md:flex-wrap gap-2 overflow-x-auto pb-1 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
					{visibleCategories.map((category) => (
						<button
							key={category}
							onClick={() => setSelectedCategory(category)}
							className={`px-4 py-2 text-sm font-medium rounded-lg transition whitespace-nowrap flex-shrink-0 ${
								selectedCategory === category
									? "bg-[var(--primary-color)] text-white"
									: "bg-white text-gray-700 border border-gray-200 hover:border-[var(--primary-color)] hover:text-[var(--primary-color)]"
							}`}
						>
							{category}
						</button>
					))}

					{/* More Categories Button - Inside scrollable container */}
					<button
						ref={buttonRef}
						onClick={handleDropdownToggle}
						className={`px-4 py-2 text-sm font-medium rounded-lg transition whitespace-nowrap flex items-center gap-1 flex-shrink-0 ${
							dropdownCategories.includes(selectedCategory)
								? "bg-[var(--primary-color)] text-white"
								: "bg-white text-gray-700 border border-gray-200 hover:border-[var(--primary-color)] hover:text-[var(--primary-color)]"
						}`}
					>
						{dropdownCategories.includes(selectedCategory) ? selectedCategory : "More"}
						<ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
					</button>
				</div>

				{/* Dropdown Menu - Fixed position to escape overflow container */}
				{showDropdown && (
					<div
						ref={dropdownRef}
						className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 w-[200px] max-h-[300px] overflow-y-auto"
						style={{
							top: dropdownPosition.top,
							right: dropdownPosition.right,
						}}
					>
						{dropdownCategories.map((category) => (
							<button
								key={category}
								onClick={() => {
									setSelectedCategory(category);
									setShowDropdown(false);
								}}
								className={`w-full text-left px-4 py-2 text-sm transition ${
									selectedCategory === category
										? "bg-[var(--primary-color)] text-white"
										: "text-gray-700 hover:bg-gray-50"
								}`}
							>
								{category}
							</button>
						))}
					</div>
				)}
			</div>

			{/* Main Layout - Two Columns */}
			<main className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 mt-6">
				{/* Left Column - Event Cards */}
				<section className="space-y-4">
					<EventsList selectedCategory={selectedCategory} searchQuery={searchQuery} />
				</section>

				{/* Right Column - My Events - Desktop View (sticky sidebar) */}
				<aside className="sticky top-24 h-fit hidden lg:block">
					<EventStatus user={user} />
				</aside>
			</main>
		</>
	);
}

function EventStatus({ user }: { user: any }) {
	const { openSignIn } = useAuthModal((state) => state.actions);

	// Fetch attending events
	const { data: attendingData, refetch: refetchAttending } = useQuery({
		queryKey: ["attending-events"],
		queryFn: async () => {
			const response = await callApi<ApiResponse<any[]>>(
				"/events/user/attending",
				"GET"
			);
			return response.data?.data || [];
		},
		enabled: !!user, // Only fetch when user is logged in
		refetchOnMount: true, // Refetch when component mounts
		refetchOnWindowFocus: true, // Refetch when window regains focus
		staleTime: 0, // Always consider data stale for fresh data
	});

	// Fetch hosted events
	const { data: hostedData, refetch: refetchHosted } = useQuery({
		queryKey: ["hosted-events"],
		queryFn: async () => {
			const response = await callApi<ApiResponse<any[]>>(
				"/events/user/hosted",
				"GET"
			);
			return response.data?.data || [];
		},
		enabled: !!user, // Only fetch when user is logged in
		refetchOnMount: true, // Refetch when component mounts
		refetchOnWindowFocus: true, // Refetch when window regains focus
		staleTime: 0, // Always consider data stale for fresh data
	});

	// Fetch past events
	const { data: pastData, refetch: refetchPast } = useQuery({
		queryKey: ["past-events"],
		queryFn: async () => {
			const response = await callApi<ApiResponse<any[]>>(
				"/events/user/past",
				"GET"
			);
			return response.data?.data || [];
		},
		enabled: !!user, // Only fetch when user is logged in
		refetchOnMount: true, // Refetch when component mounts
		refetchOnWindowFocus: true, // Refetch when window regains focus
		staleTime: 0, // Always consider data stale for fresh data
	});

	// Format events for EventStatusTabs component
	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleDateString("en-US", {
			weekday: "long",
			month: "long",
			day: "numeric",
			year: "numeric",
		});
	};

	const formatDay = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleDateString("en-US", {
			weekday: "long",
			month: "short",
			day: "numeric"
		});
	};

	const attendingEvents = (attendingData || []).map((event: any) => ({
		eventName: event.title,
		numberOfAttendees: (event._count?.registrations || 0) + (event._count?.tickets || 0),
		date: formatDate(event.startDate),
	}));

	const hostedEvents = (hostedData || []).map((event: any) => ({
		eventName: event.title,
		eventStatus: event.status as "pending" | "approved" | "rejected" | "upcoming" | "active" | "ongoing" | "completed",
		numberOfAttendees: (event._count?.registrations || 0) + (event._count?.tickets || 0),
		daysOfWeek: formatDay(event.startDate),
	}));

	const pastEvents = (pastData || []).map((event: any) => ({
		eventName: event.title,
		numberOfAttendees: (event._count?.registrations || 0) + (event._count?.tickets || 0),
		date: formatDate(event.startDate),
	}));

	// Show sign-in prompt if user is not logged in
	if (!user) {
		return (
			<section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
				<h2 className="mb-4 text-base font-semibold text-gray-900">My Events</h2>
				<div className="text-center py-12 px-4">
					<div className="mb-4">
						<svg
							className="w-16 h-16 mx-auto text-gray-300"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
								d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
					</div>
					<h3 className="text-base font-semibold text-gray-900 mb-2">
						Sign in to view your events
					</h3>
					<p className="text-sm text-gray-600 mb-6">
						Track events you're attending, hosting, and your event history
					</p>
					<button
						onClick={() => openSignIn("view your events")}
						className="inline-block px-5 py-2.5 bg-[var(--primary-color)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--primary-color)]/90 transition-colors"
					>
						Sign In
					</button>
				</div>
			</section>
		);
	}

	return (
		<section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
			<h2 className="mb-4 text-base font-semibold text-gray-900">My Events</h2>
			<EventStatusTabs
				attendingEvents={attendingEvents}
				pastEvents={pastEvents}
				hostedEvents={hostedEvents}
				onTabChange={(tab) => {
					// Refetch data when tab changes
					if (tab === "attending") {
						refetchAttending();
					} else if (tab === "hosted") {
						refetchHosted();
					} else if (tab === "past") {
						refetchPast();
					}
				}}
			/>
		</section>
	);
}
