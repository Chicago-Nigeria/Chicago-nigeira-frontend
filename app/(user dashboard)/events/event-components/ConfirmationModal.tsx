"use client";

import { useEffect } from "react";
import { X, CheckCircle, Calendar, MapPin, Clock } from "lucide-react";
import Image from "next/image";

interface ConfirmationModalProps {
	event: any;
	onClose: () => void;
}

export default function ConfirmationModal({
	event,
	onClose,
}: ConfirmationModalProps) {
	// Format date
	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleDateString("en-US", {
			weekday: "long",
			month: "long",
			day: "numeric",
			year: "numeric",
		});
	};

	// Format time
	const formatTime = (timeStr: string) => {
		const [hours, minutes] = timeStr.split(":");
		const hour = parseInt(hours);
		const ampm = hour >= 12 ? "PM" : "AM";
		const displayHour = hour % 12 || 12;
		return `${displayHour}:${minutes} ${ampm}`;
	};

	// Format location
	const formatLocation = () => {
		if (event.venue && event.location) {
			return `${event.venue}, ${event.location}`;
		}
		return event.location || event.venue || "Location TBA";
	};

	// Close modal on Escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handleEscape);
		return () => window.removeEventListener("keydown", handleEscape);
	}, [onClose]);

	// Prevent body scroll when modal is open
	useEffect(() => {
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = "unset";
		};
	}, []);

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
			onClick={onClose}
		>
			<div
				className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header with close button */}
				<div className="absolute top-4 right-4 z-10">
					<button
						onClick={onClose}
						className="p-2 hover:bg-gray-100 rounded-full transition-colors"
						aria-label="Close modal"
					>
						<X className="w-5 h-5 text-gray-500" />
					</button>
				</div>

				{/* Success Icon */}
				<div className="bg-gradient-to-b from-green-50 to-white pt-12 pb-6 px-6 text-center">
					<div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
						<CheckCircle className="w-12 h-12 text-green-600" />
					</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Registration Successful!
					</h2>
					<p className="text-gray-600 text-sm">
						You've successfully registered for this event
					</p>
				</div>

				{/* Event Details */}
				<div className="px-6 pb-6">
					{/* Event Banner
					{event.coverImage && (
						<div className="relative h-40 w-full rounded-lg overflow-hidden mb-4">
							<Image
								src={event.coverImage}
								alt={event.title}
								fill
								className="object-cover"
							/>
						</div>
					)} */}

					{/* Event Info */}
					<div className="space-y-4">
						<h3 className="font-bold text-lg text-gray-900">{event.title}</h3>

						<div className="space-y-3 text-sm">
							{/* Date */}
							<div className="flex items-start gap-3">
								<Calendar className="w-5 h-5 text-[var(--primary-color)] flex-shrink-0 mt-0.5" />
								<div>
									<p className="font-medium text-gray-900">Date</p>
									<p className="text-gray-600">{formatDate(event.startDate)}</p>
								</div>
							</div>

							{/* Time */}
							<div className="flex items-start gap-3">
								<Clock className="w-5 h-5 text-[var(--primary-color)] flex-shrink-0 mt-0.5" />
								<div>
									<p className="font-medium text-gray-900">Time</p>
									<p className="text-gray-600">{formatTime(event.startTime)}</p>
								</div>
							</div>

							{/* Location */}
							<div className="flex items-start gap-3">
								<MapPin className="w-5 h-5 text-[var(--primary-color)] flex-shrink-0 mt-0.5" />
								<div>
									<p className="font-medium text-gray-900">Location</p>
									<p className="text-gray-600">{formatLocation()}</p>
								</div>
							</div>
						</div>

						{/* Info Box */}
						{/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
							<p className="text-sm text-blue-900">
								<span className="font-semibold">Confirmation sent!</span> We've sent a
								confirmation email with event details to your registered email address.
							</p>
						</div> */}

						{/* Close Button */}
						<button
							onClick={onClose}
							className="w-full mt-6 px-4 py-3 bg-[var(--primary-color)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--primary-color)]/90 transition-colors"
						>
							Done
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
