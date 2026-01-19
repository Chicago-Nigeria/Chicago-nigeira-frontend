"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonProps {
	title: string;
	url?: string;
	className?: string;
}

export default function ShareButton({ title, url, className }: ShareButtonProps) {
	const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

	// Check if device is mobile
	const isMobile = () => {
		if (typeof window === 'undefined') return false;
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	};

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(shareUrl);
			toast.success("Link copied to clipboard!");
			return true;
		} catch (error) {
			// Fallback for older browsers
			try {
				const textArea = document.createElement('textarea');
				textArea.value = shareUrl;
				textArea.style.position = 'fixed';
				textArea.style.left = '-999999px';
				document.body.appendChild(textArea);
				textArea.select();
				document.execCommand('copy');
				document.body.removeChild(textArea);
				toast.success("Link copied to clipboard!");
				return true;
			} catch (fallbackError) {
				console.error("Failed to copy:", fallbackError);
				toast.error("Failed to copy link");
				return false;
			}
		}
	};

	const shareContent = async () => {
		// Only use native share on mobile devices
		if (isMobile() && navigator.share) {
			try {
				await navigator.share({
					title,
					text: "Check out this event!",
					url: shareUrl,
				});
				toast.success("Shared successfully!");
			} catch (error: any) {
				// User cancelled or share failed - fall back to clipboard
				if (error.name !== 'AbortError') {
					await copyToClipboard();
				}
			}
		} else {
			// Desktop: always copy to clipboard
			await copyToClipboard();
		}
	};
	return (
		<button
			onClick={shareContent}
			className={className || "bg-white w-10 h-10 rounded-full grid place-items-center cursor-pointer"}>
			<Share2 className="stroke-1 stroke-gray-600" />
		</button>
	);
}