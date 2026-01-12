"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useSession } from "@/app/store/useSession";
import { useAuthModal } from "@/app/store/useAuthModal";

export function GuestBanner() {
	const { user } = useSession((state) => state);
	const { openSignUp } = useAuthModal((state) => state.actions);
	const [isDismissed, setIsDismissed] = useState(false);

	// Check localStorage for dismissal status
	useEffect(() => {
		const dismissed = localStorage.getItem("guestBannerDismissed");
		if (dismissed === "true") {
			setIsDismissed(true);
		}
	}, []);

	const handleDismiss = () => {
		localStorage.setItem("guestBannerDismissed", "true");
		setIsDismissed(true);
	};

	// Don't show if user is logged in or banner is dismissed
	if (user || isDismissed) return null;

	return (
		<div className="bg-[var(--primary-color)] text-white py-3 px-4 flex items-center justify-between gap-4 shadow-md">
			<p className="text-sm md:text-base">
				Sign up to like, comment, and create content
			</p>
			<div className="flex items-center gap-2 md:gap-3">
				<button
					onClick={() => openSignUp()}
					className="px-3 md:px-4 py-1.5 md:py-2 text-sm bg-white text-[var(--primary-color)] rounded-lg font-medium hover:bg-gray-100 transition-colors whitespace-nowrap"
				>
					Sign Up
				</button>
				<button
					onClick={handleDismiss}
					className="p-1 hover:bg-white/20 rounded-full transition-colors"
					aria-label="Dismiss banner"
				>
					<X className="w-5 h-5" />
				</button>
			</div>
		</div>
	);
}
