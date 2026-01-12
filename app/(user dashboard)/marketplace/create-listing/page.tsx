"use client";
import { useState, useCallback } from "react";
import {
	AlertTriangle,
	ArrowLeft,
	ArrowRight,
	BriefcaseConveyorBelt,
	ChartNoAxesColumnIncreasing,
	CheckCircle,
	MapPin,
	Store,
	TagIcon,
	UsersRound,
} from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { CustomPhotoInput } from "./upload";
import Link from "next/link";
import CustomSelectButton from "../../components/customSelect";
import { callApi } from "@/app/libs/helper/callApi";
import FormFieldErrorMessage from "@/app/components/fieldError";
import { useSession } from "@/app/store/useSession";
import { useAuthModal } from "@/app/store/useAuthModal";

// Enhanced types
type PriceType = "fixed" | "negotiable";
type Condition = "Used - Good" | "Used - Like New" | "New" | "Used - Fair";

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
};

// Validation schema
const validationSchema = {
	title: {
		required: "Title is required",
		minLength: { value: 5, message: "Title must be at least 5 characters" },
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
		minLength: { value: 5, message: "Must be at least 5 characters" },
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
	const [step, setStep] = useState<number>(1);
	const [direction, setDirection] = useState<"left" | "right">("right");
	const [isAnimating, setIsAnimating] = useState<boolean>(false);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [selectedTags, setSelectedTags] = useState<string[]>([
		"Handmade",
		"Nigerian",
	]);

	const methods = useForm<Product>({
		defaultValues: {
			title: "",
			category: "",
			currency: "USD",
			price: "",
			location: "",
			priceType: "negotiable",
			condition: "Used - Fair",
			description: "",
			tags: "",
		},
		mode: "onChange",
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
		trigger,
		watch,
	} = methods;

	// Prevent step from going out of bounds
	if (step > 3) setStep(3);
	if (step < 1) setStep(1);

	const listingTitle = watch("title");
	const listingCategory = watch("category");
	const listingPrice = watch("price");
	const listingDescription = watch("description");
	const listingLocation = watch("location");
	const listingCondition = watch("condition");
	const listingPhoto = watch("photo");
	const listingCurrency = watch("currency");
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
			formData.append("tags", selectedTags.join(","));

			// Append photo files
			if (data.photo && data.photo.length > 0) {
				for (let i = 0; i < data.photo.length; i++) {
					formData.append("photos", data.photo[i]);
				}
			}

			// Append video files if any
			// if (data.video && data.video.length > 0) {
			// 	for (let i = 0; i < data.video.length; i++) {
			// 		formData.append("videos", data.video[i]);
			// 	}
			// }

			// Use callApi instead of useSWRMutation
			const { data: response, error } = await callApi(
				"/listing",
				"POST",
				formData,
			);

			if (error) {
				throw new Error(error.message || "Failed to create listing");
			}

			// console.log("Posted:", response);
			toast.success("Listing created successfully");
			// Optional: Reset form after successful submission
			// methods.reset();
			// setStep(1);
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
					setStep((current) => Math.min(current + 1, 3));
				} else {
					setStep((current) => Math.max(current - 1, 1));
				}
				setIsAnimating(false);
			}, 300);
		},
		[isAnimating],
	);

	// FIXED: Better photo validation logic
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
			// ✅ FIRST check if photos exist - better UX
			const photos = watch("photo");
			if (!photos || photos.length === 0) {
				toast.error("Please add at least one photo");
				return;
			}

			// ✅ THEN validate other fields (description only)
			fieldsToValidate = ["description"];
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

	return (
		<section className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-8 lg:gap-12">
			<section className="bg-white/10 space-y-4 px-2">
				{/* PROGRESS STEPS */}
				<div className="bg-white px-3 md:px-12 py-4 md:py-14 rounded-xl">
					<div className="flex justify-between items-center gap-2 relative overflow-x-auto no-scrollbar scroll-smooth">
						{[
							{
								id: 1,
								title: "Basic Info",
								description: "Title, category, and price",
							},
							{
								id: 2,
								title: "Product Media",
								description: "Upload photos and videos",
							},
							{
								id: 3,
								title: "Review & Submit",
								description: "Final review before submitting",
							},
						].map(({ id, title, description }) => {
							const isCompleted = step > id;
							const isCurrent = step === id;

							return (
								<div
									key={id}
									className={`
                    flex-shrink-0 flex flex-col justify-center items-center
                    p-3 md:p-4 text-center rounded-lg transition-all duration-300
                    w-[110px] sm:w-[130px] md:w-auto
                    ${
						isCompleted
							? "border border-[var(--primary-color)] bg-[var(--primary-color)]/5 text-[var(--primary-color)]"
							: isCurrent
								? "border-2 border-[var(--primary-color)] bg-white shadow-md text-[var(--primary-color)]"
								: "border border-gray-300 bg-white text-gray-400"
					}
                  `}
								>
									{/* Step number */}
									<p
										className="
                      w-6 h-6 md:w-8 md:h-8 bg-[var(--primary-color)]
                      text-white rounded-full flex items-center justify-center mb-2
                      font-semibold text-sm md:text-base
                    "
									>
										{id}
									</p>

									{/* Step title */}
									<p className="font-semibold text-xs md:text-sm text-gray-700 whitespace-nowrap">
										{title}
									</p>

									{/* Step description */}
									<p className="hidden md:block text-gray-500 text-xs max-w-28">
										{description}
									</p>
								</div>
							);
						})}
					</div>
				</div>

				<form
					onSubmit={handleSubmit(onSubmit)}
					className="px-2 md:px-8 bg-white rounded-xl w-full py-4 text-sm relative signup-form"
					encType="multipart/form-data"
				>
					{/* STEP CONTENT CONTAINER */}
					<div className="relative min-h-[400px] px-2">
						{/* STEP 1 Basic Info*/}
						{step === 1 && (
							<div
								className={`${getStepAnimationClass()} w-full`}
							>
								<fieldset className="space-y-4 mt-8 pb-4">
									<div>
										<label
											htmlFor="title"
											className="block text-sm md:text-base font-semibold mb-1"
										>
											Listing Title
										</label>
										<p className="text-gray-400 text-xs my-1">
											Write a clear, descriptive title
											that highlights the key features
										</p>
										<input
											type="text"
											{...register(
												"title",
												validationSchema.title,
											)}
											className="w-full rounded-lg p-3 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-200"
											placeholder="e.g. Authentic Nigerian Ankara Dresses - Made to order"
										/>
										{errors.title && (
											<p className="text-red-500 text-xs mt-1">
												{errors.title.message}
											</p>
										)}
									</div>
									<div>
										<label
											htmlFor="category"
											className="block text-sm md:text-base font-semibold mb-1"
										>
											Category
										</label>
										<p className="text-gray-400 text-xs my-1">
											Choose the category that best
											describes your item or service
										</p>
										<select
											{...register(
												"category",
												validationSchema.category,
											)}
											className="w-full rounded-lg p-3 bg-gray-100 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-200"
										>
											<option value="">
												Choose a category
											</option>
											{CATEGORIES.map((category) => (
												<option
													key={category}
													value={category}
												>
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
									<div>
										<label
											htmlFor="location"
											className="block text-sm md:text-base font-semibold mb-1"
										>
											Location
										</label>
										{/*<p className="text-gray-400 text-xs my-1">
											Write a clear, descriptive title
											that highlights the key features
										</p>*/}
										<input
											type="text"
											{...register(
												"location",
												validationSchema.location,
											)}
											className="w-full rounded-lg p-3 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-200"
											placeholder="e.g. Authentic Nigerian Ankara Dresses - Made to order"
										/>
										{errors.location && (
											<p className="text-red-500 text-xs mt-1">
												{errors.location.message}
											</p>
										)}
									</div>
									<div className="flex flex-col sm:flex-row sm:gap-8 gap-4">
										{/*<div className="shrink-0 flex-1">
											<label
												htmlFor="price"
												className="block text-sm md:text-base font-semibold mb-1"
											>
												Price
											</label>
											<input
												type="text"
												{...register(
													"price",
													validationSchema.price,
												)}
												className="w-full flex-1 rounded-lg p-3 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-200"
												placeholder="$0.00"
											/>
											{errors.price && (
												<p className="text-red-500 text-xs mt-1">
													{errors.price.message}
												</p>
											)}
										</div>*/}
										<div>
											<label className="block text-sm font-medium mb-1">
												Price
											</label>
											<div className="flex rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[var(--primary-color)]/20 focus-within:border-[var(--primary-color)] transition-all duration-200 bg-gray-100">
												<select
													{...register("currency")}
													className="bg-gray-100 px-3 py-3 text-sm text-gray-700 focus:outline-none border-r border-gray-200"
												>
													{["NGN", "USD"].map(
														(currency) => (
															<option
																key={currency}
																value={currency}
															>
																{currency}
															</option>
														),
													)}
												</select>
												<input
													type="text"
													{...register("price")}
													className="flex-1 px-3 py-3 text-sm sm:text-base focus:outline-none"
													placeholder="$0.00"
												/>
											</div>
											<FormFieldErrorMessage
												error={errors.price}
											/>
										</div>
										<div className="shrink-0 flex-1">
											<label
												htmlFor="priceType"
												className="block text-sm md:text-base font-semibold mb-1"
											>
												Price Type
											</label>
											<select
												{...register("priceType")}
												className="w-full text-left rounded-lg p-3 bg-gray-100 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-200"
												name="priceType"
											>
												{["fixed", "negotiable"].map(
													(type) => (
														<option
															key={type}
															value={type}
														>
															{type}
														</option>
													),
												)}
											</select>

											{errors.priceType && (
												<p className="text-red-500 text-xs mt-1">
													{errors.priceType.message}
												</p>
											)}
										</div>
									</div>

									<div>
										<label
											htmlFor="condition"
											className="block text-sm md:text-base font-semibold mb-1"
										>
											Condition
										</label>
										<p className="text-gray-400 text-xs my-1">
											What condition is your product in?
										</p>
										<select
											{...register("condition")}
											className="w-full text-left rounded-lg p-3 bg-gray-100 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-200"
											name="condition"
										>
											{[
												"New",
												"Used - Like New",
												"Used - Good",
												"Used - Fair",
											].map((type) => (
												<option key={type} value={type}>
													{type}
												</option>
											))}
										</select>
										{/*<CustomSelectButton

											label="Select Condition"
											options={}
										/>*/}
										{errors.condition && (
											<p className="text-red-500 text-xs mt-1">
												{errors.condition.message}
											</p>
										)}
									</div>
								</fieldset>
							</div>
						)}

						{/* STEP 2 Product Media*/}
						{step === 2 && (
							<div
								className={`${getStepAnimationClass()} w-full`}
							>
								<fieldset className="space-y-4 mt-8 bg-white">
									<div>
										<label
											htmlFor="description"
											className="block text-sm md:text-base font-semibold mb-1"
										>
											Description
										</label>
										<p className="text-gray-400 text-xs my-1">
											Describe your product in detail to
											attract buyers
										</p>
										<textarea
											{...register(
												"description",
												validationSchema.description,
											)}
											className="w-full rounded-lg resize-none min-h-30 bg-gray-100 p-3 border border-gray-300 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-200"
											placeholder="Write a description for your product"
											rows={5}
										/>
										{errors.description && (
											<p className="text-red-500 text-xs mt-1">
												{errors.description.message}
											</p>
										)}
									</div>
									<div>
										<label
											htmlFor="photo"
											className="block text-sm md:text-base font-semibold mb-1"
										>
											Photos
										</label>
										<p className="text-gray-400 text-xs my-1">
											Add up to 8 photos. First photo will
											be your main listing image.
										</p>

										<FormProvider {...methods}>
											<CustomPhotoInput
												name="photo"
												multiple={true}
												className="w-full p-3 border border-gray-300 rounded-lg cursor-pointer"
											/>
										</FormProvider>

										{/* Photo validation message */}
										{errors.photo && (
											<p className="text-red-500 text-xs mt-1">
												{errors.photo.message}
											</p>
										)}

										{/* Photo count display */}
										{listingPhoto &&
											listingPhoto.length > 0 && (
												<p className="text-green-600 text-xs mt-2">
													✅ {listingPhoto.length}{" "}
													photo(s) selected - Ready to
													proceed
												</p>
											)}
									</div>

									{/* Tags Section */}
									<div>
										<label className="block text-sm md:text-base font-semibold mb-3">
											Product Tags
										</label>

										{/* Selected Tags */}
										<div className="flex flex-wrap gap-2 mb-4">
											{selectedTags.map((tag) => (
												<Tag
													key={tag}
													label={tag}
													active={true}
													onClick={() =>
														toggleTag(tag)
													}
												/>
											))}
										</div>

										{/* Suggested Tags */}
										<h3 className="font-medium text-gray-700 mb-3">
											Suggested tags:
										</h3>
										<div className="flex flex-wrap gap-2">
											{suggestedTags.map((tag) => (
												<Tag
													key={tag}
													label={tag}
													active={selectedTags.includes(
														tag,
													)}
													onClick={() =>
														toggleTag(tag)
													}
												/>
											))}
										</div>
									</div>
								</fieldset>
							</div>
						)}

						{/* STEP 3 Review and Submit*/}
						{step === 3 && (
							<div
								className={`${getStepAnimationClass()} space-y-4`}
							>
								{/* Review & Submit Section */}
								<section className="rounded-lg py-6">
									<h2 className="font-semibold text-gray-800 mb-3">
										Review & Submit
									</h2>
									<div className="flex items-start gap-3 border border-green-400 bg-green-50 rounded-md p-4">
										<CheckCircle
											className="text-green-500 mt-0.5"
											size={20}
										/>
										<div>
											<h3 className="text-green-600 font-medium">
												Almost Done!
											</h3>
											<p className="text-gray-600 text-sm">
												Review your listing details
												below and submit for approval
											</p>
										</div>
									</div>
								</section>
								<div className="mx-auto bg-white rounded-2xl p-4 border border-gray-200">
									{/* Title & Price */}
									<div className="flex justify-between items-start mb-4">
										<Link
											href="#"
											className="text-[var(--primary-color)] font-semibold hover:underline text-base md:text-lg"
										>
											{listingTitle}
										</Link>
										<p className="text-xl font-bold text-green-600">
											{listingCurrency === "USD"
												? "$"
												: "₦"}
											{listingPrice}
										</p>
									</div>

									{/* Category, Condition, Location, Contact */}
									<div className="space-y-2 text-sm">
										<p>
											<span className="font-medium text-gray-600">
												Category:
											</span>{" "}
											<span className="text-gray-800">
												{listingCategory}
											</span>
										</p>
										<p>
											<span className="font-medium text-gray-600">
												Condition:
											</span>{" "}
											<span className="text-gray-800">
												{listingCondition}
											</span>
										</p>
										<p>
											<span className="font-medium text-gray-600">
												Location:
											</span>{" "}
											<span className="text-gray-800">
												{listingLocation}
											</span>
										</p>
										<p>
											<span className="font-medium text-gray-600">
												Contact:
											</span>{" "}
											<span className="text-gray-800">
												3 method(s)
											</span>
										</p>
										<p>
											<span className="font-medium text-gray-600">
												Photos:
											</span>{" "}
											<span className="text-gray-800">
												{listingPhoto
													? listingPhoto.length
													: 0}{" "}
												uploaded
											</span>
										</p>
									</div>

									<hr className="my-4" />

									{/* Description */}
									<div className="mb-4">
										<h3 className="font-semibold text-gray-700 mb-1">
											Description
										</h3>
										<p className="text-gray-600 text-sm leading-relaxed">
											{listingDescription}
										</p>
									</div>

									{/* Tags */}
									<div className="mb-6">
										<h3 className="font-semibold text-gray-700 mb-2">
											Tags
										</h3>
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

									{/* Review Process Notice */}
									<div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm p-4 rounded-lg mb-6">
										<AlertTriangle className="w-5 h-5 mt-0.5 text-yellow-600 flex-shrink-0" />
										<div>
											<p className="font-semibold">
												Review Process
											</p>
											<p className="text-xs md:text-sm">
												Your listing will be reviewed by
												our team within 24 hours.
												You&apos;ll receive an email
												notification once it&apos;s
												approved and live.
											</p>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
					<CommonButton
						step={step}
						next={next}
						prev={prev}
						isAnimating={isAnimating}
						isSubmitting={isSubmitting}
					/>
				</form>
			</section>
			<section className="space-y-8 sticky top-0 h-screen pt-4 hidden lg:block">
				<div className="bg-white p-4 rounded-lg space-y-4">
					<h2 className="flex items-center gap-1 font-semibold">
						<span>Community stats</span>{" "}
						<ChartNoAxesColumnIncreasing className="w-6 h-6 text-[var(--primary-color)]" />
					</h2>
					<div className="space-y-3 community-stats-items">
						<div className="flex justify-between">
							<p>Active Members</p>
							<p className="font-semibold">2,847</p>
						</div>
						<div className="flex justify-between">
							<p>Posts today</p>
							<p className="font-semibold">127</p>
						</div>
						<div className="flex justify-between">
							<p>Events This Week</p>
							<p className="font-semibold">8</p>
						</div>
					</div>
				</div>
				<div className="bg-white p-4 rounded-lg space-y-4">
					<h2 className="font-semibold">Popular Categories</h2>
					<div className="space-y-3 community-stats-items">
						<div className="flex justify-between">
							<p>Fashion</p>
							<p className="font-semibold">28</p>
						</div>
						<div className="flex justify-between">
							<p>Services</p>
							<p className="font-semibold">34</p>
						</div>
						<div className="flex justify-between">
							<p>Food</p>
							<p className="font-semibold">23</p>
						</div>
						<div className="flex justify-between">
							<p>Housing</p>
							<p className="font-semibold">8</p>
						</div>
					</div>
					<hr className="border border-gray-200 my-4" />

					<div className="space-y-3">
						<h2 className="font-semibold">Quick Links</h2>
						<div className="ml-4 space-y-3 community-stats-items quick-actions">
							<div className="flex items-center gap-2 hover:text-[var(--primary-color)] cursor-pointer transition-colors">
								<MapPin className="w-4 h-4" />
								<p>Find Local Events</p>
							</div>
							<div className="flex items-center gap-2 hover:text-[var(--primary-color)] cursor-pointer transition-colors">
								<UsersRound className="w-4 h-4" />
								<p>Join Groups</p>
							</div>
							<div className="flex items-center gap-2 hover:text-[var(--primary-color)] cursor-pointer transition-colors">
								<BriefcaseConveyorBelt className="w-4 h-4" />
								<p>Browse Jobs</p>
							</div>
						</div>
					</div>
				</div>
			</section>
		</section>
	);
}

interface CommonButtonProps {
	next: () => void;
	prev: () => void;
	step: number;
	isAnimating: boolean;
	isSubmitting?: boolean;
}

export function CommonButton({
	next,
	prev,
	isAnimating,
	step,
	isSubmitting = false,
}: CommonButtonProps) {
	return (
		<div className="flex justify-end gap-2 pt-8 mb-4 text-xs md:text-sm">
			<button
				type="button"
				onClick={prev}
				disabled={isAnimating || isSubmitting || step === 1}
				className="w-fit mr-auto py-3 px-4 border hover:text-white rounded-lg flex justify-center items-center gap-2 hover:bg-[var(--primary-color)]/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
			>
				<ArrowLeft className="w-4 h-4" />
				<span>Previous</span>
			</button>

			<button
				type="button"
				disabled={isSubmitting}
				className="w-fit py-3 px-4 border hover:text-white rounded-lg flex justify-center items-center gap-2 hover:bg-[var(--primary-color)]/90 cursor-pointer disabled:opacity-50 transition-all duration-200"
			>
				Save Draft
			</button>
			<button
				type={step === 3 ? "submit" : "button"}
				onClick={step === 3 ? undefined : next}
				disabled={isAnimating || isSubmitting}
				className="w-fit py-3 px-4 text-white rounded-lg flex justify-center items-center gap-2 bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90 cursor-pointer disabled:opacity-50 transition-all duration-200"
			>
				<span>
					{isSubmitting
						? "Submitting..."
						: step === 3
							? "Submit Review"
							: "Next"}
				</span>
				{!isSubmitting && step !== 3 && (
					<ArrowRight className="w-4 h-4" />
				)}
			</button>
		</div>
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
			className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-full border transition-all duration-200 ${
				active
					? "bg-green-100 text-green-700 border-green-400"
					: "text-gray-600 border-gray-300 hover:bg-gray-100"
			}`}
		>
			<TagIcon className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
			<span className="whitespace-nowrap">{label}</span>
		</button>
	);
}
