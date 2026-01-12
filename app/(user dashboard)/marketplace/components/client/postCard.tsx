import { Eye, Heart, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import LikePost from "../../../components/likePost";
import { IListing } from "@/app/types";

export const PostCard = ({ post }: { post: IListing }) => (
	<div className="rounded-xl overflow-hidden border bg-white border-gray-200 hover:shadow-md transition-shadow">
		<div className="h-48 bg-gray-200 relative">
			<Image
				className="object-cover object-center w-full h-full"
				src={post.photos[0]}
				height={400}
				width={300}
				alt={post.title}
				// priority={post._id <= 2}
			/>
			<div className="absolute top-2 right-2">
				<LikePost />
			</div>
		</div>

		<div className="p-3 space-y-2">
			<div className="flex justify-between items-start gap-2">
				<span className="text-xs py-1 px-2 border border-gray-200 rounded-md bg-gray-50">
					{post.tags.join()}
				</span>
				<p className="text-[var(--primary-color)] font-semibold text-sm">
					{post.currency === "USD"
						? "$"
						: post.currency === "NGN"
							? "₦"
							: "$"}
					{post.price}
				</p>
			</div>

			<Link
				href={`/marketplace/${post._id}`}
				className="text-sm font-medium line-clamp-2 leading-tight hover:text-[var(--primary-color)] transition-colors"
			>
				{post.title}
			</Link>

			<div className="flex items-center gap-2 pt-1">
				<div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
					<Image
						className="object-cover w-full h-full"
						src={post.photos[0]}
						height={32}
						width={32}
						alt={post.photos[0]}
					/>
				</div>
				<div className="flex-1 min-w-0">
					<p className="text-xs font-medium truncate">
						{post?.user?.firstName} {post?.user?.lastName}
					</p>
					<div className="flex items-center gap-1 text-xs text-gray-500">
						<MapPin className="w-3 h-3" />
						<span className="truncate">{post.location}</span>
					</div>
				</div>
			</div>

			<div className="flex items-center justify-between pt-1">
				<div className="flex items-center gap-1">
					<div className="flex gap-0.5">
						{[...Array(5)].map((_, index) => (
							<Star
								key={index}
								className={`w-3 h-3 ${
									index < post.ratings
										? "fill-amber-400 text-amber-400"
										: "fill-gray-300 text-gray-300"
								}`}
							/>
						))}
					</div>
					<span className="text-xs text-gray-500 ml-1">
						({post.ratings})
					</span>
				</div>

				<div className="flex items-center gap-3 text-gray-500">
					<div className="flex items-center gap-1">
						<Eye className="w-3 h-3" />
						<span className="text-xs">{post.ratings}</span>
					</div>
					<div className="flex items-center gap-1">
						<Heart className="w-3 h-3" />
						<span className="text-xs">{post.totalLikes}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
);

export const PostCardSkeleton = () => (
	<div className="rounded-xl overflow-hidden border bg-white border-gray-200 animate-pulse">
		<div className="h-48 bg-gray-300" />
		<div className="p-3 space-y-3">
			<div className="flex justify-between">
				<div className="h-4 bg-gray-300 rounded w-16" />
				<div className="h-4 bg-gray-300 rounded w-12" />
			</div>
			<div className="h-4 bg-gray-300 rounded w-full" />
			<div className="h-4 bg-gray-300 rounded w-3/4" />
			<div className="flex items-center gap-2">
				<div className="w-8 h-8 bg-gray-300 rounded-full" />
				<div className="space-y-1 flex-1">
					<div className="h-3 bg-gray-300 rounded w-20" />
					<div className="h-3 bg-gray-300 rounded w-16" />
				</div>
			</div>
		</div>
	</div>
);
