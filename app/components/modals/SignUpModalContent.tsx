"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Mail, User } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

import { callApi } from "@/app/libs/helper/callApi";
import { ApiResponse, IUser } from "@/app/types";
import { useSession } from "@/app/store/useSession";
import { useAuthModal } from "@/app/store/useAuthModal";
import {
	simplifiedSignupSchema,
	SimplifiedSignupSchema,
} from "@/app/libs/types/zodSchemas";
import FormFieldErrorMessage from "@/app/components/fieldError";

interface SignUpModalContentProps {
	onSuccess?: () => void;
}

export default function SignUpModalContent({
	onSuccess,
}: SignUpModalContentProps) {
	const [step, setStep] = useState(1);
	const [otpSent, setOtpSent] = useState(false);
	const [resendCooldown, setResendCooldown] = useState(0);
	const [sendingOTP, setSendingOTP] = useState(false);

	const { updateUser } = useSession((state) => state.actions);
	const { closeModal, switchToSignIn } = useAuthModal(
		(state) => state.actions,
	);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		watch,
		trigger,
	} = useForm<SimplifiedSignupSchema>({
		resolver: zodResolver(simplifiedSignupSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			phone: "",
			email: "",
			countryCode: "+1",
			otp: "",
		},
	});

	const formData = watch();

	const handleNext = async () => {
		// Validate step 1 fields
		const isValid = await trigger([
			"firstName",
			"lastName",
			"email",
			"phone",
		]);

		if (!isValid) {
			toast.error("Please fix the errors before continuing");
			return;
		}

		// Send OTP
		setSendingOTP(true);
		try {
			const { data, error } = await callApi<
				ApiResponse<{ message: string }>
			>("/auth/send-otp", "POST", {
				email: formData.email,
				phone: `${formData.countryCode}${formData.phone}`,
			});

			if (error) throw error;

			toast.success(data?.message || "OTP sent to your email");
			setOtpSent(true);
			setStep(2);
			startResendCooldown();
		} catch (error: any) {
			toast.error(
				error?.message || "Failed to send OTP. Please try again.",
			);
		} finally {
			setSendingOTP(false);
		}
	};

	const handleResendOTP = async () => {
		if (resendCooldown > 0) return;

		try {
			const { data, error } = await callApi<
				ApiResponse<{ message: string }>
			>("/auth/send-otp", "POST", {
				email: formData.email,
				phone: `${formData.countryCode}${formData.phone}`,
			});

			if (error) throw error;

			toast.success("OTP resent successfully");
			startResendCooldown();
		} catch (error: any) {
			toast.error(error?.message || "Failed to resend OTP");
		}
	};

	const startResendCooldown = () => {
		setResendCooldown(60);
		const interval = setInterval(() => {
			setResendCooldown((prev) => {
				if (prev <= 1) {
					clearInterval(interval);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	};

	const onSubmit = async (data: SimplifiedSignupSchema) => {
		if (step === 1) {
			handleNext();
			return;
		}

		// Step 2: Verify OTP and create account
		try {
			const { data: signupData, error } = await callApi<
				ApiResponse<IUser>
			>("/auth/signup-simple", "POST", {
				firstName: data.firstName,
				lastName: data.lastName,
				phone: data.phone,
				email: data.email,
				countryCode: data.countryCode,
				otp: data.otp,
				fullPhoneNumber: `${data.countryCode}${data.phone}`,
			});

			if (error) throw error;

			if (!signupData?.data) {
				throw new Error("Could not create account!");
			}

			toast.success(signupData?.message || "Account created successfully!");
			updateUser(signupData.data as IUser);

			// Close modal after successful signup
			closeModal();

			// Call optional success callback
			if (onSuccess) {
				onSuccess();
			}
		} catch (error: any) {
			toast.error(
				error?.message || "Failed to create account. Please try again.",
			);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="w-full">
			{/* Back button */}
			{step > 1 && (
				<button
					type="button"
					onClick={() => setStep(1)}
					className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors mb-2"
				>
					<ArrowLeft className="w-4 h-4" />
					<span className="text-sm">Back</span>
				</button>
			)}

			{/* Logo */}
			<div className="flex justify-center mb-3 sm:mb-4">
				<Image
					src="/chicago-nigeria-logo-1.png"
					alt="logo"
					width={120}
					height={35}
					className="h-8 sm:h-10 object-contain"
				/>
			</div>

			

			{/* Step 1: Personal Information */}
			{step === 1 && (
				<div className="w-full">
					<div className="flex flex-col items-center space-y-1 mb-4 sm:mb-6">
						<User className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--primary-color)]" />
						<h1 className="text-xl sm:text-2xl font-medium">
							Personal Information
						</h1>
						<p className="text-gray-400 text-center text-sm">
							Let&apos;s start with the basics
						</p>
					</div>

					{/* First Name & Last Name */}
					<div className="flex flex-col sm:flex-row sm:gap-2 gap-3 mb-3 sm:mb-4">
						<div className="flex-1">
							<label className="block text-sm font-medium mb-1">
								First Name
							</label>
							<input
								type="text"
								{...register("firstName")}
								className="w-full rounded-lg border border-gray-300 p-2.5 sm:p-3 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-200"
								placeholder="Enter your first name"
							/>
							<FormFieldErrorMessage error={errors.firstName} />
						</div>
						<div className="flex-1">
							<label className="block text-sm font-medium mb-1">
								Last Name
							</label>
							<input
								type="text"
								{...register("lastName")}
								className="w-full rounded-lg border border-gray-300 p-2.5 sm:p-3 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-200"
								placeholder="Enter your last name"
							/>
							<FormFieldErrorMessage error={errors.lastName} />
						</div>
					</div>

					{/* Email */}
					<div className="mb-3 sm:mb-4">
						<label className="block text-sm font-medium mb-1">
							Email Address
						</label>
						<input
							type="email"
							{...register("email")}
							className="w-full rounded-lg border border-gray-300 p-2.5 sm:p-3 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-200"
							placeholder="Enter your email address"
						/>
						<FormFieldErrorMessage error={errors.email} />
					</div>

					{/* Phone Number */}
					<div className="mb-4 sm:mb-6">
						<label className="block text-sm font-medium mb-1">
							Phone Number
						</label>
						<div className="flex rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[var(--primary-color)]/20 focus-within:border-[var(--primary-color)] border border-gray-300 transition-all duration-200 bg-white">
							<select
								{...register("countryCode")}
								className="bg-white ps-1 py-2.5 sm:py-3 text-sm text-gray-700 focus:outline-none border-r border-gray-300"
							>
								<option value="+1">+1 (US)</option>
								{/* <option value="+44">+44 (UK)</option>
								<option value="+234">+234 (NG)</option>
								<option value="+91">+91 (IN)</option> */}
							</select>
							<input
								type="text"
								{...register("phone")}
								className="flex-1 px-3 py-2.5 sm:py-3 focus:outline-none"
								placeholder="Enter your phone number"
							/>
						</div>
						<FormFieldErrorMessage error={errors.phone} />
					</div>

					{/* Next Button */}
					<button
						type="button"
						onClick={handleNext}
						disabled={sendingOTP}
						className="bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90 text-white w-full py-3 rounded-lg font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed"
					>
						{sendingOTP ? (
							<span className="flex justify-center items-center">
								<Loader2 className="w-5 h-5 text-white mr-2 animate-spin" />
								Sending OTP...
							</span>
						) : (
							"Continue"
						)}
					</button>

					{/* Footer */}
					<p className="text-center text-sm mt-4">
						Already have an account?{" "}
						<button
							type="button"
							onClick={switchToSignIn}
							className="text-[var(--primary-color)] font-medium hover:underline"
						>
							Sign in
						</button>
					</p>
				</div>
			)}

			{/* Step 2: OTP Verification */}
			{step === 2 && (
				<div className="w-full">
					<div className="flex flex-col items-center space-y-1 mb-6">
						<Mail className="w-10 h-10 text-[var(--primary-color)]" />
						<h1 className="text-2xl font-medium">Verify Your Email</h1>
						<p className="text-gray-400 text-center text-sm">
							Enter the 6-digit code sent to {formData.email}
						</p>
					</div>

					{/* OTP Input */}
					<div className="mb-4">
						<label className="block text-sm font-medium mb-1">
							Verification Code
						</label>
						<input
							type="text"
							{...register("otp")}
							maxLength={6}
							className="w-full rounded-lg border border-gray-300 p-3 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-200 text-center text-2xl tracking-widest"
							placeholder="000000"
						/>
						<FormFieldErrorMessage error={errors.otp} />
					</div>

					{/* Resend OTP */}
					<div className="text-center mb-6">
						{resendCooldown > 0 ? (
							<p className="text-sm text-gray-500">
								Resend code in {resendCooldown}s
							</p>
						) : (
							<button
								type="button"
								onClick={handleResendOTP}
								className="text-sm text-[var(--primary-color)] hover:underline"
							>
								Didn&apos;t receive code? Resend
							</button>
						)}
					</div>

					{/* Submit Button */}
					<button
						type="submit"
						disabled={isSubmitting}
						className="bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90 text-white w-full py-3 rounded-lg font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed"
					>
						{isSubmitting ? (
							<span className="flex justify-center items-center">
								<Loader2 className="w-5 h-5 text-white mr-2 animate-spin" />
								Verifying...
							</span>
						) : (
							"Verify & Create Account"
						)}
					</button>

					{/* Footer */}
					<p className="text-center text-sm mt-4">
						Already have an account?{" "}
						<button
							type="button"
							onClick={switchToSignIn}
							className="text-[var(--primary-color)] font-medium hover:underline"
						>
							Sign in
						</button>
					</p>
				</div>
			)}
		</form>
	);
}
