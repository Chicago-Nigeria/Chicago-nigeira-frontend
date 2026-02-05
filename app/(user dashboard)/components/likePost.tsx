"use client";
import { Heart } from "lucide-react";
import { HTMLAttributes, useState, useEffect } from "react";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { useSession } from "@/app/store/useSession";
import { callApi } from "@/app/libs/helper/callApi";
import { toast } from "sonner";

interface LikePostProps {
	className?: HTMLAttributes<HTMLButtonElement>;
	postId?: string;
	initialLiked?: boolean;
}

export default function LikePost({ className, postId, initialLiked }: LikePostProps) {
	const [likeStatus, setLikeStatus] = useState<boolean>(initialLiked ?? false);
	const [isLoading, setIsLoading] = useState(false);
	const [hasFetched, setHasFetched] = useState(false);
	const { requireAuth } = useAuthGuard();
	const { user } = useSession((state) => state);

	// Fetch initial like status if user is logged in and initialLiked is not provided
	useEffect(() => {
		if (user && postId && initialLiked === undefined && !hasFetched) {
			setHasFetched(true);
			callApi(`/listings/${postId}/interaction`, 'GET').then(({ data }) => {
				if (data?.data?.liked !== undefined) {
					setLikeStatus(data.data.liked);
				}
			}).catch(() => {
				// Silently fail - not critical
			});
		}
	}, [user, postId, initialLiked, hasFetched]);

	// Update state if initialLiked prop changes
	useEffect(() => {
		if (initialLiked !== undefined) {
			setLikeStatus(initialLiked);
		}
	}, [initialLiked]);

	const likePost = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!postId || isLoading) return;

		requireAuth(async () => {
			setIsLoading(true);
			try {
				const { data, error } = await callApi(`/listings/${postId}/like`, 'POST');

				if (error) {
					toast.error("Failed to update like");
					return;
				}

				setLikeStatus(data?.liked ?? !likeStatus);
				toast.success(data?.liked ? "Liked!" : "Unliked!");
			} catch (err) {
				toast.error("Failed to update like");
			} finally {
				setIsLoading(false);
			}
		}, "like this post");
	};

	return (
		<button
			onClick={likePost}
			disabled={isLoading}
			className="absolute cursor-pointer right-4 top-4 w-10 h-10 flex items-center justify-center rounded-full bg-white disabled:opacity-50"
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
