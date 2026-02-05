"use client";

import {
	ChartNoAxesColumnIncreasing,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	Clock,
	Eye,
	Package,
	Plus,
	Search,
	SlidersHorizontal,
	Users,
	X,
} from "lucide-react";
import Link from "next/link";
import { Suspense, useState, useRef, useEffect, useMemo, useCallback } from "react";
import MarketplaceProductsSkeleton from "./components/skeletons/product-skeleton";
import MarketplaceSidebar from "./components/client/MarketplaceSidebar";
import MarketplaceProducts from "./components/server/prod";
import { callApi } from "@/app/libs/helper/callApi";
import { ApiResponse } from "@/app/types";
import { ListingFilters } from "@/app/hooks/useListing";

interface MarketplaceStats {
	activeListings: number;
	totalListings: number;
	weeklyViews: number;
	activeSellers: number;
	avgResponseTime: string;
	allCategories: { name: string; count: number }[];
}

export default function Marketplace() {
	const [activeCategory, setActiveCategory] = useState("All Categories");
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [sortBy, setSortBy] = useState<"recent" | "price_asc" | "price_desc" | "popular">("recent");
	const [isFilterExpanded, setIsFilterExpanded] = useState(false);
	const categoryScrollRef = useRef<HTMLDivElement>(null);
	const [marketplaceStats, setMarketplaceStats] = useState<MarketplaceStats | null>(null);
	const [loadingStats, setLoadingStats] = useState(true);

	// Debounce search query
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchQuery);
		}, 500);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Memoize filters to prevent unnecessary re-renders
	const filters: ListingFilters = useMemo(() => ({
		category: activeCategory,
		search: debouncedSearch,
		sort: sortBy,
	}), [activeCategory, debouncedSearch, sortBy]);

	// Clear all filters
	const clearFilters = useCallback(() => {
		setActiveCategory("All Categories");
		setSearchQuery("");
		setDebouncedSearch("");
		setSortBy("recent");
	}, []);

	const hasActiveFilters = activeCategory !== "All Categories" || debouncedSearch || sortBy !== "recent";

	useEffect(() => {
		const fetchStats = async () => {
			const { data, error } = await callApi<ApiResponse<MarketplaceStats>>(
				'/listings/analytics/stats',
				'GET'
			);

			if (!error && data?.data) {
				setMarketplaceStats(data.data);
			}
			setLoadingStats(false);
		};

		fetchStats();
	}, []);

	const formatNumber = (num: number): string => {
		if (num >= 1000) {
			return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}K`;
		}
		return num.toString();
	};

	// Build categories array from API data
	const categories = [
		{
			name: "All Categories",
			count: marketplaceStats?.activeListings ?? 0,
		},
		...(marketplaceStats?.allCategories ?? []),
	];

	const stats = [
		{
			label: "Listings",
			value: loadingStats ? "..." : formatNumber(marketplaceStats?.activeListings ?? 0),
			icon: Package,
			color: "bg-green-100 text-green-600"
		},
		{
			label: "Views",
			value: loadingStats ? "..." : formatNumber(marketplaceStats?.weeklyViews ?? 0),
			icon: Eye,
			color: "bg-blue-100 text-blue-600"
		},
		{
			label: "Active Sellers",
			value: loadingStats ? "..." : formatNumber(marketplaceStats?.activeSellers ?? 0),
			icon: Users,
			color: "bg-purple-100 text-purple-600"
		},
		{
			label: "Avg Response",
			value: loadingStats ? "..." : (marketplaceStats?.avgResponseTime ?? "2hrs"),
			icon: Clock,
			color: "bg-orange-100 text-orange-600"
		},
	];

	const scrollCategories = (direction: "left" | "right") => {
		if (categoryScrollRef.current) {
			const scrollAmount = 200;
			categoryScrollRef.current.scrollBy({
				left: direction === "left" ? -scrollAmount : scrollAmount,
				behavior: "smooth",
			});
		}
	};


	return (
		<section className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 mb-10">
			<section className="space-y-6 min-w-0">
				{/* Header Section */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white px-6 py-5 rounded-2xl border border-gray-200 shadow-sm">
					<div>
						<h1 className="text-xl font-bold text-gray-900">Marketplace</h1>
						<p className="text-sm text-gray-600 mt-1">
							Discover amazing products and services from the Nigerian Community
						</p>
					</div>
					<Link
						href="/marketplace/create-listing"
						className="hidden sm:flex items-center gap-2 justify-center px-5 py-2.5 rounded-lg text-sm font-medium bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90 transition shadow-sm w-full sm:w-auto"
					>
						<Plus className="w-4 h-4" />
						<span className="whitespace-nowrap">Create Listing</span>
					</Link>
				</div>

				{/* Stats Section */}
				<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
					{stats.map((stat) => (
						<div
							key={stat.label}
							className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3"
						>
							<div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
								<stat.icon className="w-5 h-5" />
							</div>
							<div>
								<p className="text-lg font-bold text-gray-900">{stat.value}</p>
								<p className="text-xs text-gray-500">{stat.label}</p>
							</div>
						</div>
					))}
				</div>

				{/* Search, Categories & Filters Combined */}
				<div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
					{/* Mobile Toggle Header */}
					<button
						onClick={() => setIsFilterExpanded(!isFilterExpanded)}
						className="sm:hidden w-full px-4 py-3 flex items-center justify-between border-b border-gray-100"
					>
						<div className="flex items-center gap-2">
							<SlidersHorizontal className="w-4 h-4 text-gray-600" />
							<span className="text-sm font-medium text-gray-700">Search & Filters</span>
							{hasActiveFilters && (
								<span className="px-2 py-0.5 text-xs bg-[var(--primary-color)] text-white rounded-full">
									Active
								</span>
							)}
						</div>
						{isFilterExpanded ? (
							<ChevronUp className="w-5 h-5 text-gray-500" />
						) : (
							<ChevronDown className="w-5 h-5 text-gray-500" />
						)}
					</button>

					{/* Filter Content - Always visible on desktop, collapsible on mobile */}
					<div className={`px-4 py-4 flex flex-col gap-4 ${isFilterExpanded ? 'block' : 'hidden sm:flex'}`}>
						{/* Search & Filters */}
						<div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
								<input
									type="text"
									placeholder="Search listings..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 focus:border-[var(--primary-color)]"
								/>
								{searchQuery && (
									<button
										onClick={() => setSearchQuery("")}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
									>
										<X className="w-4 h-4" />
									</button>
								)}
							</div>
							<div className="flex gap-2">
								<select
									value={sortBy}
									onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
									className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20"
								>
									<option value="recent">Most Recent</option>
									<option value="price_asc">Price: Low to High</option>
									<option value="price_desc">Price: High to Low</option>
									<option value="popular">Most Popular</option>
								</select>
								{hasActiveFilters && (
									<button
										onClick={clearFilters}
										className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
									>
										<X className="w-4 h-4" />
										<span className="hidden sm:inline">Clear</span>
									</button>
								)}
							</div>
						</div>

						{/* Categories */}
						<div className="flex items-center gap-2 border-t border-gray-100 pt-3">
							<button
								onClick={() => scrollCategories("left")}
								className="p-1.5 rounded-lg hover:bg-gray-100 shrink-0 hidden sm:block"
							>
								<ChevronLeft className="w-5 h-5 text-gray-600" />
							</button>

							<div
								ref={categoryScrollRef}
								className="flex gap-2 overflow-x-auto flex-1 scrollbar-hide"
							>
								{loadingStats ? (
									// Loading skeleton for categories
									<>
										{[1, 2, 3, 4, 5].map((i) => (
											<div
												key={i}
												className="h-9 w-28 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"
											/>
										))}
									</>
								) : (
									categories.map((category) => (
										<button
											key={category.name}
											onClick={() => setActiveCategory(category.name)}
											className={`px-3 py-1.5 text-sm font-medium rounded-lg transition whitespace-nowrap flex items-center gap-2 flex-shrink-0 ${activeCategory === category.name
												? "bg-[var(--primary-color)] text-white"
												: "bg-white text-gray-700 border border-gray-200 hover:border-[var(--primary-color)] hover:text-[var(--primary-color)]"
												}`}
										>
											<span>{category.name}</span>
											<span
												className={`text-xs ml-1 px-1.5 py-0.5 rounded-full ${activeCategory === category.name
													? "bg-white/20 text-white"
													: "bg-gray-100 text-gray-500"
													}`}
											>
												{category.count}
											</span>
										</button>
									))
								)}
							</div>

							<button
								onClick={() => scrollCategories("right")}
								className="p-1.5 rounded-lg hover:bg-gray-100 shrink-0 hidden sm:block"
							>
								<ChevronRight className="w-5 h-5 text-gray-600" />
							</button>
						</div>
					</div>
				</div>

				{/* Active Filters Summary */}
				{hasActiveFilters && (
					<div className="flex items-center gap-2 text-sm text-gray-600">
						<span>Showing results for:</span>
						<div className="flex flex-wrap gap-2">
							{activeCategory !== "All Categories" && (
								<span className="px-2 py-1 bg-gray-100 rounded-lg">{activeCategory}</span>
							)}
							{debouncedSearch && (
								<span className="px-2 py-1 bg-gray-100 rounded-lg">&quot;{debouncedSearch}&quot;</span>
							)}
							{sortBy !== "recent" && (
								<span className="px-2 py-1 bg-gray-100 rounded-lg">
									{sortBy === "price_asc" ? "Price: Low to High" : sortBy === "price_desc" ? "Price: High to Low" : "Most Popular"}
								</span>
							)}
						</div>
					</div>
				)}

				{/* Products Grid */}
				<Suspense fallback={<MarketplaceProductsSkeleton />}>
					<MarketplaceProducts filters={filters} />
				</Suspense>

				{/* Mobile Quick Actions */}
				<div className="lg:hidden fixed bottom-24 right-5 flex flex-col gap-3 z-50">
					{/* Analytics Button */}
					<Link
						href="/marketplace/analytics"
						className="rounded-full flex items-center justify-center p-3 bg-white text-[var(--primary-color)] border border-gray-200 hover:bg-gray-50 transition-colors shadow-lg"
						title="View Analytics"
					>
						<ChartNoAxesColumnIncreasing className="w-5 h-5" />
					</Link>
					{/* Create Listing Button */}
					<Link
						href="/marketplace/create-listing"
						className="rounded-full flex items-center justify-center p-3 bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90 transition-colors shadow-lg"
						title="Create Listing"
					>
						<Plus className="w-6 h-6" />
					</Link>
				</div>
			</section>

			{/* Right Sidebar - Desktop Only */}
			<MarketplaceSidebar showQuickAction={true} />
		</section>
	);
}
