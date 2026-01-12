"use client"
import { Calendar, UsersRound } from "lucide-react";
import type { AttendingEvent, HostedEvent, PastEvent } from "@/app/types";

export function EventStatusHostedCard({ events }: { events?: HostedEvent[] }) {
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
			{events.map(
				({ eventStatus, eventName, daysOfWeek, numberOfAttendees }, i) => (
					<div
						key={i}
						className="p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors space-y-2"
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
		</>
	);
}

export function EventStatusAttendedCard({
	events,
}: {
	events?: AttendingEvent[];
}) {
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
			{events.map(({ date, eventName }, i) => {
				return (
					<div
						key={i}
						className="p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors space-y-2"
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
			{events.map(({ eventName, date, numberOfAttendees }, i) => (
				<div
					key={i}
					className="p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors space-y-2"
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
