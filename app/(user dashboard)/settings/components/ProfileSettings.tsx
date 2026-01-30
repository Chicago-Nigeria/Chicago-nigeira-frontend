"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Upload, User, Loader2, Save, X, Check } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/app/store/useSession";
import { callApi } from "@/app/libs/helper/callApi";
import { ApiResponse, IUser } from "@/app/types";
import FormFieldErrorMessage from "@/app/components/fieldError";

const profileSchema = z.object({
	firstName: z.string().min(2, "First name must be at least 2 characters"),
	lastName: z.string().min(2, "Last name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	phone: z.string().min(10, "Phone number must be at least 10 digits"),
	profession: z.string().optional(),
	company: z.string().optional(),
	location: z.string().optional(),
	bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileSettings() {
	const { user } = useSession((state) => state);
	const { updateUser } = useSession((state) => state.actions);
	const [uploading, setUploading] = useState(false);
	const [profileImage, setProfileImage] = useState<string | null>(user?.photo || null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Header image state
	const [uploadingHeader, setUploadingHeader] = useState(false);
	const [headerImage, setHeaderImage] = useState<string | null>(user?.headerImage || null);
	const [selectedHeaderFile, setSelectedHeaderFile] = useState<File | null>(null);
	const [headerPreviewUrl, setHeaderPreviewUrl] = useState<string | null>(null);
	const headerFileInputRef = useRef<HTMLInputElement>(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<ProfileFormData>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			phone: "",
			profession: "",
			company: "",
			location: "",
			bio: "",
		},
	});

	// Update form when user data loads
	useEffect(() => {
		if (user) {
			reset({
				firstName: user.firstName || "",
				lastName: user.lastName || "",
				email: user.email || "",
				phone: user.phone || "",
				profession: user.profession || "",
				company: user.company || "",
				location: user.location || "",
				bio: user.bio || "",
			});
			// Also update profile images
			setProfileImage(user.photo || null);
			setHeaderImage(user.headerImage || null);
		}
	}, [user, reset]);

	// Cleanup preview URLs on unmount
	useEffect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
			if (headerPreviewUrl) {
				URL.revokeObjectURL(headerPreviewUrl);
			}
		};
	}, [previewUrl, headerPreviewUrl]);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			toast.error("Image size must be less than 5MB");
			return;
		}

		// Validate file type
		if (!file.type.startsWith("image/")) {
			toast.error("Please upload an image file (JPG, PNG)");
			return;
		}

		// Clean up previous preview URL
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}

		// Create preview URL
		const preview = URL.createObjectURL(file);
		setPreviewUrl(preview);
		setSelectedFile(file);
	};

	const handleImageUpload = async () => {
		if (!selectedFile) return;

		setUploading(true);
		const formData = new FormData();
		formData.append("photo", selectedFile);

		try {
			const { data, error } = await callApi<ApiResponse<{ photo: string }>>(
				"/users/profile/photo",
				"PUT",
				formData
			);

			if (error) throw error;

			if (data?.data?.photo) {
				setProfileImage(data.data.photo);
				updateUser({ ...user!, photo: data.data.photo });
				toast.success("Profile picture updated successfully");

				// Clear preview and selected file
				if (previewUrl) {
					URL.revokeObjectURL(previewUrl);
				}
				setPreviewUrl(null);
				setSelectedFile(null);

				// Reset file input
				if (fileInputRef.current) {
					fileInputRef.current.value = "";
				}
			}
		} catch (error: any) {
			toast.error(error?.message || "Failed to upload image");
		} finally {
			setUploading(false);
		}
	};

	const handleCancelPreview = () => {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}
		setPreviewUrl(null);
		setSelectedFile(null);

		// Reset file input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	// Header image handlers
	const handleHeaderFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file size (max 10MB for header images)
		if (file.size > 10 * 1024 * 1024) {
			toast.error("Header image size must be less than 10MB");
			return;
		}

		// Validate file type
		if (!file.type.startsWith("image/")) {
			toast.error("Please upload an image file (JPG, PNG)");
			return;
		}

		// Clean up previous preview URL
		if (headerPreviewUrl) {
			URL.revokeObjectURL(headerPreviewUrl);
		}

		// Create preview URL
		const preview = URL.createObjectURL(file);
		setHeaderPreviewUrl(preview);
		setSelectedHeaderFile(file);
	};

	const handleHeaderImageUpload = async () => {
		if (!selectedHeaderFile) return;

		setUploadingHeader(true);
		const formData = new FormData();
		formData.append("header", selectedHeaderFile);

		try {
			const { data, error } = await callApi<ApiResponse<{ headerImage: string }>>(
				"/users/profile/header",
				"PUT",
				formData
			);

			if (error) throw error;

			if (data?.data?.headerImage) {
				setHeaderImage(data.data.headerImage);
				updateUser({ ...user!, headerImage: data.data.headerImage });
				toast.success("Header image updated successfully");

				// Clear preview and selected file
				if (headerPreviewUrl) {
					URL.revokeObjectURL(headerPreviewUrl);
				}
				setHeaderPreviewUrl(null);
				setSelectedHeaderFile(null);

				// Reset file input
				if (headerFileInputRef.current) {
					headerFileInputRef.current.value = "";
				}
			}
		} catch (error: any) {
			toast.error(error?.message || "Failed to upload header image");
		} finally {
			setUploadingHeader(false);
		}
	};

	const handleCancelHeaderPreview = () => {
		if (headerPreviewUrl) {
			URL.revokeObjectURL(headerPreviewUrl);
		}
		setHeaderPreviewUrl(null);
		setSelectedHeaderFile(null);

		// Reset file input
		if (headerFileInputRef.current) {
			headerFileInputRef.current.value = "";
		}
	};

	const onSubmit = async (formData: ProfileFormData) => {
		try {
			const { data, error } = await callApi<ApiResponse<IUser>>(
				"/users/profile",
				"PUT",
				formData
			);

			if (error) throw error;

			if (data?.data) {
				updateUser(data.data);
				toast.success("Profile updated successfully");
			}
		} catch (error: any) {
			toast.error(error?.message || "Failed to update profile");
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			<h2 className="text-lg font-semibold text-gray-900">Profile Settings</h2>

			{/* Header Image */}
			<div className="space-y-3">
				<label className="block text-sm font-medium text-gray-900">
					Cover Image (Optional)
				</label>
				<div className="space-y-3">
					<div className="relative w-full h-32 sm:h-40 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-600 overflow-hidden">
						{headerPreviewUrl ? (
							<Image
								src={headerPreviewUrl}
								alt="Header Preview"
								fill
								className="object-cover"
							/>
						) : headerImage ? (
							<Image
								src={headerImage}
								alt="Header"
								fill
								className="object-cover"
							/>
						) : null}
					</div>
					<div>
						{!headerPreviewUrl ? (
							<>
								<input
									ref={headerFileInputRef}
									type="file"
									accept="image/*"
									onChange={handleHeaderFileSelect}
									className="hidden"
								/>
								<button
									type="button"
									onClick={() => headerFileInputRef.current?.click()}
									disabled={uploadingHeader}
									className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<Upload className="w-4 h-4" />
									{headerImage ? "Change Cover" : "Upload Cover"}
								</button>
								<p className="text-xs text-gray-500 mt-1">Recommended: 1500 x 500 pixels (Max 10MB)</p>
							</>
						) : (
							<div className="space-y-2">
								<p className="text-sm text-gray-600">
									Cover image selected. Click upload to save.
								</p>
								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={handleHeaderImageUpload}
										disabled={uploadingHeader}
										className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{uploadingHeader ? (
											<>
												<Loader2 className="w-4 h-4 animate-spin" />
												Uploading...
											</>
										) : (
											<>
												<Check className="w-4 h-4" />
												Upload Cover
											</>
										)}
									</button>
									<button
										type="button"
										onClick={handleCancelHeaderPreview}
										disabled={uploadingHeader}
										className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<X className="w-4 h-4" />
										Cancel
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Profile Picture */}
			<div className="space-y-3">
				<label className="block text-sm font-medium text-gray-900">
					Profile Picture (Optional)
				</label>
				<div className="flex items-center gap-4">
					<div className="relative w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
						{previewUrl ? (
							<Image
								src={previewUrl}
								alt="Preview"
								fill
								className="object-cover"
							/>
						) : profileImage ? (
							<Image
								src={profileImage}
								alt="Profile"
								fill
								className="object-cover"
							/>
						) : (
							<User className="w-10 h-10 text-gray-400" />
						)}
					</div>
					<div className="flex-1">
						{!previewUrl ? (
							<>
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									onChange={handleFileSelect}
									className="hidden"
								/>
								<button
									type="button"
									onClick={() => fileInputRef.current?.click()}
									disabled={uploading}
									className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<Upload className="w-4 h-4" />
									Choose Photo
								</button>
								<p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP (Max 5MB)</p>
							</>
						) : (
							<div className="space-y-2">
								<p className="text-sm text-gray-600">
									Photo selected. Click upload to save.
								</p>
								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={handleImageUpload}
										disabled={uploading}
										className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{uploading ? (
											<>
												<Loader2 className="w-4 h-4 animate-spin" />
												Uploading...
											</>
										) : (
											<>
												<Check className="w-4 h-4" />
												Upload Photo
											</>
										)}
									</button>
									<button
										type="button"
										onClick={handleCancelPreview}
										disabled={uploading}
										className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<X className="w-4 h-4" />
										Cancel
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* First Name & Last Name */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-900 mb-1.5">
						First Name
					</label>
					<input
						{...register("firstName")}
						type="text"
						placeholder="John"
						className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 focus:border-[var(--primary-color)] bg-gray-50"
					/>
					<FormFieldErrorMessage error={errors.firstName} />
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-900 mb-1.5">
						Last Name
					</label>
					<input
						{...register("lastName")}
						type="text"
						placeholder="Doe"
						className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 focus:border-[var(--primary-color)] bg-gray-50"
					/>
					<FormFieldErrorMessage error={errors.lastName} />
				</div>
			</div>

			{/* Email & Phone */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-900 mb-1.5">
						Email Address
					</label>
					<input
						{...register("email")}
						type="email"
						placeholder="john.doe@example.com"
						className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 focus:border-[var(--primary-color)] bg-gray-50"
					/>
					<FormFieldErrorMessage error={errors.email} />
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-900 mb-1.5">
						Phone Number
					</label>
					<input
						{...register("phone")}
						type="tel"
						placeholder="+1 (312) 555-0123"
						className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 focus:border-[var(--primary-color)] bg-gray-50"
					/>
					<FormFieldErrorMessage error={errors.phone} />
				</div>
			</div>

			{/* Profession & Company */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-900 mb-1.5">
						Profession
					</label>
					<input
						{...register("profession")}
						type="text"
						placeholder="Software Engineer"
						className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 focus:border-[var(--primary-color)] bg-gray-50"
					/>
					<FormFieldErrorMessage error={errors.profession} />
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-900 mb-1.5">
						Company
					</label>
					<input
						{...register("company")}
						type="text"
						placeholder="Tech Innovations Inc."
						className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 focus:border-[var(--primary-color)] bg-gray-50"
					/>
					<FormFieldErrorMessage error={errors.company} />
				</div>
			</div>

			{/* Location */}
			<div>
				<label className="block text-sm font-medium text-gray-900 mb-1.5">
					Location
				</label>
				<input
					{...register("location")}
					type="text"
					placeholder="Chicago, IL"
					className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 focus:border-[var(--primary-color)] bg-gray-50"
				/>
				<FormFieldErrorMessage error={errors.location} />
			</div>

			{/* Bio */}
			<div>
				<label className="block text-sm font-medium text-gray-900 mb-1.5">
					Bio
				</label>
				<textarea
					{...register("bio")}
					rows={4}
					placeholder="Software Engineer passionate about connecting the Nigerian community in Chicago. Tech enthusiast and mentor."
					className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 focus:border-[var(--primary-color)] bg-gray-50 resize-none"
				/>
				<div className="flex justify-between items-center mt-1">
					<FormFieldErrorMessage error={errors.bio} />
					<p className="text-xs text-gray-500">
						{register("bio").name ? `${(user?.bio || "").length}/500 Characters` : "0/500 Characters"}
					</p>
				</div>
			</div>

			{/* Save Button */}
			<div className="flex justify-end">
				<button
					type="submit"
					disabled={isSubmitting}
					className="flex items-center gap-2 px-6 py-2.5 bg-[var(--primary-color)] text-white text-sm font-medium rounded-lg hover:bg-[var(--primary-color)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{isSubmitting ? (
						<>
							<Loader2 className="w-4 h-4 animate-spin" />
							Saving...
						</>
					) : (
						<>
							<Save className="w-4 h-4" />
							Save Changes
						</>
					)}
				</button>
			</div>
		</form>
	);
}
