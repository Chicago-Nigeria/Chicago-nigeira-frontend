"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Calendar, MapPin, Ticket } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "@/app/store/useSession";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { callApi } from "@/app/libs/helper/callApi";
import { ApiResponse } from "@/app/types";
import { toast } from "sonner";
import ConfirmationModal from "./ConfirmationModal";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripeCheckout from "@/app/components/StripeCheckout";

// Initialize Stripe
const stripePromise = loadStripe(
	process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

// Ticket Registration Schema
const ticketSchema = z.object({
	firstName: z.string().min(2, "First name is required"),
	lastName: z.string().min(2, "Last name is required"),
	email: z.string().email("Valid email is required"),
	phone: z.string().min(10, "Valid phone number is required"),
	quantity: z.number().min(1, "Quantity must be at least 1").optional(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

interface TicketRegistrationModalProps {
	event: any;
	onClose: () => void;
}

interface PriceBreakdown {
	ticketPrice: number;
	quantity: number;
	subtotal: number;
	processingFee: number;
	total: number;
}

export default function TicketRegistrationModal({
	event,
	onClose,
}: TicketRegistrationModalProps) {
	const { user } = useSession((state) => state);
	const { requireAuth } = useAuthGuard();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [registeredEvent, setRegisteredEvent] = useState<any>(null);

	// Stripe payment state
	const [clientSecret, setClientSecret] = useState<string | null>(null);
	const [paymentId, setPaymentId] = useState<string | null>(null);
	const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
	const [step, setStep] = useState<"form" | "payment">("form");
	const [isLoadingPrice, setIsLoadingPrice] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
	} = useForm<TicketFormData>({
		resolver: zodResolver(ticketSchema),
		defaultValues: {
			firstName: user?.firstName || "",
			lastName: user?.lastName || "",
			email: user?.email || "",
			phone: user?.phone || "",
			quantity: 1,
		},
	});

	// Auto-fill form when user data is available
	useEffect(() => {
		if (user) {
			setValue("firstName", user.firstName);
			setValue("lastName", user.lastName);
			setValue("email", user.email);
			setValue("phone", user.phone);
		}
	}, [user, setValue]);

	const quantity = watch("quantity") || 1;

	// Fetch price breakdown when quantity changes (for paid events)
	useEffect(() => {
		if (!event.isFree && quantity > 0) {
			fetchPriceBreakdown(quantity);
		}
	}, [quantity, event.isFree, event.id]);

	const fetchPriceBreakdown = async (qty: number) => {
		setIsLoadingPrice(true);
		try {
			const response = await callApi<ApiResponse<PriceBreakdown>>(
				`/payments/calculate?eventId=${event.id}&quantity=${qty}`,
				"GET"
			);
			if (response.data?.data) {
				setPriceBreakdown(response.data.data);
			}
		} catch (error) {
			console.error("Error fetching price:", error);
		} finally {
			setIsLoadingPrice(false);
		}
	};

	const onSubmit = async (data: TicketFormData) => {
		requireAuth(async () => {
			try {
				setIsSubmitting(true);

				if (event.isFree) {
					// Free event registration endpoint
					const payload = {
						firstName: data.firstName,
						lastName: data.lastName,
						email: data.email,
						phone: data.phone,
					};

					const response = await callApi<ApiResponse<any>>(
						`/events/${event.id}/register`,
						"POST",
						payload
					);

					if (response.error) {
						throw new Error(response.error.message || "Failed to register for event");
					}

					// Show confirmation modal
					setRegisteredEvent(response.data?.data?.event || event);
					setShowConfirmation(true);
				} else {
					// Paid event - create payment intent
					const payload = {
						eventId: event.id,
						quantity: data.quantity || 1,
						firstName: data.firstName,
						lastName: data.lastName,
						email: data.email,
						phone: data.phone,
					};

					const response = await callApi<ApiResponse<{
						clientSecret: string;
						paymentId: string;
						breakdown: PriceBreakdown;
					}>>(
						"/payments/create-payment-intent",
						"POST",
						payload
					);

					if (response.error) {
						throw new Error(response.error.message || "Failed to create payment");
					}

					if (response.data?.data) {
						setClientSecret(response.data.data.clientSecret);
						setPaymentId(response.data.data.paymentId);
						setPriceBreakdown(response.data.data.breakdown);
						setStep("payment");
					}
				}
			} catch (error: any) {
				toast.error(error.message || "Failed to process request");
				console.error("Ticket registration error:", error);
			} finally {
				setIsSubmitting(false);
			}
		}, "register for this event");
	};

	const handlePaymentSuccess = async () => {
		try {
			// Confirm payment on backend
			const response = await callApi<ApiResponse<any>>(
				"/payments/confirm",
				"POST",
				{ paymentIntentId: clientSecret?.split("_secret_")[0] }
			);

			if (response.error) {
				throw new Error(response.error.message);
			}

			toast.success("Ticket purchased successfully!");
			setRegisteredEvent(event);
			setShowConfirmation(true);
		} catch (error: any) {
			toast.error(error.message || "Failed to confirm payment");
		}
	};

	const handlePaymentError = (error: string) => {
		toast.error(error);
	};

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

	// Handle confirmation modal close
	const handleConfirmationClose = () => {
		setShowConfirmation(false);
		onClose();
	};

	// Show confirmation modal if registration was successful
	if (showConfirmation && registeredEvent) {
		return (
			<ConfirmationModal
				event={registeredEvent}
				onClose={handleConfirmationClose}
			/>
		);
	}

	return (
		<div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm pb-[70px] sm:pb-0">
			<div
				className="relative w-full sm:max-w-2xl bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[calc(100vh-90px)] sm:max-h-[90vh] flex flex-col"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
					<h2 className="text-xl font-bold text-gray-900">
						{event.isFree ? "Register for Event" : step === "payment" ? "Complete Payment" : "Purchase Ticket"}
					</h2>
					<button
						onClick={onClose}
						className="p-2 hover:bg-gray-100 rounded-full transition-colors"
						aria-label="Close modal"
					>
						<X className="w-5 h-5 text-gray-500" />
					</button>
				</div>

				{/* Event Summary */}
				<div className="px-6 py-3 sm:py-5 bg-gray-50 border-b border-gray-200 flex-shrink-0">
					<h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2 sm:mb-3 line-clamp-1">{event.title}</h3>
					<div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs sm:text-sm text-gray-700">
						<div className="flex items-center gap-1.5">
							<Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
							<span>
								{formatDate(event.startDate)} at {formatTime(event.startTime)}
							</span>
						</div>
						<div className="flex items-center gap-1.5">
							<MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
							<span className="line-clamp-1">{formatLocation()}</span>
						</div>
						{!event.isFree && (
							<div className="flex items-center gap-1.5">
								<Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
								<span className="font-semibold text-[var(--primary-color)]">
									${event.ticketPrice} per ticket
								</span>
							</div>
						)}
					</div>
				</div>

				{/* Step: Form */}
				{step === "form" && (
					<form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
						{/* Name Fields */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-900 mb-1.5">
									First Name <span className="text-red-500">*</span>
								</label>
								<input
									{...register("firstName")}
									type="text"
									placeholder="John"
									className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 focus:border-[var(--primary-color)]"
								/>
								{errors.firstName && (
									<p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-900 mb-1.5">
									Last Name <span className="text-red-500">*</span>
								</label>
								<input
									{...register("lastName")}
									type="text"
									placeholder="Doe"
									className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 focus:border-[var(--primary-color)]"
								/>
								{errors.lastName && (
									<p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
								)}
							</div>
						</div>

						{/* Email */}
						<div>
							<label className="block text-sm font-medium text-gray-900 mb-1.5">
								Email Address <span className="text-red-500">*</span>
							</label>
							<input
								{...register("email")}
								type="email"
								placeholder="john.doe@example.com"
								className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 focus:border-[var(--primary-color)]"
							/>
							{errors.email && (
								<p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
							)}
						</div>

						{/* Phone */}
						<div>
							<label className="block text-sm font-medium text-gray-900 mb-1.5">
								Phone Number <span className="text-red-500">*</span>
							</label>
							<input
								{...register("phone")}
								type="tel"
								placeholder="+1 (555) 123-4567"
								className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 focus:border-[var(--primary-color)]"
							/>
							{errors.phone && (
								<p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
							)}
						</div>

						{/* Quantity (only for paid events) */}
						{!event.isFree && (
							<div>
								<label className="block text-sm font-medium text-gray-900 mb-1.5">
									Number of Tickets <span className="text-red-500">*</span>
								</label>
								<input
									{...register("quantity", { valueAsNumber: true })}
									type="number"
									min="1"
									max={event.availableTickets || 10}
									placeholder="1"
									className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 focus:border-[var(--primary-color)]"
								/>
								{errors.quantity && (
									<p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>
								)}
								<p className="text-xs text-gray-500 mt-1">
									Maximum {event.availableTickets || 0} tickets available
								</p>
							</div>
						)}

						{/* Price Breakdown (only for paid events) */}
						{!event.isFree && priceBreakdown && (
							<div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
								{isLoadingPrice ? (
									<div className="flex items-center justify-center py-2">
										<Loader2 className="w-4 h-4 animate-spin text-gray-400" />
									</div>
								) : (
									<>
										<div className="space-y-2 text-sm">
											<div className="flex items-center justify-between text-gray-600">
												<span>Ticket Price</span>
												<span>${priceBreakdown.ticketPrice.toFixed(2)} x {priceBreakdown.quantity}</span>
											</div>
											<div className="flex items-center justify-between text-gray-600">
												<span>Subtotal</span>
												<span>${priceBreakdown.subtotal.toFixed(2)}</span>
											</div>
											<div className="flex items-center justify-between text-gray-600">
												<span>Processing Fee</span>
												<span>${priceBreakdown.processingFee.toFixed(2)}</span>
											</div>
										</div>
										<div className="flex items-center justify-between text-base font-bold mt-3 pt-3 border-t border-gray-300">
											<span className="text-gray-900">Total</span>
											<span className="text-[var(--primary-color)]">${priceBreakdown.total.toFixed(2)}</span>
										</div>
									</>
								)}
							</div>
						)}

					</form>
				)}

				{/* Sticky Submit Button - Form Step */}
				{step === "form" && (
					<div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 sm:rounded-b-2xl">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							form="ticket-form"
							onClick={handleSubmit(onSubmit)}
							disabled={isSubmitting}
							className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
						>
							{isSubmitting ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin" />
									Processing...
								</>
							) : event.isFree ? (
								"Register"
							) : (
								"Continue to Payment"
							)}
						</button>
					</div>
				)}

				{/* Step: Payment */}
				{step === "payment" && clientSecret && (
					<div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
						{/* Price Summary */}
						{priceBreakdown && (
							<div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
								<div className="flex items-center justify-between text-base font-bold">
									<span className="text-gray-900">Total to Pay</span>
									<span className="text-[var(--primary-color)]">${priceBreakdown.total.toFixed(2)}</span>
								</div>
								<p className="text-xs text-gray-500 mt-1">
									{priceBreakdown.quantity} ticket(s) for {event.title}
								</p>
							</div>
						)}

						{/* Stripe Payment Form */}
						<Elements
							stripe={stripePromise}
							options={{
								clientSecret,
								appearance: {
									theme: "stripe",
									variables: {
										colorPrimary: "#22c55e",
									},
								},
							}}
						>
							<StripeCheckout
								onSuccess={handlePaymentSuccess}
								onError={handlePaymentError}
								amount={priceBreakdown?.total || 0}
								isProcessing={isSubmitting}
								setIsProcessing={setIsSubmitting}
							/>
						</Elements>
					</div>
				)}

				{/* Sticky Back Button - Payment Step */}
				{step === "payment" && clientSecret && (
					<div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 sm:rounded-b-2xl">
						<button
							type="button"
							onClick={() => setStep("form")}
							disabled={isSubmitting}
							className="w-full px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
						>
							Back to Details
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
