"use client";
import { useState, useCallback } from "react";
import MarketplaceSidebar from "../components/client/MarketplaceSidebar";
import {
	AlertTriangle,
	ArrowLeft,
	ArrowRight,
	CheckCircle,
	Store,
	TagIcon,
	Phone,
	Mail,
	MessageCircle,
	Info,
	X,
	ImageIcon,
	Video,
	Crown,
	MapPin,
} from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { CustomPhotoInput } from "./upload";
import Link from "next/link";
import { callApi } from "@/app/libs/helper/callApi";
import FormFieldErrorMessage from "@/app/components/fieldError";
import { useSession } from "@/app/store/useSession";
import { useAuthModal } from "@/app/store/useAuthModal";
import { useRouter } from "next/navigation";

// Enhanced types
type PriceType = "fixed" | "negotiable";
type Condition = "new" | "like-new" | "good" | "fair";

type Product = {
	title: string;
	category: string;
	price: string;
	priceType: PriceType;
	condition: Condition;
	description: string;
	location: string;
	currency: "NGN" | "USD";
	photo?: FileList;
	video?: FileList;
	tags?: string;
	phoneNumber?: string;
	email?: string;
	whatsappNumber?: string;
};

// Validation schema
const validationSchema = {
	title: {
		required: "Title is required",
		minLength: { value: 5, message: "Title must be at least 5 characters" },
		maxLength: { value: 80, message: "Title must be less than 80 characters" },
	},
	price: {
		required: "Price is required",
		pattern: {
			value: /^\d+(\.\d{1,2})?$/,
			message: "Please enter a valid price",
		},
	},
	location: {
		required: "Location is required",
		minLength: { value: 3, message: "Must be at least 3 characters" },
	},
	category: { required: "Category is required" },
	condition: { required: "Condition is required" },
	description: {
		required: "Description is required",
		minLength: {
			value: 10,
			message: "Description must be at least 10 characters",
		},
	},
	photo: {
		required: "At least one photo is required",
		validate: {
			maxFiles: (files: FileList) =>
				!files || files.length <= 8 || "Maximum 8 files allowed",
			fileSize: (files: FileList) => {
				if (!files) return "Please add at least one photo";
				for (let i = 0; i < files.length; i++) {
					if (files[i].size > 10 * 1024 * 1024) {
						return "File size should be less than 10MB";
					}
				}
				return true;
			},
		},
	},
};

export default function Form() {
	const { user } = useSession((state) => state);
	const { openSignIn } = useAuthModal((state) => state.actions);

	// Show placeholder for unauthenticated users
	if (!user) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
				<Store className="w-16 h-16 text-[var(--primary-color)] mb-4" />
				<h2 className="text-2xl font-semibold mb-2">Create Your Listing</h2>
				<p className="text-gray-600 mb-6 max-w-md">
					Sign in to create and manage your marketplace listings
				</p>
				<button
					onClick={() => openSignIn("create a listing")}
					className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-color)]/90 transition-colors"
				>
					Sign In to Create Listing
				</button>
				<Link href="/marketplace" className="mt-4 text-sm text-[var(--primary-color)] hover:underline">
					← Back to Marketplace
				</Link>
			</div>
		);
	}

	return <CreateListingForm />;
}

function CreateListingForm() {
	const router = useRouter();
	const [step, setStep] = useState<number>(1);
	const [direction, setDirection] = useState<"left" | "right">("right");
	const [isAnimating, setIsAnimating] = useState<boolean>(false);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);

	const methods = useForm<Product>({
		defaultValues: {
			title: "",
			category: "",
			currency: "USD",
			price: "",
			location: "",
			priceType: "fixed",
			condition: "new",
			description: "",
			tags: "",
			phoneNumber: "",
			email: "",
			whatsappNumber: "",
		},
		mode: "onChange",
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
		trigger,
		watch,
		reset,
	} = methods;

	// Prevent step from going out of bounds
	if (step > 4) setStep(4);
	if (step < 1) setStep(1);

	const listingTitle = watch("title");
	const listingCategory = watch("category");
	const listingPrice = watch("price");
	const listingDescription = watch("description");
	const listingLocation = watch("location");
	const listingCondition = watch("condition");
	const listingPhoto = watch("photo");
	const listingCurrency = watch("currency");
	const listingPhoneNumber = watch("phoneNumber");
	const listingEmail = watch("email");
	const listingWhatsappNumber = watch("whatsappNumber");

	// Count contact methods
	const contactMethodsCount = [listingPhoneNumber, listingEmail, listingWhatsappNumber].filter(Boolean).length;

	const onSubmit = async (data: Product) => {
		setIsSubmitting(true);
		try {
			// Create FormData object
			const formData = new FormData();

			// Append all form fields
			formData.append("title", data.title);
			formData.append("description", data.description);
			formData.append("category", data.category);
			formData.append("price", data.price);
			formData.append("currency", data.currency);
			formData.append("location", data.location);
			formData.append("condition", data.condition);
			formData.append("priceType", data.priceType);
			formData.append("tags", selectedTags.join(","));

			// Contact info
			if (data.phoneNumber) formData.append("phoneNumber", data.phoneNumber);
			if (data.email) formData.append("email", data.email);
			if (data.whatsappNumber) formData.append("whatsappNumber", data.whatsappNumber);

			// Append photo files
			if (data.photo && data.photo.length > 0) {
				for (let i = 0; i < data.photo.length; i++) {
					formData.append("photos", data.photo[i]);
				}
			}

			// Use callApi instead of useSWRMutation
			const { data: response, error } = await callApi(
				"/listings",
				"POST",
				formData,
			);

			if (error) {
				throw new Error(error.message || "Failed to create listing");
			}

			// Show success modal
			setShowSuccessModal(true);
		} catch (err) {
			console.error(err);
			const errorMessage =
				err instanceof Error ? err.message : "Something went wrong";
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleStepTransition = useCallback(
		(dir: "left" | "right") => {
			if (isAnimating) return;

			setIsAnimating(true);
			setDirection(dir);
			setTimeout(() => {
				if (dir === "right") {
					setStep((current) => Math.min(current + 1, 4));
				} else {
					setStep((current) => Math.max(current - 1, 1));
				}
				setIsAnimating(false);
			}, 300);
		},
		[isAnimating],
	);

	const next = useCallback(async () => {
		if (isAnimating) return;

		let fieldsToValidate: (keyof Product)[] = [];
		let isValid = false;

		if (step === 1) {
			fieldsToValidate = [
				"title",
				"price",
				"priceType",
				"category",
				"condition",
				"currency",
			];
			isValid = await trigger(fieldsToValidate);
		} else if (step === 2) {
			// Check if photos exist
			const photos = watch("photo");
			if (!photos || photos.length === 0) {
				toast.error("Please add at least one photo");
				return;
			}

			// Validate description
			fieldsToValidate = ["description"];
			isValid = await trigger(fieldsToValidate);
		} else if (step === 3) {
			// Contact info - only location is required
			fieldsToValidate = ["location"];
			isValid = await trigger(fieldsToValidate);
		}

		if (isValid) {
			handleStepTransition("right");
		}
	}, [isAnimating, step, trigger, watch, handleStepTransition]);

	const prev = useCallback(() => {
		handleStepTransition("left");
	}, [handleStepTransition]);

	// Tag handling functions
	const toggleTag = (tag: string) => {
		setSelectedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
		);
	};

	// Animation classes based on direction
	const getStepAnimationClass = () => {
		if (direction === "right") {
			return isAnimating
				? "animate-slide-out-left"
				: "animate-slide-in-right";
		} else {
			return isAnimating
				? "animate-slide-out-right"
				: "animate-slide-in-left";
		}
	};

	// Predefined categories
	const CATEGORIES = [
		"Fashion & Clothing",
		"Electronics",
		"Home & Garden",
		"Furniture",
		"Vehicles",
		"Property",
		"Jobs & Services",
		"Food & Agriculture",
	];

	// Condition options
	const CONDITIONS = [
		{ value: "new", label: "New" },
		{ value: "like-new", label: "Used - Like New" },
		{ value: "good", label: "Used - Good" },
		{ value: "fair", label: "Used - Fair" },
	];

	// Suggested tags
	const suggestedTags = [
		"Handmade",
		"Nigerian",
		"Custom",
		"Authentic",
		"Premium",
		"Traditional",
		"Modern",
		"Vintage",
		"Organic",
		"Imported",
		"Local",
		"Eco-Friendly",
	];

	// Progress percentage
	const progressPercentage = step * 25;

	// Handle success modal actions
	const handleBackToMarketplace = () => {
		router.push("/marketplace");
	};

	const handleCreateAnother = () => {
		setShowSuccessModal(false);
		reset();
		setSelectedTags([]);
		setStep(1);
	};

	return (
		<>
			{/* Success Modal */}
			{showSuccessModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-200">
						<button
							onClick={() => setShowSuccessModal(false)}
							className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
						>
							<X className="w-5 h-5" />
						</button>

						<div className="text-center">
							<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<CheckCircle className="w-10 h-10 text-green-500" />
							</div>

							<h2 className="text-xl font-bold text-gray-900 mb-2">
								Listing Submitted!
							</h2>

							<p className="text-gray-600 text-sm mb-6">
								Your listing has been submitted for admin approval.
								You&apos;ll receive an email notification within 24 hours
								once it&apos;s reviewed and published.
							</p>

							<div className="space-y-3">
								<button
									onClick={handleBackToMarketplace}
									className="w-full py-3 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-color)]/90 transition-colors"
								>
									Back To Marketplace
								</button>

								<button
									onClick={handleCreateAnother}
									className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
								>
									Create Another Listing
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			<section className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 mb-10">
				<section className="space-y-6 min-w-0">
					{/* Header */}
					<div className="flex items-center gap-2">
						<Link
							href="/marketplace"
							className="text-sm text-gray-500 hover:text-[var(--primary-color)] transition-colors flex items-center gap-1"
						>
							<ArrowLeft className="w-4 h-4" />
							Back to Marketplace
						</Link>
					</div>
					<h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Listing</h1>

					{/* PROGRESS STEPS */}
					<div className="bg-white px-3 md:px-8 py-4 md:py-8 rounded-2xl border border-gray-200 shadow-sm mb-6">
						{/* Header & Progress Bar */}
						<div className="space-y-4 mb-8">
							<div className="flex items-center justify-between">
								<span className="text-base font-semibold text-gray-900">Step {step} Of 4</span>
								<span className="text-sm text-gray-500">{progressPercentage}% Complete</span>
							</div>

							{/* Thick Progress Bar */}
							<div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
								<div
									className="h-full bg-black rounded-full transition-all duration-300 ease-out"
									style={{ width: `${progressPercentage}%` }}
								/>
							</div>
						</div>

						{/* Step Cards */}
						<div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
							{[
								{
									id: 1,
									title: "Basic Info",
									description: "Title, Category, And Price",
								},
								{
									id: 2,
									title: "Description & Media",
									description: "Details, photos and videos",
								},
								{
									id: 3,
									title: "Contact Info",
									description: "How buyers can reach you",
								},
								{
									id: 4,
									title: "Review & Submit",
									description: "Final review before publishing",
								},
							].map(({ id, title, description }) => {
								const isCompleted = step > id;
								const isCurrent = step === id;

								return (
									<div
										key={id}
										className={`
											flex flex-col items-center text-center p-3 md:p-4 rounded-xl border transition-all duration-300
											${isCurrent
												? "border-[var(--primary-color)] bg-white shadow-sm ring-1 ring-[var(--primary-color)]/10"
												: "border-gray-200 bg-white"
											}
										`}
									>
										{/* Step number */}
										<div
											className={`
												w-8 h-8 rounded-full flex items-center justify-center mb-3
												font-bold text-sm
												${isCurrent || isCompleted
													? "bg-[var(--primary-color)] text-white"
													: "bg-gray-100 text-gray-500"
												}
											`}
										>
											{isCompleted ? "✓" : id}
										</div>

										{/* Step title */}
										<h3 className={`font-semibold text-sm mb-1 ${isCurrent ? "text-gray-900" : "text-gray-500"}`}>
											{title}
										</h3>

										{/* Step description */}
										<p className="text-xs text-gray-400 leading-tight hidden md:block">
											{description}
										</p>
									</div>
								);
							})}
						</div>
					</div>

					<form
						onSubmit={handleSubmit(onSubmit)}
						className="px-3 md:px-8 bg-white rounded-2xl border border-gray-200 shadow-sm w-full py-6 text-sm relative signup-form"
						encType="multipart/form-data"
					>
						{/* STEP CONTENT CONTAINER */}
						<div className="relative min-h-[450px]">
							{/* STEP 1 Basic Info */}
							{step === 1 && (
								<div className={`${getStepAnimationClass()} w-full`}>
									<h2 className="text-lg font-semibold text-gray-800 mb-6">Basic Info</h2>

									<fieldset className="space-y-5">
										{/* Listing Title */}
										<div>
											<label
												htmlFor="title"
												className="block text-sm font-semibold mb-1"
											>
												Listing Title <span className="text-red-500">*</span>
											</label>
											<p className="text-gray-400 text-xs mb-2">
												Write a clear, descriptive title that highlights the key features
											</p>
											<input
												type="text"
												{...register("title", validationSchema.title)}
												maxLength={80}
												className="w-full rounded-lg p-3 bg-gray-100 border border-gray-200 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-200"
												placeholder="e.g. Authentic Nigerian Ankara Dresses - Made to order"
											/>
											<div className="flex justify-between mt-1">
												{errors.title ? (
													<p className="text-red-500 text-xs">
														{errors.title.message}
													</p>
												) : (
													<span />
												)}
												<span className="text-xs text-gray-400">
													{listingTitle?.length || 0}/80 characters
												</span>
											</div>
										</div>

										{/* Category */}
										<div>
											<label
												htmlFor="category"
												className="block text-sm font-semibold mb-1"
											>
												Category <span className="text-red-500">*</span>
											</label>
											<p className="text-gray-400 text-xs mb-2">
												Choose the category that best describes your item or service
											</p>
											<select
												{...register("category", validationSchema.category)}
												className="w-full rounded-lg p-3 bg-gray-100 border border-gray-200 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-200"
											>
												<option value="">Select a category</option>
												{CATEGORIES.map((category) => (
													<option key={category} value={category}>
														{category}
													</option>
												))}
											</select>
											{errors.category && (
												<p className="text-red-500 text-xs mt-1">
													{errors.category.message}
												</p>
											)}
										</div>

										{/* Price and Price Type */}
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<div>
												<label className="block text-sm font-semibold mb-1">
													Price <span className="text-red-500">*</span>
												</label>
												<div className="flex rounded-lg overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-[var(--primary-color)]/20 focus-within:border-[var(--primary-color)] transition-all duration-200 bg-gray-100">
													<select
														{...register("currency")}
														className="bg-gray-100 px-3 py-3 text-sm text-gray-700 focus:outline-none border-r border-gray-200"
													>
														<option value="USD">$</option>
														<option value="NGN">₦</option>
													</select>
													<input
														type="text"
														{...register("price", validationSchema.price)}
														className="flex-1 px-3 py-3 text-sm focus:outline-none bg-transparent"
														placeholder="0.00"
													/>
												</div>
												<FormFieldErrorMessage error={errors.price} />
											</div>

											<div>
												<label className="block text-sm font-semibold mb-1">
													Price Type
												</label>
												<select
													{...register("priceType")}
													className="w-full rounded-lg p-3 bg-gray-100 border border-gray-200 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-200"
												>
													<option value="fixed">Fixed Price</option>
													<option value="negotiable">Negotiable</option>
												</select>
											</div>
										</div>

										{/* Condition */}
										<div>
											<label className="block text-sm font-semibold mb-1">
												Condition <span className="text-red-500">*</span>
											</label>
											<p className="text-gray-400 text-xs mb-2">
												What condition is your item in?
											</p>
											<select
												{...register("condition", validationSchema.condition)}
												className="w-full rounded-lg p-3 bg-gray-100 border border-gray-200 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-200"
											>
												<option value="">Select condition</option>
												{CONDITIONS.map(({ value, label }) => (
													<option key={value} value={value}>
														{label}
													</option>
												))}
											</select>
											{errors.condition && (
												<p className="text-red-500 text-xs mt-1">
													{errors.condition.message}
												</p>
											)}
										</div>
									</fieldset>
								</div>
							)}

							{/* STEP 2 Description & Media */}
							{step === 2 && (
								<div className={`${getStepAnimationClass()} w-full`}>
									<h2 className="text-lg font-semibold text-gray-800 mb-6">Description & Media</h2>

									<fieldset className="space-y-5">
										{/* Description */}
										<div>
											<label className="block text-sm font-semibold mb-1">
												Description <span className="text-red-500">*</span>
											</label>
											<p className="text-gray-400 text-xs mb-2">
												Provide detailed information about your item or Service. Include Dimensions, Materials, etc.
											</p>
											<textarea
												{...register("description", validationSchema.description)}
												className="w-full rounded-lg resize-none min-h-32 bg-gray-100 p-3 border border-gray-200 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-200"
												placeholder="Write your item description"
												rows={5}
											/>
											{errors.description && (
												<p className="text-red-500 text-xs mt-1">
													{errors.description.message}
												</p>
											)}
										</div>

										{/* Photos */}
										<div>
											<label className="block text-sm font-semibold mb-1">
												Photos
											</label>
											<p className="text-gray-400 text-xs mb-2">
												Add up to 8 photos. First photo will be your main listing image.
											</p>

											<FormProvider {...methods}>
												<CustomPhotoInput
													name="photo"
													multiple={true}
													className="w-full"
												/>
											</FormProvider>

											{errors.photo && (
												<p className="text-red-500 text-xs mt-1">
													{errors.photo.message}
												</p>
											)}

											{listingPhoto && listingPhoto.length > 0 && (
												<p className="text-green-600 text-xs mt-2">
													✅ {listingPhoto.length} photo(s) selected
												</p>
											)}
										</div>

										{/* Video (Premium Feature) */}
										<div>
											<div className="flex items-center gap-2 mb-1">
												<label className="block text-sm font-semibold">
													Video (Premium Feature)
												</label>
												<span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
													<Crown className="w-3 h-3" />
													Optional
												</span>
											</div>
											<p className="text-gray-400 text-xs mb-2">
												Add a video to showcase your listing (available for paid members)
											</p>
											<div className="border-2 border-dashed border-amber-200 bg-amber-50/50 rounded-lg p-6 text-center">
												<Video className="w-8 h-8 text-amber-400 mx-auto mb-2" />
												<p className="text-sm text-amber-600 font-medium">
													Upgrade to Premium to add videos
												</p>
												<p className="text-xs text-amber-500 mt-1">
													Video listings get 3x more views
												</p>
											</div>
										</div>

										{/* Tags */}
										<div>
											<label className="block text-sm font-semibold mb-1">
												Tags
											</label>
											<p className="text-gray-400 text-xs mb-3">
												Select tags that describe your listing (up to 6 tags)
											</p>

											{/* Selected Tags */}
											{selectedTags.length > 0 && (
												<div className="flex flex-wrap gap-2 mb-4">
													{selectedTags.map((tag) => (
														<Tag
															key={tag}
															label={tag}
															active={true}
															onClick={() => toggleTag(tag)}
														/>
													))}
												</div>
											)}

											{/* Suggested Tags */}
											<h4 className="text-xs font-medium text-gray-500 mb-2">
												Suggested tags:
											</h4>
											<div className="flex flex-wrap gap-2">
												{suggestedTags.map((tag) => (
													<Tag
														key={tag}
														label={tag}
														active={selectedTags.includes(tag)}
														onClick={() => {
															if (selectedTags.length < 6 || selectedTags.includes(tag)) {
																toggleTag(tag);
															} else {
																toast.error("Maximum 6 tags allowed");
															}
														}}
													/>
												))}
											</div>
										</div>
									</fieldset>
								</div>
							)}

							{/* STEP 3 Contact Info */}
							{step === 3 && (
								<div className={`${getStepAnimationClass()} w-full`}>
									<h2 className="text-lg font-semibold text-gray-800 mb-6">Contact Info</h2>

									{/* Info Box */}
									<div className="flex items-start gap-3 border border-blue-200 bg-blue-50 rounded-lg p-4 mb-6">
										<Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
										<div>
											<h3 className="text-blue-700 font-medium text-sm">
												Contact Information
											</h3>
											<p className="text-blue-600 text-xs mt-0.5">
												Provide ways for interested buyers to reach you. This information will be visible to potential buyers.
											</p>
										</div>
									</div>

									<fieldset className="space-y-5">
										{/* Phone Number */}
										<div>
											<label className="block text-sm font-semibold mb-1">
												Phone Number
											</label>
											<div className="flex items-center gap-0 rounded-lg px-3 py-1 bg-gray-100 border border-gray-200 focus-within:border-[var(--primary-color)] focus-within:ring-2 focus-within:ring-[var(--primary-color)]/20 transition-all duration-200">
												<Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
												<input
													type="tel"
													{...register("phoneNumber")}
													className="flex-1 bg-transparent outline-none placeholder:text-gray-400"
													placeholder="Enter phone number"
												/>
											</div>
										</div>

										{/* Email Address */}
										<div>
											<label className="block text-sm font-semibold mb-1">
												Email Address
											</label>
											<div className="flex items-center gap-0 rounded-lg px-3 py-1 bg-gray-100 border border-gray-200 focus-within:border-[var(--primary-color)] focus-within:ring-2 focus-within:ring-[var(--primary-color)]/20 transition-all duration-200">
												<Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
												<input
													type="email"
													{...register("email")}
													className="flex-1 bg-transparent outline-none placeholder:text-gray-400"
													placeholder="Enter email address"
												/>
											</div>
										</div>

										{/* WhatsApp Number */}
										<div>
											<label className="block text-sm font-semibold mb-1">
												WhatsApp Number
											</label>
											<div className="flex items-center gap-0 rounded-lg px-3 py-1 bg-gray-100 border border-gray-200 focus-within:border-[var(--primary-color)] focus-within:ring-2 focus-within:ring-[var(--primary-color)]/20 transition-all duration-200">
												<MessageCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
												<input
													type="tel"
													{...register("whatsappNumber")}
													className="flex-1 bg-transparent outline-none placeholder:text-gray-400"
													placeholder="Enter WhatsApp number"
												/>
											</div>
										</div>

										{/* Location */}
										<div>
											<label className="block text-sm font-semibold mb-1">
												Location <span className="text-red-500">*</span>
											</label>
											<div className="flex items-center gap-0 rounded-lg px-3 py-1 bg-gray-100 border border-gray-200 focus-within:border-[var(--primary-color)] focus-within:ring-2 focus-within:ring-[var(--primary-color)]/20 transition-all duration-200">
												<MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
												<input
													type="text"
													{...register("location", validationSchema.location)}
													className="flex-1 bg-transparent outline-none placeholder:text-gray-400"
													placeholder="Enter your location (e.g., North Side, Chicago)"
												/>
											</div>
											{errors.location && (
												<p className="text-red-500 text-xs mt-1">
													{errors.location.message}
												</p>
											)}
										</div>
									</fieldset>
								</div>
							)}

							{/* STEP 4 Review and Submit */}
							{step === 4 && (
								<div className={`${getStepAnimationClass()} w-full`}>
									<h2 className="text-lg font-semibold text-gray-800 mb-4">Review & Submit</h2>

									{/* Success Info Box */}
									<div className="flex items-start gap-3 border border-green-200 bg-green-50 rounded-lg p-4 mb-6">
										<CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
										<div>
											<h3 className="text-green-700 font-medium text-sm">
												Almost Done!
											</h3>
											<p className="text-green-600 text-xs mt-0.5">
												Review your listing details below and submit for approval
											</p>
										</div>
									</div>

									{/* Preview Card */}
									<div className="border border-gray-200 rounded-xl p-5 space-y-4">
										{/* Title & Price */}
										<div className="flex justify-between items-start gap-4">
											<h3 className="text-[var(--primary-color)] font-semibold text-lg">
												{listingTitle || "Untitled Listing"}
											</h3>
											<p className="text-xl font-bold text-green-600 whitespace-nowrap">
												{listingCurrency === "USD" ? "$" : "₦"}
												{listingPrice || "0.00"}
											</p>
										</div>

										{/* Details Grid */}
										<div className="grid grid-cols-2 gap-3 text-sm">
											<div>
												<span className="text-gray-500">Category:</span>{" "}
												<span className="text-gray-800">{listingCategory || "Not set"}</span>
											</div>
											<div>
												<span className="text-gray-500">Condition:</span>{" "}
												<span className="text-gray-800">
													{CONDITIONS.find(c => c.value === listingCondition)?.label || "Not set"}
												</span>
											</div>
											<div>
												<span className="text-gray-500">Location:</span>{" "}
												<span className="text-gray-800">{listingLocation || "Not set"}</span>
											</div>
											<div>
												<span className="text-gray-500">Contact:</span>{" "}
												<span className="text-gray-800">{contactMethodsCount} method(s)</span>
											</div>
											<div>
												<span className="text-gray-500">Photos:</span>{" "}
												<span className="text-gray-800">
													{listingPhoto ? listingPhoto.length : 0} uploaded
												</span>
											</div>
										</div>

										<hr className="border-gray-200" />

										{/* Description */}
										<div>
											<h4 className="font-semibold text-gray-700 mb-1">Description</h4>
											<p className="text-gray-600 text-sm leading-relaxed">
												{listingDescription || "No description provided"}
											</p>
										</div>

										{/* Tags */}
										{selectedTags.length > 0 && (
											<div>
												<h4 className="font-semibold text-gray-700 mb-2">Tags</h4>
												<div className="flex flex-wrap gap-2">
													{selectedTags.map((tag) => (
														<span
															key={tag}
															className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full"
														>
															{tag}
														</span>
													))}
												</div>
											</div>
										)}
									</div>

									{/* Review Process Notice */}
									<div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm p-4 rounded-lg mt-4">
										<AlertTriangle className="w-5 h-5 mt-0.5 text-yellow-600 flex-shrink-0" />
										<div>
											<p className="font-semibold">Review Process</p>
											<p className="text-xs md:text-sm mt-0.5">
												Your listing will be reviewed by our team within 24 hours.
												You&apos;ll receive an email notification once it&apos;s approved and live.
											</p>
										</div>
									</div>
								</div>
							)}
						</div>

						{/* Navigation Buttons */}
						<div className="flex max-sm:flex-col justify-between gap-3 pt-6 border-t border-gray-100 mt-6">
							<button
								type="button"
								onClick={prev}
								disabled={isAnimating || isSubmitting || step === 1}
								className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								<ArrowLeft className="w-4 h-4" />
								Previous
							</button>

							<div className="flex gap-3 max-sm:justify-between">
								<button
									type="button"
									disabled={isSubmitting}
									className="px-5 py-2.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
								>
									Save Draft
								</button>

								{step === 4 ? (
									<button
										type="submit"
										disabled={isAnimating || isSubmitting}
										className="flex items-center gap-2 px-5 py-2.5 text-sm text-white bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color)]/90 disabled:opacity-50 transition-colors"
									>
										{isSubmitting ? "Submitting..." : "Submit for Review"}
										{!isSubmitting && <ArrowRight className="w-4 h-4" />}
									</button>
								) : (
									<button
										type="button"
										onClick={next}
										disabled={isAnimating || isSubmitting}
										className="flex items-center gap-2 px-5 py-2.5 text-sm text-white bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color)]/90 disabled:opacity-50 transition-colors"
									>
										Next
										<ArrowRight className="w-4 h-4" />
									</button>
								)}
							</div>
						</div>
					</form>
				</section>

				{/* Right Sidebar - Desktop Only */}
				{/* Right Sidebar - Desktop Only */}
				<MarketplaceSidebar showQuickAction={false} />
			</section>
		</>
	);
}

type TagProps = {
	label: string;
	active?: boolean;
	onClick?: () => void;
};

function Tag({ label, active, onClick }: TagProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-all duration-200 ${active
				? "bg-green-100 text-green-700 border-green-300"
				: "text-gray-600 border-gray-200 hover:bg-gray-50"
				}`}
		>
			<TagIcon className="w-3 h-3 flex-shrink-0" />
			<span className="whitespace-nowrap">{label}</span>
		</button>
	);
}
