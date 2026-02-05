"use client";

import {
	ArrowLeft,
	BadgeCheck,
	Calendar,
	ChevronLeft,
	ChevronRight,
	Eye,
	Flag,
	Heart,
	MapPin,
	MessageCircle,
	Phone,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useGetListingById, useGetRelatedListings } from "@/app/hooks/useListing";
import { formatRelativeDate } from "@/app/libs/helper/date";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { callApi } from "@/app/libs/helper/callApi";
import { toast } from "sonner";
import ShareButton from "../../components/shareButton";

export default function ProductDetail() {
	const { productId } = useParams();
	const { data, isLoading } = useGetListingById(productId as string);
	const product = data?.data?.data;
	const { data: relatedData, isLoading: relatedLoading } = useGetRelatedListings(productId as string);
	const relatedListings = relatedData?.data?.data || [];
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [isLiked, setIsLiked] = useState(false);
	const [isLiking, setIsLiking] = useState(false);
	const { requireAuth } = useAuthGuard();

	// Set initial liked state from backend
	useEffect(() => {
		if (product?.userInteraction?.liked !== undefined) {
			setIsLiked(product.userInteraction.liked);
		}
	}, [product?.userInteraction?.liked]);

	const productCreatedDate = formatRelativeDate(product?.createdAt);
	const currencySymbol = product?.currency === "USD" ? "$" : product?.currency === "NGN" ? "₦" : "$";

	// Handle both old (photos) and new (images) field names
	const productImages = product?.images || product?.photos || [];
	const images = productImages.length ? productImages : ["/image-placeholder.webp"];

	// Handle both old (user) and new (seller) field names
	const seller = product?.seller || product?.user;

	// Get counts from backend
	const likeCount = product?._count?.likes ?? 0;
	const viewCount = product?._count?.views ?? 0;

	const nextImage = () => {
		setCurrentImageIndex((prev) => (prev + 1) % images.length);
	};

	const prevImage = () => {
		setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
	};

	const handleLike = () => {
		if (isLiking) return;

		requireAuth(async () => {
			setIsLiking(true);
			try {
				const { data, error } = await callApi<{ liked: boolean }>(`/listings/${productId}/like`, 'POST');
				if (error) {
					toast.error("Failed to update like");
					return;
				}
				setIsLiked(data?.liked ?? !isLiked);
				toast.success(data?.liked ? "Liked!" : "Unliked!");
			} catch (err) {
				toast.error("Failed to update like");
			} finally {
				setIsLiking(false);
			}
		}, "like this listing");
	};

	const handleMessage = () => {
		requireAuth(() => {
			window.location.href = "/messages";
		}, "message this seller");
	};

	if (isLoading) {
		return <ProductDetailSkeleton />;
	}

	if (!product) {
		return (
			<div className="flex flex-col items-center justify-center py-20">
				<p className="text-gray-500">Listing not found</p>
				<Link href="/marketplace" className="mt-4 text-[var(--primary-color)] hover:underline">
					Back to Marketplace
				</Link>
			</div>
		);
	}

	return (
		<main className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-4 md:gap-8">
			<section className="space-y-4 md:pt-4">
				{/* Header */}
				<Link href="/marketplace" className="flex items-center gap-3 text-gray-600 hover:text-gray-900">
					<ArrowLeft className="w-5 h-5" />
					<div>
						<p className="text-sm">Back to Marketplace</p>
						<p className="text-lg font-semibold text-gray-900">Listing Details</p>
					</div>
				</Link>

				{/* Main Image Section */}
				<section className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
					{/* Main Image */}
					<div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[28rem] bg-gray-100">
						<Image
							className="object-cover object-center w-full h-full"
							src={images[currentImageIndex]}
							alt={product.title}
							fill
							priority
						/>

						{/* Navigation Arrows */}
						{images.length > 1 && (
							<>
								<button
									onClick={prevImage}
									className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-md"
								>
									<ChevronLeft className="w-5 h-5 text-gray-700" />
								</button>
								<button
									onClick={nextImage}
									className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-md"
								>
									<ChevronRight className="w-5 h-5 text-gray-700" />
								</button>
							</>
						)}

						{/* Like and Share Buttons */}
						<div className="absolute right-4 top-4 flex gap-2">
							<ShareButton
								title={product.title}
								shareText="Check out this listing!"
								className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md hover:scale-105 transition-transform"
							/>
							<button
								onClick={handleLike}
								className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md hover:scale-105 transition-transform"
							>
								<Heart
									className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-600"}`}
								/>
							</button>
						</div>
					</div>

					{/* Thumbnail Gallery */}
					<div className="flex gap-3 p-4 overflow-x-auto scrollbar-hide">
						{images.map((src, index) => (
							<button
								key={index}
								onClick={() => setCurrentImageIndex(index)}
								className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-100 ${currentImageIndex === index ? "ring-2 ring-[var(--primary-color)]" : ""
									}`}
							>
								<Image
									src={src}
									alt={`Thumbnail ${index + 1}`}
									fill
									className="object-cover"
								/>
							</button>
						))}
					</div>
				</section>

				{/* Product Info Section */}
				<section className="bg-white p-4 sm:p-6 rounded-xl space-y-4 border border-gray-200 shadow-sm">
					{/* Category, Views, Price */}
					<div className="flex items-center justify-between pb-4 border-b border-gray-200">
						<div className="flex max-sm:flex-col sm:items-center gap-2 sm:gap-4">
							<span className="text-xs py-1 px-2.5 text-center border border-gray-300 rounded-lg text-gray-600">
								{product.category || "Item"}
							</span>
							<div className="flex items-center gap-2 text-gray-400">
								<div className="flex items-center gap-1">
									<Eye className="w-4 h-4" />
									<span className="text-sm">{viewCount} Views</span>
								</div>
								<div className="flex items-center gap-1">
									<Heart className="w-4 h-4" />
									<span className="text-sm">{likeCount} Likes</span>
								</div>
							</div>
						</div>
						<p className="text-xl font-bold text-[var(--primary-color)]">
							{currencySymbol}{product.price?.toLocaleString()}
						</p>
					</div>

					{/* Title */}
					<h1 className="text-xl font-bold text-gray-900">{product.title}</h1>

					{/* Location & Date */}
					<div className="flex flex-wrap gap-4 text-sm text-gray-500">
						{product.location && (
							<div className="flex items-center gap-1.5">
								<MapPin className="w-4 h-4" />
								<span>{product.location}</span>
							</div>
						)}
						<div className="flex items-center gap-1.5">
							<Calendar className="w-4 h-4" />
							<span>Posted {productCreatedDate}</span>
						</div>
					</div>

					{/* Condition & Price Type */}
					<div className="flex flex-wrap gap-3">
						{product.condition && (
							<span className="text-xs py-1.5 px-3 bg-blue-50 text-blue-600 rounded-lg capitalize">
								Condition: {product.condition}
							</span>
						)}
						{product.priceType && (
							<span className="text-xs py-1.5 px-3 bg-green-50 text-green-600 rounded-lg capitalize">
								{product.priceType === 'negotiable' ? 'Price Negotiable' : 'Fixed Price'}
							</span>
						)}
					</div>

					{/* Description */}
					<div className="pt-4">
						<h2 className="font-semibold text-gray-900 mb-2">Description</h2>
						<div className="text-sm text-gray-600 space-y-2 whitespace-pre-wrap">
							<p>{product.description}</p>
						</div>
					</div>

					{/* Tags - only show if tags exist */}
					{product.tags && product.tags.length > 0 && (
						<div className="pt-4">
							<h2 className="font-semibold text-gray-900 mb-3">Tags</h2>
							<div className="flex flex-wrap gap-2">
								{product.tags.map((tag: string, index: number) => (
									<span
										key={index}
										className="text-xs py-1.5 px-3 bg-gray-100 text-gray-600 rounded-lg"
									>
										{tag}
									</span>
								))}
							</div>
						</div>
					)}
				</section>

				{/* Related Listings */}
				{relatedListings.length > 0 && (
					<section className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
						<h2 className="font-semibold text-gray-900 mb-4">Related Listings</h2>
						<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
							{relatedListings.slice(0, 6).map((listing: any) => (
								<Link
									key={listing.id}
									href={`/marketplace/${listing.id}`}
									className="group"
								>
									<div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
										<Image
											src={listing.images?.[0] || "/image-placeholder.webp"}
											alt={listing.title}
											fill
											className="object-cover group-hover:scale-105 transition-transform duration-300"
										/>
									</div>
									<div className="mt-2">
										<p className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-[var(--primary-color)] transition-colors">
											{listing.title}
										</p>
										<p className="text-sm font-semibold text-[var(--primary-color)]">
											{listing.currency === "NGN" ? "₦" : "$"}{listing.price?.toLocaleString()}
										</p>
									</div>
								</Link>
							))}
						</div>
					</section>
				)}

				{/* Related Listings Skeleton */}
				{relatedLoading && (
					<section className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm animate-pulse">
						<div className="h-6 bg-gray-200 rounded w-32 mb-4" />
						<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
							{[...Array(3)].map((_, i) => (
								<div key={i}>
									<div className="aspect-square rounded-lg bg-gray-200" />
									<div className="mt-2 space-y-1">
										<div className="h-4 bg-gray-200 rounded w-3/4" />
										<div className="h-4 bg-gray-200 rounded w-1/2" />
									</div>
								</div>
							))}
						</div>
					</section>
				)}
			</section>

			{/* Right Sidebar - Seller Info */}
			<section className="space-y-4 lg:sticky lg:top-4 h-fit pt-4">
				<div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
					{/* Seller Profile */}
					<div className="text-center pb-4 border-b border-gray-100">
						<Link
							href={`/profile/${seller?.id || (seller as any)?._id}`}
							className="w-16 h-16 mx-auto rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white text-xl font-semibold overflow-hidden hover:ring-2 hover:ring-[var(--primary-color)] hover:ring-offset-2 transition-all"
						>
							{seller?.photo ? (
								<Image
									src={seller.photo}
									alt={`${seller?.firstName} ${seller?.lastName}`}
									width={64}
									height={64}
									className="w-full h-full rounded-full object-cover"
								/>
							) : (
								<span>
									{seller?.firstName?.charAt(0).toUpperCase() || ""}
									{seller?.lastName?.charAt(0).toUpperCase() || ""}
								</span>
							)}
						</Link>
						<div className="mt-2 flex items-center justify-center gap-1">
							<Link
								href={`/profile/${seller?.id || (seller as any)?._id}`}
								className="font-semibold text-gray-900 hover:text-[var(--primary-color)] transition-colors"
							>
								{seller?.firstName} {seller?.lastName}
							</Link>
							{product.isVerified && (
								<BadgeCheck className="w-4 h-4 text-[var(--primary-color)]" />
							)}
						</div>
						{/* TODO: Seller ratings - uncomment when rating system is implemented
						<div className="flex items-center justify-center gap-0.5 mt-1">
							{[...Array(5)].map((_, i) => (
								<Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} />
							))}
						</div>
						<p className="text-xs text-gray-500 mt-1">{reviewCount} Reviews</p>
						*/}
						<p className="text-xs text-gray-500 mt-1">
							{seller?._count?.listings || 0} Listing{(seller?._count?.listings || 0) !== 1 ? 's' : ''}
						</p>
					</div>

					{/* Seller Stats */}
					<div className="py-4 border-b border-gray-100 space-y-3">
						<div className="flex items-start gap-3">
							<div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
								<Calendar className="w-5 h-5 text-green-600" />
							</div>
							<div>
								<p className="text-sm font-medium text-gray-900">Member Since</p>
								<p className="text-xs text-gray-500">
									{seller?.createdAt
										? new Date(seller.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
										: "N/A"}
								</p>
							</div>
						</div>
						{/* TODO: Response time and Total sales - uncomment when tracking is implemented
						<div className="flex items-start gap-3">
							<div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
								<Clock className="w-5 h-5 text-blue-600" />
							</div>
							<div>
								<p className="text-sm font-medium text-gray-900">Response Time</p>
								<p className="text-xs text-gray-500">Usually responds within 2 hours</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
								<Box className="w-5 h-5 text-purple-600" />
							</div>
							<div>
								<p className="text-sm font-medium text-gray-900">Total Sales</p>
								<p className="text-xs text-gray-500">127 completed</p>
							</div>
						</div>
						*/}
					</div>

					{/* About the Seller - only show if bio exists */}
					{seller?.bio && (
						<div className="py-4 border-b border-gray-100">
							<h3 className="font-semibold text-gray-900 mb-2">About The Seller</h3>
							<p className="text-sm text-gray-500 line-clamp-4">{seller.bio}</p>
						</div>
					)}

					{/* Action Buttons */}
					<div className="pt-4 space-y-2">
						<button
							onClick={handleMessage}
							className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[var(--primary-color)] text-white text-sm font-medium hover:bg-[var(--primary-color)]/90 transition-colors"
						>
							<MessageCircle className="w-4 h-4" />
							Message Seller
						</button>
						<div className="grid grid-cols-2 gap-2">
							{(product.phoneNumber || seller?.phone) && (
								<Link
									href={`tel:${product.phoneNumber || seller?.phone}`}
									className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
								>
									<Phone className="w-4 h-4" />
									Call
								</Link>
							)}
							{(product.whatsappNumber || product.phoneNumber || seller?.phone) && (
								<Link
									href={`https://wa.me/${(product.whatsappNumber || product.phoneNumber || seller?.phone || '').replace(/\D/g, '')}`}
									target="_blank"
									className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
								>
									<Phone className="w-4 h-4" />
									WhatsApp
								</Link>
							)}
						</div>
						<button className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
							<Flag className="w-4 h-4" />
							Report This Listing
						</button>
					</div>
				</div>
			</section>
		</main>
	);
}

function ProductDetailSkeleton() {
	return (
		<main className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-4 md:gap-8">
			<section className="space-y-4 md:pt-4 animate-pulse">
				{/* Header */}
				<div className="flex items-center gap-3">
					<div className="w-5 h-5 bg-gray-200 rounded" />
					<div>
						<div className="h-4 bg-gray-200 rounded w-32 mb-1" />
						<div className="h-5 bg-gray-200 rounded w-24" />
					</div>
				</div>

				{/* Main Image */}
				<div className="bg-white rounded-xl overflow-hidden">
					<div className="h-96 bg-gray-200" />
					<div className="flex gap-3 p-4">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="w-24 h-24 bg-gray-200 rounded-lg shrink-0" />
						))}
					</div>
				</div>

				{/* Product Info */}
				<div className="bg-white p-6 rounded-xl space-y-4">
					<div className="flex justify-between items-center pb-4 border-b border-gray-100">
						<div className="flex gap-4">
							<div className="h-6 bg-gray-200 rounded w-20" />
							<div className="h-6 bg-gray-200 rounded w-24" />
						</div>
						<div className="h-8 bg-gray-200 rounded w-16" />
					</div>
					<div className="h-7 bg-gray-200 rounded w-3/4" />
					<div className="flex gap-4">
						<div className="h-4 bg-gray-200 rounded w-32" />
						<div className="h-4 bg-gray-200 rounded w-28" />
					</div>
					<div className="space-y-2 pt-4">
						<div className="h-5 bg-gray-200 rounded w-24" />
						<div className="h-4 bg-gray-200 rounded w-full" />
						<div className="h-4 bg-gray-200 rounded w-full" />
						<div className="h-4 bg-gray-200 rounded w-2/3" />
					</div>
				</div>
			</section>

			{/* Sidebar */}
			<section className="space-y-4 pt-4 animate-pulse">
				<div className="bg-white p-6 rounded-xl space-y-4">
					<div className="text-center">
						<div className="w-16 h-16 mx-auto bg-gray-200 rounded-full" />
						<div className="h-5 bg-gray-200 rounded w-32 mx-auto mt-2" />
						<div className="h-4 bg-gray-200 rounded w-20 mx-auto mt-2" />
					</div>
					<div className="space-y-3 py-4 border-y border-gray-100">
						{[...Array(3)].map((_, i) => (
							<div key={i} className="flex gap-3">
								<div className="w-10 h-10 bg-gray-200 rounded-lg shrink-0" />
								<div className="flex-1">
									<div className="h-4 bg-gray-200 rounded w-24 mb-1" />
									<div className="h-3 bg-gray-200 rounded w-32" />
								</div>
							</div>
						))}
					</div>
					<div className="space-y-2 pt-4">
						<div className="h-10 bg-gray-200 rounded-lg" />
						<div className="grid grid-cols-2 gap-2">
							<div className="h-10 bg-gray-200 rounded-lg" />
							<div className="h-10 bg-gray-200 rounded-lg" />
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
