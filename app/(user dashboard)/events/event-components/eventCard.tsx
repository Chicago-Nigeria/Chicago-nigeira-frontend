"use client";

import Image from "next/image";
import { Calendar, Clock, MapPin, Infinity, User } from "lucide-react";
import { useState } from "react";
import TicketRegistrationModal from "./TicketRegistrationModal";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";

interface EventCardProps {
	event: any; // Will be properly typed once backend response is confirmed
}

export default function EventCard({ event }: EventCardProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { requireAuth } = useAuthGuard();

	// Handle get ticket button click - require authentication
	const handleGetTicket = () => {
		requireAuth(() => {
			setIsModalOpen(true);
		}, 'register for this event');
	};

	// Format date - show "Mon, Jan 15, 2025"
	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	};

	// Format time - show "10:00 AM"
	const formatTime = (timeStr: string) => {
		const [hours, minutes] = timeStr.split(':');
		const hour = parseInt(hours);
		const ampm = hour >= 12 ? 'PM' : 'AM';
		const displayHour = hour % 12 || 12;
		return `${displayHour}:${minutes} ${ampm}`;
	};

	// Check if dates are the same
	const isSameDate = (date1: string, date2: string) => {
		return new Date(date1).toDateString() === new Date(date2).toDateString();
	};

	// Check if times are the same
	const isSameTime = (time1: string, time2: string) => {
		return time1 === time2;
	};

	const startDate = formatDate(event.startDate);
	const endDate = formatDate(event.endDate);
	const startTime = formatTime(event.startTime);
	const endTime = event.endTime ? formatTime(event.endTime) : null;

	const showEndDate = !isSameDate(event.startDate, event.endDate);
	const showEndTime = endTime && !isSameTime(event.startTime, event.endTime);

	// Format location
	const formatLocation = () => {
		if (event.venue && event.location) {
			return `${event.venue}, ${event.location}`;
		}
		return event.location || event.venue || 'Location TBA';
	};

	// Format organizer name
	const organizerName = event.organizer
		? `${event.organizer.firstName} ${event.organizer.lastName}`
		: 'Unknown';

	// Calculate spots left
	const spotsLeft = event.isFree ? null : event.availableTickets;

	// Get banner image or use placeholder
	const bannerImage = event.coverImage || '/image-placeholder.webp';

	return (
		<>
			<div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
				{/* Banner Image Section */}
				<div className="relative h-52 w-full">
					<Image
						src={bannerImage}
						alt={event.title}
						fill
						className="object-cover"
						sizes="(max-width: 768px) 100vw, 600px"
					/>
					{/* Category Tag */}
					<span className="absolute top-3 right-3 bg-[var(--primary-color)] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
						{event.category || 'General'}
					</span>
				</div>

				{/* Content Section */}
				<div className="p-5 space-y-3">
					<h2 className="text-lg font-semibold text-gray-900 line-clamp-2">{event.title}</h2>
					<p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{event.description}</p>

					{/* Event Details - Row Layout with Wrapping */}
					<div className="flex flex-wrap gap-x-4 gap-y-2.5 text-sm text-gray-700">
						{/* Date */}
						<div className="flex items-center gap-2">
							<Calendar className="w-5 h-5 text-[var(--primary-color)] flex-shrink-0" />
							<span>
								{startDate}
								{showEndDate && ` - ${endDate}`}
							</span>
						</div>

						{/* Time */}
						<div className="flex items-center gap-2">
							<Clock className="w-5 h-5 text-[var(--primary-color)] flex-shrink-0" />
							<span>
								{startTime}
								{showEndTime && ` - ${endTime}`}
							</span>
						</div>

						{/* Location */}
						<div className="flex items-center gap-2">
							<MapPin className="w-5 h-5 text-[var(--primary-color)] flex-shrink-0" />
							<span className="line-clamp-1">{formatLocation()}</span>
						</div>
					</div>

					{/* Spots Left */}
					<div className="flex items-center gap-2 text-sm">
						{event.isFree ? (
							<div className="flex items-center gap-2 text-gray-600">
								<Infinity className="w-5 h-5 text-[var(--primary-color)]" />
								<span className="font-medium">Unlimited spots</span>
							</div>
						) : (
							<div className="text-gray-600">
								<span className="font-semibold text-gray-900">{spotsLeft}</span> spots left
							</div>
						)}
					</div>

					{/* Footer - Hosted By, Price and Button */}
					<div className="pt-4 border-t border-gray-200 mt-4">
						<div className="flex items-center justify-between gap-4">
							{/* Left Column - Hosted By and Price */}
							<div className="flex flex-col gap-2">
								{/* Hosted By */}
								<div className="flex items-center gap-2 text-sm text-gray-700">
									<User className="w-5 h-5 text-[var(--primary-color)] flex-shrink-0" />
									<span>
										Hosted by <span className="font-medium text-gray-900">{organizerName}</span>
									</span>
								</div>

								{/* Price/Free Tag */}
								<div>
									{event.isFree ? (
										<span className="text-[var(--primary-color)] text-lg font-bold">FREE</span>
									) : (
										<span className="text-[var(--primary-color)] text-lg font-bold">${event.ticketPrice}</span>
									)}
								</div>
							</div>

							{/* Right - Get Ticket Button (Centered) */}
							<button
								onClick={handleGetTicket}
								className="px-6 py-2.5 bg-[var(--primary-color)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--primary-color)]/90 transition-colors shadow-sm self-center"
							>
								Get Ticket
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Ticket Registration Modal */}
			{isModalOpen && (
				<TicketRegistrationModal
					event={event}
					onClose={() => setIsModalOpen(false)}
				/>
			)}
		</>
	);
}
