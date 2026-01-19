"use client";

import { useQuery } from "@tanstack/react-query";
import EventCard from "./eventCard";
import { callApi } from "@/app/libs/helper/callApi";
import { ApiResponse } from "@/app/types";
import { EventCardData } from "@/app/types";
import { Calendar } from "lucide-react";

// Skeleton component
function EventCardSkeleton() {
	return (
		<div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm animate-pulse">
			<div className="h-52 w-full bg-gray-200" />
			<div className="p-5 space-y-3">
				<div className="h-5 bg-gray-200 w-3/4 rounded" />
				<div className="h-4 bg-gray-200 w-full rounded" />
				<div className="h-4 bg-gray-200 w-5/6 rounded" />
				<div className="space-y-2">
					<div className="h-3 bg-gray-200 w-1/2 rounded" />
					<div className="h-3 bg-gray-200 w-1/2 rounded" />
					<div className="h-3 bg-gray-200 w-1/2 rounded" />
				</div>
			</div>
		</div>
	);
}

interface EventsListProps {
	selectedCategory: string;
	searchQuery: string;
}

export default function EventsList({ selectedCategory, searchQuery }: EventsListProps) {
	const { data, isLoading, isFetching, error } = useQuery({
		queryKey: ["events"],
		queryFn: async () => {
			const response = await callApi<ApiResponse<any[]>>(
				"/events",
				"GET"
			);
			if (response.error) {
				throw new Error(response.error.message);
			}
			return response.data?.data || [];
		},
		staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
		gcTime: 30 * 60 * 1000, // Cache for 30 minutes
		refetchOnMount: true, // Refetch when component mounts (in background if data exists)
		refetchOnWindowFocus: true, // Refetch when window regains focus
		refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes in background
	});

	// Filter events by category and search query
	const filteredEvents = data?.filter((event) => {
		const matchesCategory = selectedCategory === "All Events" || event.category === selectedCategory;
		const matchesSearch = searchQuery === "" ||
			event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			event.location?.toLowerCase().includes(searchQuery.toLowerCase());

		// Only show approved events
		const isApproved = event.status === "upcoming" || event.status === "ongoing";

		return matchesCategory && matchesSearch && isApproved;
	}) || [];

	// Only show skeleton on initial load (no cached data)
	if (isLoading && !data) {
		return (
			<>
				{[...Array(3)].map((_, i) => (
					<EventCardSkeleton key={i} />
				))}
			</>
		);
	}

	if (error) {
		return (
			<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
				<p className="text-red-500 text-sm">
					Failed to load events. Please try again.
				</p>
			</div>
		);
	}

	if (filteredEvents.length === 0) {
		return (
			<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
				<Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
				<p className="text-gray-500 text-sm font-medium">No events found</p>
				<p className="text-gray-400 text-xs mt-2">
					{searchQuery ? "Try adjusting your search terms" :
					selectedCategory !== "All Events" ? `No events in ${selectedCategory} category` :
					"Check back soon for upcoming events!"}
				</p>
			</div>
		);
	}

	return (
		<>
			{filteredEvents.map((event, index) => (
				<EventCard key={event.id || index} event={event} />
			))}
		</>
	);
}
