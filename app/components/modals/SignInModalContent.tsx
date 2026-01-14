"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Mail } from "lucide-react";

import { callApi } from "@/app/libs/helper/callApi";
import { ApiResponse, AppError, IUser } from "@/app/types";
import { useSession } from "@/app/store/useSession";
import { useAuthModal } from "@/app/store/useAuthModal";
import FormFieldErrorMessage from "@/app/components/fieldError";

interface SignInModalContentProps {
	onSuccess?: () => void;
}

interface SignInFormData {
	email: string;
	otp?: string;
}

export default function SignInModalContent({
	onSuccess,
}: SignInModalContentProps) {
	const [step, setStep] = useState(1);
	const [resendCooldown, setResendCooldown] = useState(0);

	const { updateUser } = useSession((state) => state.actions);
	const { closeModal, switchToSignUp } = useAuthModal(
		(state) => state.actions,
	);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		watch,
	} = useForm<SignInFormData>({
		defaultValues: {
			email: "",
			otp: "",
		},
	});

	const email = watch("email");

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

	const handleSendOTP = async () => {
		if (!email) {
			toast.error("Please enter your email");
			return;
		}

		try {
			const { data, error } = await callApi<
				ApiResponse<{ message: string }>
			>("/auth/send-signin-otp", "POST", { email });

			if (error) throw error;

			toast.success(data?.message || "OTP sent to your email");
			setStep(2);
			startResendCooldown();
		} catch (error: any) {
			toast.error(
				error?.message || "Failed to send OTP. Please try again.",
			);
		}
	};

	const handleResendOTP = async () => {
		if (resendCooldown > 0) return;

		try {
			const { data, error } = await callApi<
				ApiResponse<{ message: string }>
			>("/auth/send-signin-otp", "POST", { email });

			if (error) throw error;

			toast.success("OTP resent successfully");
			startResendCooldown();
		} catch (error: any) {
			toast.error(error?.message || "Failed to resend OTP");
		}
	};

	const onSubmit = async (formData: SignInFormData) => {
		if (step === 1) {
			handleSendOTP();
			return;
		}

		// Step 2: Verify OTP and sign in
		try {
			const { data, error } = await callApi<ApiResponse<IUser> & { accessToken?: string; refreshToken?: string }>(
				`/auth/signin-with-otp`,
				"POST",
				{ email: formData.email, otp: formData.otp },
			);

			if (error) throw error;

			if (!data?.data) {
				throw new Error("Could not sign in!");
			}

			// Store tokens in localStorage for cross-origin auth
			if (data.accessToken) {
				localStorage.setItem("accessToken", data.accessToken);
			}
			if (data.refreshToken) {
				localStorage.setItem("refreshToken", data.refreshToken);
			}

			toast.success(data?.message || "Signed in successfully!");
			updateUser(data.data as IUser);

			// Close modal after successful signin
			closeModal();

			// Call optional success callback
			if (onSuccess) {
				onSuccess();
			}
		} catch (error) {
			const castErr = error as AppError;
			toast.error(
				castErr.message ?? "Invalid OTP or server error",
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

			{/* Step 1: Email Input */}
			{step === 1 && (
				<div className="w-full">
					<div className="flex flex-col items-center space-y-1 mb-4 sm:mb-6">
						<Mail className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--primary-color)]" />
						<h1 className="text-xl sm:text-2xl font-medium">Sign In</h1>
						<p className="text-gray-400 text-center text-sm">
							Enter your email to receive a verification code
						</p>
					</div>

					{/* Email */}
					<div className="mb-4 sm:mb-6">
						<label className="block text-sm font-medium mb-1">
							Email Address
						</label>
						<input
							type="email"
							{...register("email", {
								required: "Email is required",
								pattern: {
									value: /\S+@\S+\.\S+/,
									message: "Invalid email",
								},
							})}
							placeholder="Enter your email"
							className="w-full rounded-lg border border-gray-300 p-2.5 sm:p-3 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-200"
						/>
						<FormFieldErrorMessage error={errors.email} />
					</div>

					{/* Continue Button */}
					<button
						type="submit"
						disabled={isSubmitting}
						className="bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90 text-white w-full py-3 rounded-lg font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed"
					>
						{isSubmitting ? (
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
						Don&apos;t have an account?{" "}
						<button
							type="button"
							onClick={switchToSignUp}
							className="text-[var(--primary-color)] font-medium hover:underline"
						>
							Sign up
						</button>
					</p>
				</div>
			)}

			{/* Step 2: OTP Verification */}
			{step === 2 && (
				<div className="w-full">
					<div className="flex flex-col items-center space-y-1 mb-4 sm:mb-6">
						<Mail className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--primary-color)]" />
						<h1 className="text-xl sm:text-2xl font-medium">Verify Your Email</h1>
						<p className="text-gray-400 text-center text-sm">
							Enter the 6-digit code sent to {email}
						</p>
					</div>

					{/* OTP Input */}
					<div className="mb-3 sm:mb-4">
						<label className="block text-sm font-medium mb-1">
							Verification Code
						</label>
						<input
							type="text"
							{...register("otp", {
								required: "OTP is required",
								minLength: {
									value: 6,
									message: "OTP must be 6 digits",
								},
								maxLength: {
									value: 6,
									message: "OTP must be 6 digits",
								},
							})}
							maxLength={6}
							className="w-full rounded-lg border border-gray-300 p-2.5 sm:p-3 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all duration-200 text-center text-xl sm:text-2xl tracking-widest"
							placeholder="000000"
						/>
						<FormFieldErrorMessage error={errors.otp} />
					</div>

					{/* Resend OTP */}
					<div className="text-center mb-4 sm:mb-6">
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
							"Sign In"
						)}
					</button>

					{/* Footer */}
					<p className="text-center text-sm mt-4">
						Don&apos;t have an account?{" "}
						<button
							type="button"
							onClick={switchToSignUp}
							className="text-[var(--primary-color)] font-medium hover:underline"
						>
							Sign up
						</button>
					</p>
				</div>
			)}
		</form>
	);
}
