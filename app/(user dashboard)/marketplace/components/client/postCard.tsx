"use client";

import { BadgeCheck, Eye, Heart, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import LikePost from "../../../components/likePost";
import { IListing } from "@/app/types";

export const PostCard = ({ post }: { post: IListing }) => {
	const currencySymbol = post.currency === "USD" ? "$" : post.currency === "NGN" ? "₦" : "$";

	// Handle both old (photos) and new (images) field names
	const images = post.images || post.photos || [];
	const imageUrl = images[0] || "/image-placeholder.webp";

	// Handle both old (user) and new (seller) field names
	const seller = post.seller || post.user;

	// Get listing ID (handle both id and _id)
	const listingId = post.id || post._id;

	// Get counts from _count (from backend)
	const likeCount = post._count?.likes ?? 0;
	const viewCount = post._count?.views ?? 0;

	// TODO: Implement rating functionality
	// const ratingValue = post.rating || 0;
	// const ratingCount = post.ratingCount || 0;

	return (
		<Link
			href={`/marketplace/${listingId}`}
			className="block rounded-xl overflow-hidden bg-white border border-gray-200 hover:shadow-md transition-all duration-200"
		>
			{/* Image Section */}
			<div className="h-48 bg-gray-100 relative">
				<Image
					className={`object-cover object-center w-full h-full ${post.status === 'sold' ? 'opacity-70' : ''}`}
					src={imageUrl}
					height={400}
					width={300}
					alt={post.title}
				/>
				{/* Sold Badge */}
				{post.status === 'sold' && (
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="bg-black/70 text-white px-4 py-2 rounded-lg font-bold text-sm transform -rotate-12 shadow-lg">
							SOLD
						</div>
					</div>
				)}
				<div onClick={(e) => e.preventDefault()}>
					<LikePost postId={listingId} />
				</div>
			</div>

			{/* Content Section */}
			<div className="p-4 space-y-3">
				{/* Category Tag & Price */}
				<div className="flex justify-between items-center">
					<span className="text-xs py-1 px-2.5 bg-gray-100 text-gray-600 rounded-md font-medium">
						{post.category || post.tags?.[0] || "Item"}
					</span>
					<p className="text-[var(--primary-color)] font-bold text-lg">
						{currencySymbol}{post.price?.toLocaleString()}
					</p>
				</div>

				{/* Title */}
				<p className="text-base font-semibold text-gray-900 line-clamp-2 leading-tight">
					{post.title}
				</p>

				{/* Seller Info */}
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white text-xs font-medium overflow-hidden shrink-0">
						{seller?.photo ? (
							<Image
								src={seller.photo}
								alt={`${seller?.firstName} ${seller?.lastName}`}
								width={32}
								height={32}
								className="object-cover w-full h-full"
							/>
						) : (
							<span>
								{seller?.firstName?.charAt(0).toUpperCase() || ""}
								{seller?.lastName?.charAt(0).toUpperCase() || ""}
							</span>
						)}
					</div>
					<div className="flex flex-col min-w-0">
						<div className="flex items-center gap-1">
							<span className="text-xs font-medium text-gray-700 truncate">
								{seller?.firstName} {seller?.lastName}
							</span>
							{post.isVerified && (
								<BadgeCheck className="w-3.5 h-3.5 text-[var(--primary-color)] shrink-0" />
							)}
						</div>
					</div>
				</div>

				{/* TODO: Ratings - uncomment when rating functionality is implemented
				<div className="flex flex-col items-end">
					<div className="flex items-center gap-0.5">
						{renderStars(ratingValue)}
					</div>
					<span className="text-[10px] text-gray-500">{ratingCount} Verified Ratings</span>
				</div>
				*/}

				{/* Location & Stats */}
				<div className="flex justify-between items-center pt-2">
					{/* Location */}
					<div className="flex items-center gap-1 text-gray-500">
						<MapPin className="w-3.5 h-3.5" />
						<span className="text-xs">{post.location || "Chicago"}</span>
					</div>

					{/* Views & Likes */}
					<div className="flex items-center gap-3 text-gray-400">
						<div className="flex items-center gap-1">
							<Eye className="w-3.5 h-3.5" />
							<span className="text-xs">{viewCount}</span>
						</div>
						<div className="flex items-center gap-1">
							<Heart className="w-3.5 h-3.5" />
							<span className="text-xs">{likeCount}</span>
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
};

export const PostCardSkeleton = () => (
	<div className="rounded-xl overflow-hidden bg-white border border-gray-100 animate-pulse">
		<div className="h-48 bg-gray-200" />
		<div className="p-4 space-y-3">
			<div className="flex justify-between">
				<div className="h-5 bg-gray-200 rounded w-16" />
				<div className="h-4 bg-gray-200 rounded w-10" />
			</div>
			<div className="space-y-1.5">
				<div className="h-4 bg-gray-200 rounded w-full" />
				<div className="h-4 bg-gray-200 rounded w-3/4" />
			</div>
			<div className="flex items-center gap-2">
				<div className="w-7 h-7 bg-gray-200 rounded-full" />
				<div className="h-3 bg-gray-200 rounded w-24" />
			</div>
			<div className="h-3 bg-gray-200 rounded w-20" />
			<div className="h-5 bg-gray-200 rounded w-16" />
		</div>
	</div>
);
