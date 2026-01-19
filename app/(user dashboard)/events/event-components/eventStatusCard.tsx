"use client"
import { Calendar, UsersRound, ChevronRight } from "lucide-react";
import type { AttendingEvent, HostedEvent, PastEvent } from "@/app/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function EventStatusHostedCard({ events }: { events?: HostedEvent[] }) {
	const router = useRouter();

	const handleHostedEventClick = (eventId: string | undefined) => {
		if (eventId) {
			router.push(`/events/my-events?eventId=${eventId}`);
		} else {
			router.push('/events/my-events');
		}
	};

	if (!events || events.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-sm text-gray-500 mb-1">No hosted events yet</p>
				<p className="text-xs text-gray-400">Events you create will appear here</p>
			</div>
		);
	}
	return (
		<>
			{events.slice(0, 3).map(
				({ id, eventStatus, eventName, daysOfWeek, numberOfAttendees }, i) => (
					<div
						key={id || i}
						onClick={() => handleHostedEventClick(id)}
						className="p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors space-y-2 cursor-pointer"
					>
						<div className="flex items-start justify-between gap-2">
							<h3 className="font-medium text-sm text-gray-900">{eventName}</h3>
							<span
								className={`${
									eventStatus === "pending"
										? "text-yellow-700 bg-yellow-100"
										: eventStatus === "approved" || eventStatus === "active" || eventStatus === "upcoming"
											? "text-green-700 bg-green-100"
											: eventStatus === "ongoing"
												? "text-blue-700 bg-blue-100"
												: eventStatus === "completed"
													? "text-gray-700 bg-gray-200"
													: eventStatus === "rejected"
														? "text-red-700 bg-red-100"
														: ""
								} px-2 py-0.5 text-xs font-medium rounded whitespace-nowrap`}
							>
								{eventStatus === "pending"
									? "Pending"
									: eventStatus === "approved" || eventStatus === "active"
										? "Active"
										: eventStatus === "upcoming"
											? "Upcoming"
											: eventStatus === "ongoing"
												? "Ongoing"
												: eventStatus === "completed"
													? "Completed"
													: eventStatus === "rejected"
														? "Rejected"
														: ""}
							</span>
						</div>
						<div className="flex items-center justify-between text-xs text-gray-600">
							<span className="flex items-center gap-1">
								<Calendar size={12} />
								{daysOfWeek}
							</span>
							<span className="flex items-center gap-1">
								<UsersRound size={12} />
								{numberOfAttendees}
							</span>
						</div>
					</div>
				),
			)}

			{/* View All Link */}
			<Link
				href="/events/my-events"
				className="flex items-center justify-center gap-1 mt-3 py-2 text-sm font-medium text-[var(--primary-color)] hover:bg-[var(--primary-color)]/5 rounded-lg transition"
			>
				Manage Events & Attendees
				<ChevronRight size={16} />
			</Link>
		</>
	);
}

export function EventStatusAttendedCard({
	events,
}: {
	events?: AttendingEvent[];
}) {
	const router = useRouter();

	if (!events || events.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-sm text-gray-500 mb-1">No attending events yet</p>
				<p className="text-xs text-gray-400">Register for events to see them here</p>
			</div>
		);
	}
	return (
		<>
			{events.map(({ id, date, eventName }, i) => {
				return (
					<div
						key={id || i}
						onClick={() => id && router.push(`/events/${id}`)}
						className="p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors space-y-2 cursor-pointer"
					>
						<h3 className="font-medium text-sm text-gray-900">{eventName}</h3>
						<p className="text-xs text-gray-600 flex items-center gap-1">
							<Calendar size={12} /> {date}
						</p>
					</div>
				);
			})}
		</>
	);
}
export function EventStatusPastCard({ events }: { events?: PastEvent[] }) {
	const router = useRouter();

	if (!events || events.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-sm text-gray-500 mb-1">No past events yet</p>
				<p className="text-xs text-gray-400">Your event history will appear here</p>
			</div>
		);
	}
	return (
		<>
			{events.map(({ id, eventName, date, numberOfAttendees }, i) => (
				<div
					key={id || i}
					onClick={() => id && router.push(`/events/${id}`)}
					className="p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors space-y-2 cursor-pointer"
				>
					<h3 className="font-medium text-sm text-gray-900">{eventName}</h3>
					<div className="flex items-center justify-between text-xs text-gray-600">
						<span className="flex items-center gap-1">
							<Calendar size={12} /> {date}
						</span>
						<span className="flex items-center gap-1">
							<UsersRound size={12} />
							{numberOfAttendees}
						</span>
					</div>
				</div>
			))}
		</>
	);
}
