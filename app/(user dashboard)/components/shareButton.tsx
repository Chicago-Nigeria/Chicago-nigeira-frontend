"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

export default function ShareButton({ title }: { title: string }) {
	const shareProduct = async () => {
		if (navigator.share) {
			try {
				await navigator.share({
					title,
					text: "I found this interesting page.",
					url: window.location.href, // current page link
				});
				toast.success("Content shared successfully");
			} catch (error) {
				console.error("Error sharing:", error);
			}
		} else {
			await navigator.clipboard.writeText(window.location.href);
			toast.success("URL Copied to clipboard successfully!")
		}
	};
	return (
		<button
			onClick={shareProduct}
			className="bg-white w-10 h-10 rounded-full grid place-items-center cursor-pointer">
			<Share2 className="stroke-1 stroke-gray-600" />
		</button>
	);
}