"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2, Calendar, MapPin, Ticket, Upload, FileText, CheckCircle2, Store, Sparkles } from "lucide-react";
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
import { useQueryClient } from "@tanstack/react-query";

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
	onRegistrationSuccess?: () => void;
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
	onRegistrationSuccess,
}: TicketRegistrationModalProps) {
	const { user } = useSession((state) => state);
	const { requireAuth } = useAuthGuard();
	const queryClient = useQueryClient();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [registeredEvent, setRegisteredEvent] = useState<any>(null);

	// Vendor flow state
	const vendorEnabled = !!event.vendorEnabled;
	const [mode, setMode] = useState<"regular" | "vendor">("regular");
	const [businessName, setBusinessName] = useState("");
	const [businessDescription, setBusinessDescription] = useState("");
	const [zelleReference, setZelleReference] = useState("");
	const [receiptFile, setReceiptFile] = useState<File | null>(null);
	const [vendorErrors, setVendorErrors] = useState<{ [k: string]: string }>({});
	const [vendorPending, setVendorPending] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

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

	const submitVendorRegistration = async (data: TicketFormData) => {
		const errs: { [k: string]: string } = {};
		if (!businessName.trim()) errs.businessName = "Business name is required";
		if (!receiptFile) errs.receipt = "Please upload your Zelle payment receipt";
		setVendorErrors(errs);
		if (Object.keys(errs).length) return;

		setIsSubmitting(true);
		try {
			const fd = new FormData();
			fd.append("firstName", data.firstName);
			fd.append("lastName", data.lastName);
			fd.append("email", data.email);
			fd.append("phone", data.phone);
			fd.append("businessName", businessName.trim());
			if (businessDescription.trim()) fd.append("businessDescription", businessDescription.trim());
			if (zelleReference.trim()) fd.append("zelleReference", zelleReference.trim());
			fd.append("receipt", receiptFile!);

			const response = await callApi<ApiResponse<any>>(
				`/events/${event.id}/register-vendor`,
				"POST",
				fd
			);
			if (response.error) throw new Error(response.error.message || "Failed to submit vendor registration");

			setVendorPending(true);
			void queryClient.invalidateQueries({ queryKey: ["attending-events"] });
		} catch (err: any) {
			toast.error(err.message || "Failed to submit vendor registration");
		} finally {
			setIsSubmitting(false);
		}
	};

	const onSubmit = async (data: TicketFormData) => {
		requireAuth(async () => {
			try {
				setIsSubmitting(true);

				if (vendorEnabled && mode === "vendor") {
					setIsSubmitting(false);
					await submitVendorRegistration(data);
					return;
				}

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

					const registeredEventData = response.data?.data?.event
						? { ...event, ...response.data.data.event }
						: event;

					// Show confirmation modal
					setRegisteredEvent(registeredEventData);
					setShowConfirmation(true);
					onRegistrationSuccess?.();
					void queryClient.invalidateQueries({ queryKey: ["attending-events"] });
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
			onRegistrationSuccess?.();
			void queryClient.invalidateQueries({ queryKey: ["attending-events"] });
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
		<div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm sm:pb-0">
			<div
				className="relative w-full sm:max-w-2xl bg-white sm:rounded-2xl rounded-t-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] max-h-[calc(100vh-90px)] sm:max-h-[90vh] flex flex-col overflow-hidden"
				onClick={(e) => e.stopPropagation()}
			>

				{/* Header */}
				<div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 pt-3.5 sm:pt-4 pb-3 flex items-start justify-between z-10">
					<div className="min-w-0 pr-2">
						<p className="text-[10px] uppercase tracking-[0.22em] text-gray-400 font-bold mb-1">
							{vendorEnabled && mode === "vendor"
								? "Vendor Booth"
								: step === "payment"
								? "Checkout"
								: "Registration"}
						</p>
						<h2 className="text-[18px] sm:text-[20px] font-bold text-gray-900 leading-tight tracking-tight">
							{vendorEnabled && mode === "vendor"
								? "Become a vendor"
								: event.isFree
								? "Reserve your spot"
								: step === "payment"
								? "Complete payment"
								: "Get your ticket"}
						</h2>
					</div>
					<button
						onClick={onClose}
						className="p-1.5 -mt-0.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
						aria-label="Close modal"
					>
						<X className="w-5 h-5 text-gray-500" />
					</button>
				</div>

				{/* Event Summary */}
				<div className="relative px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100 flex-shrink-0 overflow-hidden">
					{/* subtle decorative speckle */}
					<span
						aria-hidden
						className="pointer-events-none absolute -right-4 -bottom-4 w-24 h-24 opacity-40"
						style={{
							backgroundImage:
								"radial-gradient(circle, rgba(10,135,84,0.18) 1px, transparent 1.5px)",
							backgroundSize: "9px 9px",
						}}
					/>
					<h3 className="relative font-bold text-gray-900 text-[15px] sm:text-base mb-1.5 line-clamp-1">
						{event.title}
					</h3>
					<div className="relative flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] sm:text-xs text-gray-600">
						<div className="flex items-center gap-1.5">
							<Calendar className="w-3.5 h-3.5 text-[var(--primary-color)] flex-shrink-0" />
							<span>
								{formatDate(event.startDate)} · {formatTime(event.startTime)}
							</span>
						</div>
						<div className="flex items-center gap-1.5">
							<MapPin className="w-3.5 h-3.5 text-[var(--primary-color)] flex-shrink-0" />
							<span className="line-clamp-1">{formatLocation()}</span>
						</div>
						{!event.isFree && (
							<div className="flex items-center gap-1.5">
								<Ticket className="w-3.5 h-3.5 text-[var(--primary-color)] flex-shrink-0" />
								<span className="font-semibold text-[var(--primary-color)]">
									${event.ticketPrice} / ticket
								</span>
							</div>
						)}
					</div>
				</div>

				{/* Step: Vendor pending acknowledgement */}
				{step === "form" && vendorPending && (
					<div className="flex-1 overflow-y-auto px-4 sm:px-6 py-10 sm:py-12 text-center relative">
						{/* atmospheric speckle */}
						<span
							aria-hidden
							className="pointer-events-none absolute inset-0 opacity-40"
							style={{
								backgroundImage:
									"radial-gradient(circle, rgba(10,135,84,0.12) 1px, transparent 1.5px)",
								backgroundSize: "14px 14px",
							}}
						/>
						<div className="relative">
							<div className="mx-auto relative w-16 h-16 mb-5">
								{/* haloed ring */}
								<span className="absolute inset-0 rounded-full bg-emerald-200/60 animate-ping" />
								<span className="absolute inset-1 rounded-full bg-emerald-100" />
								<div className="absolute inset-0 flex items-center justify-center">
									<CheckCircle2 className="w-8 h-8 text-emerald-600 fill-white" strokeWidth={2.25} />
								</div>
							</div>
							<p className="text-[10px] uppercase tracking-[0.22em] text-emerald-700 font-bold mb-1.5">
								Submitted
							</p>
							<h3 className="text-xl font-bold text-gray-900 tracking-tight">
								Receipt received
							</h3>
							<p className="text-sm text-gray-600 mt-3 max-w-md mx-auto leading-relaxed">
								Your vendor registration for <strong>{event.title}</strong> has been submitted. We'll verify your Zelle payment and email your vendor ticket code once it's confirmed — usually within 1–2 business days.
							</p>
							<button
								onClick={onClose}
								className="mt-7 inline-flex items-center gap-2 px-7 py-2.5 text-sm font-bold rounded-lg bg-gradient-to-br from-[var(--primary-color)] to-emerald-700 text-white shadow-[0_4px_14px_-4px_rgba(10,135,84,0.5)] hover:shadow-[0_6px_18px_-4px_rgba(10,135,84,0.6)] hover:-translate-y-px transition-all duration-200"
							>
								Got it
							</button>
						</div>
					</div>
				)}

				{/* Step: Form */}
				{step === "form" && !vendorPending && (
					<form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5">
						{/* Mode selector (vendor-enabled events) */}
						{vendorEnabled && (
							<div>
								<p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold mb-2">
									Choose your pass
								</p>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
									{/* Attendee card */}
									<button
										type="button"
										onClick={() => setMode("regular")}
										aria-pressed={mode === "regular"}
										className={`group relative overflow-hidden rounded-xl px-3 py-2.5 text-left transition-all duration-200 ease-out ${
											mode === "regular"
												? "bg-gradient-to-br from-emerald-50 via-emerald-50/50 to-white ring-2 ring-[var(--primary-color)] shadow-[0_6px_18px_-10px_rgba(10,135,84,0.5)]"
												: "bg-white ring-1 ring-gray-200 hover:ring-gray-300 hover:bg-gray-50/60"
										}`}
									>
										{/* Decorative dot grid in corner */}
										<span
											aria-hidden
											className={`pointer-events-none absolute -right-3 -top-3 w-12 h-12 rounded-full transition-opacity duration-300 ${
												mode === "regular" ? "opacity-100" : "opacity-0"
											}`}
											style={{
												backgroundImage:
													"radial-gradient(circle, rgba(10,135,84,0.2) 1px, transparent 1.5px)",
												backgroundSize: "7px 7px",
											}}
										/>

										<div className="flex items-center gap-2.5 relative">
											{/* Ticket stub: icon */}
											<div
												className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
													mode === "regular"
														? "bg-[var(--primary-color)] text-white shadow shadow-emerald-500/30"
														: "bg-gray-100 text-gray-500"
												}`}
											>
												<Ticket className="w-4 h-4" strokeWidth={2.25} />
											</div>

											{/* Vertical perforation */}
											<div
												className={`h-9 border-l border-dashed transition-colors duration-300 ${
													mode === "regular" ? "border-emerald-300" : "border-gray-200"
												}`}
											/>

											{/* Body */}
											<div className="flex-1 min-w-0">
												<div className="flex items-center justify-between gap-1.5">
													<p className="text-[9.5px] uppercase tracking-[0.18em] text-gray-500 font-bold leading-none">
														Attendee
													</p>
													<span
														className={`transition-all duration-300 flex-shrink-0 ${
															mode === "regular"
																? "scale-100 opacity-100"
																: "scale-50 opacity-0"
														}`}
													>
														<CheckCircle2 className="w-4 h-4 text-[var(--primary-color)] fill-white" />
													</span>
												</div>
												<div className="flex items-baseline gap-1.5 mt-1">
													<p
														className={`text-lg font-black tracking-tight leading-none transition-colors duration-300 ${
															mode === "regular"
																? "text-emerald-700"
																: "text-gray-900"
														}`}
													>
														Free
													</p>
													<p className="text-[10px] text-gray-500 truncate">
														General admission
													</p>
												</div>
											</div>
										</div>
									</button>

									{/* Vendor card */}
									<button
										type="button"
										onClick={() => setMode("vendor")}
										aria-pressed={mode === "vendor"}
										className={`group relative overflow-hidden rounded-xl px-3 py-2.5 text-left transition-all duration-200 ease-out ${
											mode === "vendor"
												? "bg-gradient-to-br from-emerald-50 via-emerald-50/50 to-white ring-2 ring-[var(--primary-color)] shadow-[0_6px_18px_-10px_rgba(10,135,84,0.5)]"
												: "bg-white ring-1 ring-gray-200 hover:ring-gray-300 hover:bg-gray-50/60"
										}`}
									>
										<span
											aria-hidden
											className={`pointer-events-none absolute -right-3 -top-3 w-12 h-12 rounded-full transition-opacity duration-300 ${
												mode === "vendor" ? "opacity-100" : "opacity-0"
											}`}
											style={{
												backgroundImage:
													"radial-gradient(circle, rgba(10,135,84,0.2) 1px, transparent 1.5px)",
												backgroundSize: "7px 7px",
											}}
										/>

										<div className="flex items-center gap-2.5 relative">
											<div
												className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
													mode === "vendor"
														? "bg-[var(--primary-color)] text-white shadow shadow-emerald-500/30"
														: "bg-gray-100 text-gray-500"
												}`}
											>
												<Store className="w-4 h-4" strokeWidth={2.25} />
											</div>

											<div
												className={`h-9 border-l border-dashed transition-colors duration-300 ${
													mode === "vendor" ? "border-emerald-300" : "border-gray-200"
												}`}
											/>

											<div className="flex-1 min-w-0">
												<div className="flex items-center justify-between gap-1.5">
													<div className="flex items-center gap-1 min-w-0">
														<p className="text-[9.5px] uppercase tracking-[0.18em] text-gray-500 font-bold leading-none">
															Vendor
														</p>
														<span className="text-[7.5px] uppercase tracking-wider bg-amber-100 text-amber-800 px-1 py-0.5 rounded font-bold leading-none">
															Booth
														</span>
													</div>
													<span
														className={`transition-all duration-300 flex-shrink-0 ${
															mode === "vendor"
																? "scale-100 opacity-100"
																: "scale-50 opacity-0"
														}`}
													>
														<CheckCircle2 className="w-4 h-4 text-[var(--primary-color)] fill-white" />
													</span>
												</div>
												<div className="flex items-baseline gap-1.5 mt-1">
													<p
														className={`text-lg font-black tracking-tight leading-none transition-colors duration-300 ${
															mode === "vendor"
																? "text-emerald-700"
																: "text-gray-900"
														}`}
													>
														${event.vendorPrice || 200}
													</p>
													<p className="text-[10px] text-gray-500 truncate">
														via Zelle
													</p>
												</div>
											</div>
										</div>
									</button>
								</div>
							</div>
						)}

						<p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 font-bold pt-1">
							{vendorEnabled && mode === "vendor" ? "Contact details" : "Your details"}
						</p>

						{/* Name Fields */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label className="block text-[12px] font-semibold text-gray-700 mb-1.5 tracking-tight">
									First Name <span className="text-red-500">*</span>
								</label>
								<input
									{...register("firstName")}
									type="text"
									placeholder="John"
									className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50/40 placeholder:text-gray-400 transition-all duration-150 focus:outline-none focus:bg-white focus:ring-4 focus:ring-[var(--primary-color)]/10 focus:border-[var(--primary-color)]"
								/>
								{errors.firstName && (
									<p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
								)}
							</div>

							<div>
								<label className="block text-[12px] font-semibold text-gray-700 mb-1.5 tracking-tight">
									Last Name <span className="text-red-500">*</span>
								</label>
								<input
									{...register("lastName")}
									type="text"
									placeholder="Doe"
									className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50/40 placeholder:text-gray-400 transition-all duration-150 focus:outline-none focus:bg-white focus:ring-4 focus:ring-[var(--primary-color)]/10 focus:border-[var(--primary-color)]"
								/>
								{errors.lastName && (
									<p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
								)}
							</div>
						</div>

						{/* Email */}
						<div>
							<label className="block text-[12px] font-semibold text-gray-700 mb-1.5 tracking-tight">
								Email Address <span className="text-red-500">*</span>
							</label>
							<input
								{...register("email")}
								type="email"
								placeholder="john.doe@example.com"
								className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50/40 placeholder:text-gray-400 transition-all duration-150 focus:outline-none focus:bg-white focus:ring-4 focus:ring-[var(--primary-color)]/10 focus:border-[var(--primary-color)]"
							/>
							{errors.email && (
								<p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
							)}
						</div>

						{/* Phone */}
						<div>
							<label className="block text-[12px] font-semibold text-gray-700 mb-1.5 tracking-tight">
								Phone Number <span className="text-red-500">*</span>
							</label>
							<input
								{...register("phone")}
								type="tel"
								placeholder="+1 (555) 123-4567"
								className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50/40 placeholder:text-gray-400 transition-all duration-150 focus:outline-none focus:bg-white focus:ring-4 focus:ring-[var(--primary-color)]/10 focus:border-[var(--primary-color)]"
							/>
							{errors.phone && (
								<p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
							)}
						</div>

						{/* Vendor-specific fields */}
						{vendorEnabled && mode === "vendor" && (
							<>
								<div>
									<label className="block text-[12px] font-semibold text-gray-700 mb-1.5 tracking-tight">
										Business Name <span className="text-red-500">*</span>
									</label>
									<input
										value={businessName}
										onChange={(e) => setBusinessName(e.target.value)}
										type="text"
										placeholder="Your business or brand"
										className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50/40 placeholder:text-gray-400 transition-all duration-150 focus:outline-none focus:bg-white focus:ring-4 focus:ring-[var(--primary-color)]/10 focus:border-[var(--primary-color)]"
									/>
									{vendorErrors.businessName && (
										<p className="text-red-500 text-xs mt-1">{vendorErrors.businessName}</p>
									)}
								</div>

								<div>
									<label className="block text-[12px] font-semibold text-gray-700 mb-1.5 tracking-tight">
										What will you sell / showcase?
									</label>
									<textarea
										value={businessDescription}
										onChange={(e) => setBusinessDescription(e.target.value)}
										rows={2}
										placeholder="Optional — short description of products or services"
										className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50/40 placeholder:text-gray-400 transition-all duration-150 focus:outline-none focus:bg-white focus:ring-4 focus:ring-[var(--primary-color)]/10 focus:border-[var(--primary-color)]"
									/>
								</div>

								{/* Zelle instructions */}
								<div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 sm:p-4">
									<p className="font-semibold text-amber-900 text-sm mb-2">
										Step 1 — Send ${event.vendorPrice || 200} via Zelle
									</p>
									<div className="text-sm text-amber-900 space-y-1">
										<p>Open your bank's Zelle app and send to:</p>
										<p className="font-mono bg-white border border-amber-200 rounded px-2 py-1 break-all text-xs sm:text-sm">
											{event.vendorZelleEmail || "nracnws@gmail.com"}
										</p>
										{event.vendorZelleName && (
											<p className="text-xs break-words">Name on Zelle: <strong>{event.vendorZelleName}</strong></p>
										)}
										<p className="text-xs mt-2">In the memo, include your business name so we can match the payment.</p>
									</div>
								</div>

								<div>
									<label className="block text-[12px] font-semibold text-gray-700 mb-1.5 tracking-tight">
										Zelle reference / memo (optional)
									</label>
									<input
										value={zelleReference}
										onChange={(e) => setZelleReference(e.target.value)}
										type="text"
										placeholder="e.g. confirmation number from Zelle"
										className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50/40 placeholder:text-gray-400 transition-all duration-150 focus:outline-none focus:bg-white focus:ring-4 focus:ring-[var(--primary-color)]/10 focus:border-[var(--primary-color)]"
									/>
								</div>

								{/* Receipt upload */}
								<div>
									<label className="block text-[12px] font-semibold text-gray-700 mb-1.5 tracking-tight">
										Step 2 — Upload Zelle confirmation/receipt <span className="text-red-500">*</span>
									</label>
									<input
										ref={fileInputRef}
										type="file"
										accept="image/*,application/pdf"
										onChange={(e) => {
											const f = e.target.files?.[0] || null;
											setReceiptFile(f);
											if (f) setVendorErrors((p) => ({ ...p, receipt: "" }));
										}}
										className="hidden"
									/>
									<button
										type="button"
										onClick={() => fileInputRef.current?.click()}
										className="w-full px-3 sm:px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[var(--primary-color)] hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm text-gray-600 min-w-0"
									>
										{receiptFile ? (
											<>
												<FileText className="w-4 h-4 text-[var(--primary-color)] flex-shrink-0" />
												<span className="font-medium text-gray-900 truncate flex-1 min-w-0 text-left">{receiptFile.name}</span>
												<span className="text-xs text-gray-500 flex-shrink-0 hidden sm:inline">(click to change)</span>
											</>
										) : (
											<>
												<Upload className="w-4 h-4 flex-shrink-0" />
												<span className="sm:hidden">Upload receipt</span>
												<span className="hidden sm:inline">Click to upload screenshot or PDF</span>
											</>
										)}
									</button>
									{vendorErrors.receipt && (
										<p className="text-red-500 text-xs mt-1">{vendorErrors.receipt}</p>
									)}
									<p className="text-xs text-gray-500 mt-1.5">
										Your spot is confirmed only after we verify the Zelle deposit. You'll get a separate email with your vendor ticket code.
									</p>
								</div>
							</>
						)}

						{/* Quantity (only for paid events) */}
						{!event.isFree && (
							<div>
								<label className="block text-[12px] font-semibold text-gray-700 mb-1.5 tracking-tight">
									Number of Tickets <span className="text-red-500">*</span>
								</label>
								<input
									{...register("quantity", { valueAsNumber: true })}
									type="number"
									min="1"
									max={event.availableTickets || 10}
									placeholder="1"
									className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50/40 placeholder:text-gray-400 transition-all duration-150 focus:outline-none focus:bg-white focus:ring-4 focus:ring-[var(--primary-color)]/10 focus:border-[var(--primary-color)]"
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
				{step === "form" && !vendorPending && (
					<div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-3.5 flex gap-2 sm:gap-2.5 sm:rounded-b-2xl shadow-[0_-6px_20px_-12px_rgba(0,0,0,0.12)]">
						<button
							type="button"
							onClick={onClose}
							className="px-4 sm:px-5 py-2.5 text-sm font-semibold rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							form="ticket-form"
							onClick={handleSubmit(onSubmit)}
							disabled={isSubmitting}
							className="group relative flex-1 px-4 py-2.5 text-sm font-bold rounded-lg bg-gradient-to-br from-[var(--primary-color)] to-emerald-700 text-white shadow-[0_4px_14px_-4px_rgba(10,135,84,0.6)] hover:shadow-[0_6px_18px_-4px_rgba(10,135,84,0.7)] hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 overflow-hidden"
						>
							{/* Soft sheen */}
							<span
								aria-hidden
								className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full"
								style={{ transitionProperty: "transform, opacity", transitionDuration: "700ms" }}
							/>
							{isSubmitting ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin" />
									<span>Processing…</span>
								</>
							) : vendorEnabled && mode === "vendor" ? (
								<>
									<Store className="w-4 h-4 flex-shrink-0" />
									<span className="sm:hidden">Submit vendor</span>
									<span className="hidden sm:inline">Submit vendor registration</span>
								</>
							) : event.isFree ? (
								<>
									<Sparkles className="w-4 h-4 flex-shrink-0" />
									<span>Reserve my spot</span>
								</>
							) : (
								<>
									<Ticket className="w-4 h-4 flex-shrink-0" />
									<span className="sm:hidden">Continue</span>
									<span className="hidden sm:inline">Continue to payment</span>
								</>
							)}
						</button>
					</div>
				)}

				{/* Step: Payment */}
				{step === "payment" && clientSecret && (
					<div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5">
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
					<div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 sm:rounded-b-2xl">
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
