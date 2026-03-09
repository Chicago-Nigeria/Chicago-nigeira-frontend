"use client";

import {
	ArrowLeft,
	Calendar,
	Clock,
	MapPin,
	Infinity,
	Ticket,
	Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ShareButton from "../../components/shareButton";
import { useGetEventBySlug } from "@/app/hooks/useEvent";
import { useEffect, useMemo, useState } from "react";
import TicketRegistrationModal from "../event-components/TicketRegistrationModal";
import MediaViewer from "@/app/components/modals/MediaViewer";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { useSession } from "@/app/store/useSession";
import { useQuery } from "@tanstack/react-query";
import { callApi } from "@/app/libs/helper/callApi";
import { ApiResponse } from "@/app/types";


type AttendingEventLite = {
	id: string;
};

const SLUG = "smart-city-lagos";

export default function AlaroCityEventPage() {
	const { requireAuth } = useAuthGuard();
	const { user } = useSession((state) => state);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [hasRegistered, setHasRegistered] = useState(false);
	const [showMediaViewer, setShowMediaViewer] = useState(false);
	const [mediaViewerIndex, setMediaViewerIndex] = useState(0);

	const { data, isLoading, error } = useGetEventBySlug(SLUG);
	const event = data?.data?.data;

	const { data: attendingEvents = [] } = useQuery({
		queryKey: ["attending-events"],
		queryFn: async () => {
			const response = await callApi<ApiResponse<AttendingEventLite[]>>(
				"/events/user/attending",
				"GET"
			);
			if (response.error) {
				throw new Error(response.error.message);
			}
			return response.data?.data || [];
		},
		enabled: !!user,
		staleTime: 60 * 1000,
	});

	useEffect(() => {
		if (!event?.id) return;
		setHasRegistered(attendingEvents.some((item) => item?.id === event.id));
	}, [attendingEvents, event?.id]);

	const isEventPast = () => {
		if (!event) return false;
		const eventDate = new Date(event.endDate || event.startDate);
		const eventEndTime = event.endTime || event.startTime;
		if (eventEndTime) {
			const [hours, minutes] = eventEndTime.split(':');
			eventDate.setHours(parseInt(hours), parseInt(minutes));
		}
		return eventDate < new Date();
	};

	const isPastEvent = event ? isEventPast() : false;

	const handleGetTicket = () => {
		if (isPastEvent || hasRegistered) return;
		requireAuth(() => {
			setIsModalOpen(true);
		}, "register for this event");
	};

	const formatShortDate = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const formatTime = (timeStr: string) => {
		const [hours, minutes] = timeStr.split(":");
		const hour = parseInt(hours);
		const ampm = hour >= 12 ? "PM" : "AM";
		const displayHour = hour % 12 || 12;
		return `${displayHour}:${minutes} ${ampm}`;
	};

	const isSameDate = (date1: string, date2: string) => {
		return new Date(date1).toDateString() === new Date(date2).toDateString();
	};

	const isSameTime = (time1: string, time2: string) => {
		return time1 === time2;
	};

	const formatLocation = () => {
		if (event?.venue && event?.location) {
			return `${event.venue}, ${event.location}`;
		}
		return event?.location || event?.venue || "Location TBA";
	};

	const organizerName = event?.customHostedBy
		? event.customHostedBy
		: event?.organizer
			? `${event.organizer.firstName} ${event.organizer.lastName}`
			: "Unknown";

	const hostInitials = event?.customHostedBy
		? event.customHostedBy.split(' ').slice(0, 2).map((n: string) => n.charAt(0).toUpperCase()).join('')
		: `${event?.organizer?.firstName?.charAt(0)?.toUpperCase() || ''}${event?.organizer?.lastName?.charAt(0)?.toUpperCase() || ''}`;

	const shareUrl =
		typeof window !== "undefined"
			? `${window.location.origin}/events/${SLUG}`
			: "";

	const allMediaItems = useMemo(() => {
		if (!event) return [];
		const items: { type: "image"; url: string }[] = [];
		const seen = new Set<string>();
		if (event.coverImage) {
			items.push({ type: "image", url: event.coverImage });
			seen.add(event.coverImage);
		}
		if (event.images && event.images.length > 0) {
			event.images.forEach((url: string) => {
				if (!seen.has(url)) {
					items.push({ type: "image", url });
					seen.add(url);
				}
			});
		}
		return items;
	}, [event]);

	const openMediaViewer = (index: number) => {
		setMediaViewerIndex(index);
		setShowMediaViewer(true);
	};

	const renderDescriptionWithPhoneLinks = (text: string) => {
		if (!text) return text;
		const phoneRegex = /(\+?\d[\d\s\-().]{7,}\d)/g;
		const parts = text.split(phoneRegex);
		return parts.map((part, i) => {
			if (/^\+?\d[\d\s\-().]{7,}\d$/.test(part)) {
				const cleanNumber = part.replace(/[\s\-().]/g, '');
				return (
					<a key={i} href={`tel:${cleanNumber}`} className="text-[var(--primary-color)] underline hover:no-underline">
						{part}
					</a>
				);
			}
			return part;
		});
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[50vh]">
				<Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)]" />
			</div>
		);
	}

	if (error || !event) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
				<p className="text-gray-600">Event not found</p>
				<Link
					href="/events"
					className="text-[var(--primary-color)] hover:underline"
				>
					Back to Events
				</Link>
			</div>
		);
	}

	const startDate = formatShortDate(event.startDate);
	const endDate = formatShortDate(event.endDate);
	const startTime = formatTime(event.startTime);
	const endTime = event.endTime ? formatTime(event.endTime) : null;
	const showEndDate = !isSameDate(event.startDate, event.endDate);
	const showEndTime = endTime && !isSameTime(event.startTime, event.endTime);
	const bannerImage = event.coverImage || "/image-placeholder.webp";

	return (
		<>
			<main className="grid grid-cols-1 lg:grid-cols-[minmax(0,2.5fr)_250px] gap-4 md:gap-6">
				<section className="space-y-4 pt-4">
					{/* Header Section */}
					<Link href="/events" className="flex items-center gap-4">
						<ArrowLeft />
						<div>
							<p>Back to events</p>
							<p className="text-xl font-semibold">Event Details</p>
						</div>
					</Link>

					{/* Event Image Section */}
					<section className="bg-white rounded-xl overflow-hidden space-y-4">
						<div
							className="w-full bg-gray-100 relative cursor-pointer max-h-[400px] overflow-hidden"
							onClick={() => openMediaViewer(0)}
						>
							<Image
								className="w-full h-full object-cover"
								src={bannerImage}
								alt={event.title}
								width={1200}
								height={400}
								priority
								style={{ width: '100%', height: '100%', maxHeight: '400px', objectFit: 'cover' }}
							/>
							<span className="absolute top-3 left-3 bg-[var(--primary-color)] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
								{event.category || "General"}
							</span>
							<div className="absolute right-5 top-4 flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
								<ShareButton title={event.title} url={shareUrl} />
							</div>
						</div>

						{event.images && event.images.length > 0 && (
							<div className="flex gap-3 overflow-x-auto px-4 py-1 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
								{event.images.map((src: string, index: number) => (
									<div
										key={index}
										className="relative flex-shrink-0 w-32 h-28 sm:w-36 sm:h-32 rounded-lg overflow-hidden bg-gray-200 cursor-pointer transition-all duration-300"
										onClick={() => {
											const mediaIndex = allMediaItems.findIndex((item) => item.url === src);
											openMediaViewer(mediaIndex >= 0 ? mediaIndex : index);
										}}
									>
										<Image
											src={src}
											alt={`Event image ${index + 1}`}
											fill
											className="object-cover object-center transition-transform duration-300 hover:scale-105"
										/>
									</div>
								))}
							</div>
						)}
					</section>

					{/* Event Details Section */}
					<section className="bg-white p-4 md:p-6 rounded-xl">
						<div className="pb-4 border-b border-b-gray-200 space-y-4">
							<h1 className="font-bold text-2xl">{event.title}</h1>

							<div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-700">
								<div className="flex items-center gap-2">
									<Calendar className="w-5 h-5 text-[var(--primary-color)] flex-shrink-0" />
									<span>
										{startDate}
										{showEndDate && ` - ${endDate}`}
									</span>
								</div>

								<div className="flex items-center gap-2">
									<Clock className="w-5 h-5 text-[var(--primary-color)] flex-shrink-0" />
									<span>
										{startTime}
										{showEndTime && ` - ${endTime}`}
									</span>
								</div>

								<div className="flex items-center gap-2">
									<MapPin className="w-5 h-5 text-[var(--primary-color)] flex-shrink-0" />
									<span>{formatLocation()}</span>
								</div>
							</div>
						</div>

						{/* Description */}
						<div className="py-4 border-b border-b-gray-200">
							<h2 className="font-semibold text-lg mb-2">About this event</h2>
							<p className="text-gray-600 whitespace-pre-wrap">
								{renderDescriptionWithPhoneLinks(event.description)}
							</p>
						</div>

						{/* Hosted By */}
						<div className="py-4 border-b border-b-gray-200">
							<h2 className="font-semibold text-lg mb-2">Hosted by</h2>
							<div className="flex items-center gap-3">
								<div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--primary-color)] text-white">
									<span className="font-semibold">
										{hostInitials}
									</span>
								</div>
								<div>
									<p className="font-medium">{organizerName}</p>
									<p className="text-sm text-gray-500">Event Organizer</p>
								</div>
							</div>
						</div>

						{/* Spots and Price */}
						<div className="pt-4 flex flex-wrap items-center justify-between gap-4">
							<div className="flex items-center gap-2 text-sm">
								{event.isFree && !event.totalTickets ? (
									<div className="flex items-center gap-2 text-gray-600">
										<Infinity className="w-5 h-5 text-[var(--primary-color)]" />
										<span className="font-medium">Unlimited spots</span>
									</div>
								) : (
									<div className="flex items-center gap-2 text-gray-600">
										<Ticket className="w-5 h-5 text-[var(--primary-color)]" />
										<span>
											<span className="font-semibold text-gray-900">
												{event.availableTickets}
											</span>{" "}
											spots left
										</span>
									</div>
								)}
							</div>

							<div>
								{event.isFree ? (
									<span className="text-[var(--primary-color)] text-2xl font-bold">
										FREE
									</span>
								) : (
									<span className="text-[var(--primary-color)] text-2xl font-bold">
										${event.ticketPrice}
									</span>
								)}
							</div>
						</div>
					</section>

					{/* Mobile CTA Button */}
					<div className="lg:hidden">
						{isPastEvent ? (
							<span className="block w-full py-3 bg-gray-200 text-gray-500 text-center font-semibold rounded-lg cursor-not-allowed">
								Registration Closed
							</span>
						) : hasRegistered ? (
							<span className="block w-full py-3 bg-emerald-100 text-emerald-700 text-center font-semibold rounded-lg cursor-not-allowed">
								Already Registered
							</span>
						) : (
							<button
								onClick={handleGetTicket}
								className="w-full py-3 bg-[var(--primary-color)] text-white font-semibold rounded-lg hover:bg-[var(--primary-color)]/90 transition-colors"
							>
								{event.isFree ? "Register for Free" : "Get Ticket"}
							</button>
						)}
					</div>
				</section>

				{/* Right Sidebar - Desktop Only */}
				<section className="hidden lg:block mt-4 space-y-4 sticky top-20 h-fit pt-4">
					<div className="bg-white p-6 rounded-xl shadow-sm">
						<h3 className="font-semibold text-lg mb-4">Get your ticket</h3>

						<div className="space-y-3 text-sm text-gray-600 mb-6">
							<div className="flex items-center gap-2">
								<Calendar className="w-4 h-4 text-[var(--primary-color)]" />
								<span>{startDate}</span>
							</div>
							<div className="flex items-center gap-2">
								<Clock className="w-4 h-4 text-[var(--primary-color)]" />
								<span>{startTime}</span>
							</div>
							<div className="flex items-center gap-2">
								<MapPin className="w-4 h-4 text-[var(--primary-color)]" />
								<span className="line-clamp-2">{formatLocation()}</span>
							</div>
						</div>

						<div className="py-4 border-t border-b border-gray-200 mb-4">
							<div className="flex items-center justify-between">
								<span className="text-gray-600">Price</span>
								{event.isFree ? (
									<span className="text-[var(--primary-color)] text-xl font-bold">
										FREE
									</span>
								) : (
									<span className="text-[var(--primary-color)] text-xl font-bold">
										${event.ticketPrice}
									</span>
								)}
							</div>
						</div>

						{isPastEvent ? (
							<span className="block w-full py-3 bg-gray-200 text-gray-500 text-center font-semibold rounded-lg cursor-not-allowed">
								Registration Closed
							</span>
						) : hasRegistered ? (
							<span className="block w-full py-3 bg-emerald-100 text-emerald-700 text-center font-semibold rounded-lg cursor-not-allowed">
								Already Registered
							</span>
						) : (
							<button
								onClick={handleGetTicket}
								className="w-full py-3 bg-[var(--primary-color)] text-white font-semibold rounded-lg hover:bg-[var(--primary-color)]/90 transition-colors"
							>
								{event.isFree ? "Register for Free" : "Get Ticket"}
							</button>
						)}

						{!event.isFree && !isPastEvent && (
							<p className="text-center text-sm text-gray-500 mt-3">
								Only {event.availableTickets} spots left
							</p>
						)}
					</div>

					{/* Organizer Card */}
					<div className="bg-white p-6 rounded-xl shadow-sm">
						<h3 className="font-semibold text-lg mb-4">About the organizer</h3>
						<div className="flex items-center gap-3">
							<div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--primary-color)] text-white">
								<span className="font-semibold">
									{hostInitials}
								</span>
							</div>
							<div>
								<p className="font-medium">{organizerName}</p>
								<p className="text-sm text-gray-500">Event Organizer</p>
							</div>
						</div>
					</div>
				</section>
			</main>

			{/* Ticket Registration Modal */}
			{isModalOpen && (
				<TicketRegistrationModal
					event={event}
					onClose={() => setIsModalOpen(false)}
					onRegistrationSuccess={() => setHasRegistered(true)}
				/>
			)}

			{/* Image Viewer */}
			<MediaViewer
				isOpen={showMediaViewer}
				onClose={() => setShowMediaViewer(false)}
				media={allMediaItems}
				initialIndex={mediaViewerIndex}
			/>
		</>
	);
}
