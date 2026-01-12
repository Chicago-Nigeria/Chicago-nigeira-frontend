"use client";
import { BookmarkIcon } from "lucide-react";
import { useState } from "react";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { toast } from "sonner";

interface SavePostProps {
	className?: string;
	postId?: string;
}

export default function SavePost({ className, postId }: SavePostProps) {
	const [saveStatus, setSaveStatus] = useState<boolean>(false);
	const { requireAuth } = useAuthGuard();

	const handleSave = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		requireAuth(() => {
			// Toggle save status
			setSaveStatus((currentStatus) => !currentStatus);
			toast.success(saveStatus ? "Removed from saved" : "Saved!");

			// TODO: Add API call here when backend is ready
			// await callApi(`/listing/${postId}/save`, 'POST');
		}, "save this post");
	};

	return (
		<button
			onClick={handleSave}
			className={`${className ?? ""} cursor-pointer rounded-full bg-white`}
		>
			<BookmarkIcon
				aria-label="save post"
				className={`${
					saveStatus ? "fill-gray-500" : ""
				} text-light text-gray-600 stroke-1 w-6 h-6 transition-colors duration-100`}
			/>
		</button>
	);
}
