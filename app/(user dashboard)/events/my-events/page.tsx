"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import {
	ArrowLeft,
	Calendar,
	Users,
	DollarSign,
	Download,
	ChevronRight,
	Loader2,
	MapPin,
	Clock,
	Ticket,
} from "lucide-react";
import { callApi } from "@/app/libs/helper/callApi";
import { ApiResponse } from "@/app/types";
import { useSession } from "@/app/store/useSession";
import { useAuthModal } from "@/app/store/useAuthModal";
import { toast } from "sonner";
import Image from "next/image";

interface OrganizerEvent {
	id: string;
	title: string;
	description: string;
	coverImage: string | null;
	startDate: string;
	endDate: string;
	startTime: string;
	endTime: string;
	venue: string;
	location: string;
	isFree: boolean;
	ticketPrice: number | null;
	totalTickets: number | null;
	availableTickets: number | null;
	status: string;
	totalAttendees: number;
	earnings: {
		totalRevenue: number;
		platformFees: number;
		netEarnings: number;
	} | null;
	_count: {
		registrations: number;
		tickets: number;
	};
}

interface Attendee {
	id: string;
	ticketCode?: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	quantity?: number;
	unitPrice?: number;
	totalPrice?: number;
	status: string;
	registeredAt?: string;
	purchasedAt?: string;
}

interface EventDetails extends OrganizerEvent {
	registrations: Attendee[];
	tickets: Attendee[];
	earningsSummary: {
		totalRevenue: number;
		platformFees: number;
		netEarnings: number;
		ticketsSold: number;
	} | null;
}

export default function MyEventsPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { user } = useSession((state) => state);
	const { openSignIn } = useAuthModal((state) => state.actions);
	const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
	const [isExporting, setIsExporting] = useState(false);

	// Handle eventId from URL query params
	useEffect(() => {
		const eventIdParam = searchParams.get('eventId');
		if (eventIdParam) {
			setSelectedEventId(eventIdParam);
			// Clear the URL param without reloading
			router.replace('/events/my-events', { scroll: false });
		}
	}, [searchParams, router]);

	// Fetch all organizer events
	const { data: events, isLoading: isLoadingEvents } = useQuery({
		queryKey: ["organizer-events"],
		queryFn: async () => {
			const response = await callApi<ApiResponse<OrganizerEvent[]>>(
				"/events/organizer/events",
				"GET"
			);
			return response.data?.data || [];
		},
		enabled: !!user,
	});

	// Fetch selected event details
	const { data: eventDetails, isLoading: isLoadingDetails } = useQuery({
		queryKey: ["organizer-event-details", selectedEventId],
		queryFn: async () => {
			const response = await callApi<ApiResponse<EventDetails>>(
				`/events/organizer/events/${selectedEventId}`,
				"GET"
			);
			return response.data?.data;
		},
		enabled: !!selectedEventId && !!user,
	});

	const handleExportCSV = async (eventId: string) => {
		setIsExporting(true);
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/events/organizer/events/${eventId}/export-csv`,
				{
					credentials: "include",
				}
			);

			if (!response.ok) {
				throw new Error("Failed to export");
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `attendees_${eventId}.csv`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
			toast.success("Attendees exported successfully");
		} catch (error) {
			toast.error("Failed to export attendees");
		} finally {
			setIsExporting(false);
		}
	};

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const formatTime = (time: string) => {
		const [hours, minutes] = time.split(":");
		const hour = parseInt(hours);
		const ampm = hour >= 12 ? "PM" : "AM";
		const hour12 = hour % 12 || 12;
		return `${hour12}:${minutes} ${ampm}`;
	};

	const getStatusBadge = (status: string) => {
		const styles: Record<string, string> = {
			pending: "bg-yellow-100 text-yellow-700",
			upcoming: "bg-green-100 text-green-700",
			ongoing: "bg-blue-100 text-blue-700",
			completed: "bg-gray-100 text-gray-700",
			cancelled: "bg-red-100 text-red-700",
		};
		return styles[status] || "bg-gray-100 text-gray-700";
	};

	// Show sign-in prompt if not logged in
	if (!user) {
		return (
			<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
				<Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
				<h2 className="text-xl font-semibold text-gray-900 mb-2">
					Sign in to view your events
				</h2>
				<p className="text-gray-600 mb-6">
					Manage your events, view attendees, and track earnings
				</p>
				<button
					onClick={() => openSignIn("view your events")}
					className="px-6 py-2.5 bg-[var(--primary-color)] text-white font-medium rounded-lg hover:bg-[var(--primary-color)]/90 transition"
				>
					Sign In
				</button>
			</div>
		);
	}

	// Show event details view
	if (selectedEventId && eventDetails) {
		const attendees = eventDetails.isFree
			? eventDetails.registrations
			: eventDetails.tickets;

		return (
			<div className="space-y-6">
				{/* Back Button */}
				<button
					onClick={() => setSelectedEventId(null)}
					className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
				>
					<ArrowLeft className="w-4 h-4" />
					Back to My Events
				</button>

				{/* Event Header */}
				<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
					{eventDetails.coverImage && (
						<div className="h-48 relative">
							<Image
								src={eventDetails.coverImage}
								alt={eventDetails.title}
								fill
								className="object-cover"
							/>
						</div>
					)}
					<div className="p-6">
						<div className="flex items-start justify-between gap-4">
							<div>
								<div className="flex items-center gap-2 mb-2">
									<h1 className="text-2xl font-bold text-gray-900">
										{eventDetails.title}
									</h1>
									<span
										className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(
											eventDetails.status
										)}`}
									>
										{eventDetails.status.charAt(0).toUpperCase() +
											eventDetails.status.slice(1)}
									</span>
								</div>
								<div className="flex flex-wrap gap-4 text-sm text-gray-600">
									<span className="flex items-center gap-1">
										<Calendar className="w-4 h-4" />
										{formatDate(eventDetails.startDate)}
									</span>
									<span className="flex items-center gap-1">
										<Clock className="w-4 h-4" />
										{formatTime(eventDetails.startTime)} -{" "}
										{formatTime(eventDetails.endTime)}
									</span>
									<span className="flex items-center gap-1">
										<MapPin className="w-4 h-4" />
										{eventDetails.venue || eventDetails.location}
									</span>
								</div>
							</div>
							<button
								onClick={() => handleExportCSV(eventDetails.id)}
								disabled={isExporting}
								className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition"
							>
								{isExporting ? (
									<Loader2 className="w-4 h-4 animate-spin" />
								) : (
									<Download className="w-4 h-4" />
								)}
								Export CSV
							</button>
						</div>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div className="bg-white rounded-xl border border-gray-200 p-5">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
								<Users className="w-5 h-5 text-blue-600" />
							</div>
							<div>
								<p className="text-sm text-gray-600">Total Attendees</p>
								<p className="text-xl font-bold text-gray-900">
									{attendees.length}
								</p>
							</div>
						</div>
					</div>

					{!eventDetails.isFree && eventDetails.earningsSummary && (
						<>
							<div className="bg-white rounded-xl border border-gray-200 p-5">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
										<DollarSign className="w-5 h-5 text-green-600" />
									</div>
									<div>
										<p className="text-sm text-gray-600">Total Revenue</p>
										<p className="text-xl font-bold text-gray-900">
											${eventDetails.earningsSummary.totalRevenue.toFixed(2)}
										</p>
									</div>
								</div>
							</div>

							<div className="bg-white rounded-xl border border-gray-200 p-5">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
										<Ticket className="w-5 h-5 text-emerald-600" />
									</div>
									<div>
										<p className="text-sm text-gray-600">Net Earnings</p>
										<p className="text-xl font-bold text-gray-900">
											${eventDetails.earningsSummary.netEarnings.toFixed(2)}
										</p>
									</div>
								</div>
							</div>
						</>
					)}

					{eventDetails.isFree && (
						<div className="bg-white rounded-xl border border-gray-200 p-5">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
									<Ticket className="w-5 h-5 text-purple-600" />
								</div>
								<div>
									<p className="text-sm text-gray-600">Event Type</p>
									<p className="text-xl font-bold text-gray-900">Free Event</p>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Attendee List */}
				<div className="bg-white rounded-xl border border-gray-200 shadow-sm">
					<div className="px-6 py-4 border-b border-gray-200">
						<h2 className="font-semibold text-gray-900">Attendees</h2>
					</div>

					{attendees.length === 0 ? (
						<div className="p-12 text-center">
							<Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
							<p className="text-gray-500">No attendees yet</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-50">
									<tr>
										{!eventDetails.isFree && (
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
												Ticket Code
											</th>
										)}
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
											Name
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
											Email
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
											Phone
										</th>
										{!eventDetails.isFree && (
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
												Amount
											</th>
										)}
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
											Status
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
											Date
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{attendees.map((attendee) => (
										<tr key={attendee.id} className="hover:bg-gray-50">
											{!eventDetails.isFree && (
												<td className="px-6 py-4 text-sm font-mono text-gray-900">
													{attendee.ticketCode}
												</td>
											)}
											<td className="px-6 py-4 text-sm text-gray-900">
												{attendee.firstName} {attendee.lastName}
											</td>
											<td className="px-6 py-4 text-sm text-gray-600">
												{attendee.email}
											</td>
											<td className="px-6 py-4 text-sm text-gray-600">
												{attendee.phone || "-"}
											</td>
											{!eventDetails.isFree && (
												<td className="px-6 py-4 text-sm text-gray-900">
													${(attendee.totalPrice || 0).toFixed(2)}
												</td>
											)}
											<td className="px-6 py-4">
												<span
													className={`px-2 py-1 text-xs font-medium rounded ${
														attendee.status === "confirmed"
															? "bg-green-100 text-green-700"
															: "bg-gray-100 text-gray-700"
													}`}
												>
													{attendee.status}
												</span>
											</td>
											<td className="px-6 py-4 text-sm text-gray-600">
												{formatDate(
													attendee.purchasedAt || attendee.registeredAt || ""
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>
		);
	}

	// Loading state
	if (isLoadingEvents) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)]" />
			</div>
		);
	}

	// Events list view
	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between bg-white px-6 py-5 rounded-xl border border-gray-200 shadow-sm">
				<div>
					<h1 className="text-xl font-bold text-gray-900">My Events</h1>
					<p className="text-sm text-gray-600">
						Manage your events and view attendees
					</p>
				</div>
				<button
					onClick={() => router.push("/events")}
					className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
				>
					<ArrowLeft className="w-4 h-4" />
					Back to Events
				</button>
			</div>

			{/* Events List */}
			{!events || events.length === 0 ? (
				<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
					<Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
					<h2 className="text-lg font-semibold text-gray-900 mb-2">
						No events yet
					</h2>
					<p className="text-gray-600">
						Events you organize will appear here
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{events.map((event) => (
						<div
							key={event.id}
							onClick={() => setSelectedEventId(event.id)}
							className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:border-[var(--primary-color)] cursor-pointer transition group"
						>
							<div className="flex items-center gap-4">
								{event.coverImage ? (
									<div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
										<Image
											src={event.coverImage}
											alt={event.title}
											width={80}
											height={80}
											className="w-full h-full object-cover"
										/>
									</div>
								) : (
									<div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
										<Calendar className="w-8 h-8 text-gray-400" />
									</div>
								)}

								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-1">
										<h3 className="font-semibold text-gray-900 truncate">
											{event.title}
										</h3>
										<span
											className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusBadge(
												event.status
											)}`}
										>
											{event.status.charAt(0).toUpperCase() +
												event.status.slice(1)}
										</span>
									</div>

									<div className="flex flex-wrap gap-3 text-sm text-gray-600">
										<span className="flex items-center gap-1">
											<Calendar className="w-3.5 h-3.5" />
											{formatDate(event.startDate)}
										</span>
										<span className="flex items-center gap-1">
											<Users className="w-3.5 h-3.5" />
											{event.totalAttendees} attendees
										</span>
										{!event.isFree && event.earnings && (
											<span className="flex items-center gap-1 text-green-600">
												<DollarSign className="w-3.5 h-3.5" />
												${event.earnings.netEarnings.toFixed(2)} earned
											</span>
										)}
										{event.isFree && (
											<span className="text-purple-600">Free Event</span>
										)}
									</div>
								</div>

								<ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[var(--primary-color)] transition" />
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
