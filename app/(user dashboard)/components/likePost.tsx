"use client";
import { Heart } from "lucide-react";
import { HTMLAttributes, useState } from "react";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { toast } from "sonner";

interface LikePostProps {
	className?: HTMLAttributes<HTMLButtonElement>;
	postId?: string;
}

export default function LikePost({ className, postId }: LikePostProps) {
	const [likeStatus, setLikeStatus] = useState<boolean>(false);
	const { requireAuth } = useAuthGuard();

	const likePost = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		requireAuth(() => {
			// Toggle like status
			setLikeStatus((currentStatus) => !currentStatus);
			toast.success(likeStatus ? "Unliked!" : "Liked!");

			// TODO: Add API call here when backend is ready
			// await callApi(`/listing/${postId}/like`, 'POST');
		}, "like this post");
	};

	return (
		<button
			onClick={likePost}
			className="absolute cursor-pointer right-4 top-4 w-10 h-10 flex items-center justify-center rounded-full bg-white"
		>
			<Heart
				aria-label="like post"
				className={`${
					likeStatus ? "fill-red-500 text-red-500" : ""
				} text-light text-gray-600 stroke-1 transition-colors duration-100 ${className ?? ""}`}
			/>
		</button>
	);
}
