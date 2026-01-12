"use client";
import { useState } from "react";
import {
	EventStatusAttendedCard,
	EventStatusHostedCard,
	EventStatusPastCard,
} from "./eventStatusCard";
import { AttendingEvent, HostedEvent, PastEvent } from "@/app/types";
type Props = {
	hostedEvents?: HostedEvent[];
	pastEvents?: PastEvent[];
	attendingEvents?: AttendingEvent[];
	onTabChange?: (tab: MyEventTypes) => void;
};
type MyEventTypes = "hosted" | "attending" | "past";
const navigation: MyEventTypes[] = ["attending","hosted", "past"];

export default function EventStatusTabs({
	attendingEvents,
	pastEvents,
	hostedEvents,
	onTabChange,
}: Props) {
	const [active, setActive] = useState<MyEventTypes>("hosted");

	const handleTabChange = (tab: MyEventTypes) => {
		setActive(tab);
		// Call the refetch callback if provided
		if (onTabChange) {
			onTabChange(tab);
		}
	};
	function filteredEvents() {
		switch (active) {
			case "hosted":
				return <EventStatusHostedCard events={hostedEvents} />;
			case "attending":
				return <EventStatusAttendedCard events={attendingEvents} />;
			case "past":
				return <EventStatusPastCard events={pastEvents} />;
			default:
				return <EventStatusHostedCard events={hostedEvents} />;
		}
	}

	return (
		<>
			{/* Events Status Navigation Bar */}
			<nav className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-4">
				{navigation.map((item, id) => (
					<button
						key={id}
						onClick={() => handleTabChange(item)}
						className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
							active === item
								? "bg-white text-gray-900 shadow-sm"
								: "text-gray-600 hover:text-gray-900"
						}`}
					>
						{item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()}
					</button>
				))}
			</nav>

			<div className="space-y-3">{filteredEvents()}</div>
		</>
	);
}
