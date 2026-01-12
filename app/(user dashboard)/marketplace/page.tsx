import {
	BriefcaseConveyorBelt,
	ChartNoAxesColumnIncreasing,
	ChevronLeft,
	ChevronRight,
	MapPin,
	Plus,
	TrendingUp,
	UsersRound,
} from "lucide-react";

import Link from "next/link";
import MarketplaceProducts from "./components/server/prod";
import { Suspense } from "react";
import MarketplaceProductsSkeleton from "./components/skeletons/product-skeleton";
import PageInConstruction from "../components/construction";
// import MarketplaceStats from "./components/server/stats";
// import MarketplaceStatsSkeleton from "./components/skeletons/stats-skeleton";

export default function Marketplace() {
	return (
		<PageInConstruction/>
		// <main className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-4 md:gap-12">
		// 	<section className="space-y-4 md:pt-4">
		// 		{/* Header Section - Mobile Optimized */}
		// 		{/*<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white px-4 sm:px-8 py-4 rounded-lg">
        //   <div className="flex-1">
        //     <h2 className="text-lg font-bold">Marketplace</h2>
        //     <p className="text-sm text-gray-600">
        //       Discover amazing products and services from the Nigerian community
        //     </p>
        //   </div>
        //   <Link
        //     href={"/marketplace/create-listing"}
        //     className="flex items-center gap-1 justify-center p-2 rounded-lg text-sm text-center border border-gray-200 bg-[var(--primary-color)] text-white w-full sm:w-auto"
        //   >
        //     <Plus className="w-4 h-4 sm:w-6 sm:h-6" />
        //     <span className="whitespace-nowrap">Create Listing</span>
        //   </Link>
        // </div>*/}

		// 		{/* Stats Section - Mobile Horizontal Scroll */}
		// 		{/*<Suspense fallback={<MarketplaceStatsSkeleton />}>
        //   <MarketplaceStats />
        // </Suspense>*/}

		// 		{/* Categories Section - Mobile Optimized */}
		// 		<div className="p-3 bg-white rounded-xl">
		// 			<div className="flex items-center gap-2">
		// 				<button className="p-1 rounded-lg hover:bg-gray-100">
		// 					<ChevronLeft className="w-5 h-5" />
		// 				</button>

		// 				<div className="flex gap-2 overflow-x-auto flex-1 scrollbar-hide">
		// 					<div className="py-2 px-3 rounded-lg bg-[var(--primary-color)] text-white flex items-center gap-1.5 shrink-0">
		// 						<p className="whitespace-nowrap text-sm">
		// 							All Categories
		// 						</p>
		// 						<p className="bg-[#0dd884] px-1.5 py-0.5 rounded text-xs">
		// 							156
		// 						</p>
		// 					</div>
		// 					<div className="py-2 px-3 rounded-lg border border-gray-300 flex items-center gap-1.5 shrink-0">
		// 						<p className="whitespace-nowrap text-sm">
		// 							Fashion
		// 						</p>
		// 						<p className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded text-xs">
		// 							23
		// 						</p>
		// 					</div>
		// 					<div className="py-2 px-3 rounded-lg border border-gray-300 flex items-center gap-1.5 shrink-0">
		// 						<p className="whitespace-nowrap text-sm">
		// 							Food
		// 						</p>
		// 						<p className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded text-xs">
		// 							28
		// 						</p>
		// 					</div>
		// 					<div className="py-2 px-3 rounded-lg border border-gray-300 flex items-center gap-1.5 shrink-0">
		// 						<p className="whitespace-nowrap text-sm">
		// 							Electronics
		// 						</p>
		// 						<p className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded text-xs">
		// 							15
		// 						</p>
		// 					</div>
		// 				</div>

		// 				<button className="p-1 rounded-lg hover:bg-gray-100">
		// 					<ChevronRight className="w-5 h-5" />
		// 				</button>
		// 			</div>
		// 		</div>

		// 		{/* Products Grid - Mobile Optimized */}
		// 		<Suspense fallback={<MarketplaceProductsSkeleton />}>
		// 			<MarketplaceProducts />
		// 		</Suspense>
		// 		<Link
		// 			href={"/marketplace/create-listing"}
		// 			className="md:hidden z-50 fixed bottom-22 right-5 rounded-full flex items-center justify-center p-2 text-sm text-center bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90 transition-colors"
		// 		>
		// 			<Plus className="w-6 h-6" />
		// 		</Link>
		// 	</section>

		// 	{/* Right Sidebar - Hidden on Mobile */}
		// 	<section className="space-y-8 sticky top-0 h-screen pt-4 hidden md:block">
		// 		<div className="bg-white p-4 rounded-lg space-y-4">
		// 			<h2 className="font-semibold">Quick Action</h2>
		// 			<div className="space-y-2">
		// 				<Link
		// 					href={"/marketplace/create-listing"}
		// 					className="flex items-center gap-2 justify-center p-2 rounded-lg text-sm text-center border border-gray-200 bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90 transition-colors"
		// 				>
		// 					<Plus className="w-5 h-5" />
		// 					<span>Create Listing</span>
		// 				</Link>
		// 				<Link
		// 					href={"/marketplace/analytics"}
		// 					className="flex items-center gap-2 justify-center p-2 rounded-lg text-sm text-center border border-gray-200 hover:bg-gray-50 transition-colors"
		// 				>
		// 					<TrendingUp className="w-5 h-5 text-[var(--primary-color)]" />
		// 					<span>View Analytics</span>
		// 				</Link>
		// 			</div>
		// 		</div>

		// 		<div className="bg-white p-4 rounded-lg space-y-4">
		// 			<h2 className="flex gap-2 items-center font-semibold">
		// 				<span>Community stats</span>
		// 				<ChartNoAxesColumnIncreasing className="w-5 h-5 text-[var(--primary-color)]" />
		// 			</h2>
		// 			<div className="space-y-3">
		// 				<div className="flex justify-between items-center py-2 border-b border-gray-100">
		// 					<p className="text-sm">Active Members</p>
		// 					<p className="font-semibold">2,847</p>
		// 				</div>
		// 				<div className="flex justify-between items-center py-2 border-b border-gray-100">
		// 					<p className="text-sm">Posts today</p>
		// 					<p className="font-semibold">127</p>
		// 				</div>
		// 				<div className="flex justify-between items-center py-2">
		// 					<p className="text-sm">Events This Week</p>
		// 					<p className="font-semibold">8</p>
		// 				</div>
		// 			</div>
		// 		</div>

		// 		<div className="bg-white p-4 rounded-lg space-y-4">
		// 			<h2 className="font-semibold">Popular Categories</h2>
		// 			<div className="space-y-3">
		// 				<div className="flex justify-between items-center py-2 border-b border-gray-100">
		// 					<p className="text-sm">Fashion</p>
		// 					<p className="font-semibold text-sm">28</p>
		// 				</div>
		// 				<div className="flex justify-between items-center py-2 border-b border-gray-100">
		// 					<p className="text-sm">Services</p>
		// 					<p className="font-semibold text-sm">34</p>
		// 				</div>
		// 				<div className="flex justify-between items-center py-2 border-b border-gray-100">
		// 					<p className="text-sm">Food</p>
		// 					<p className="font-semibold text-sm">23</p>
		// 				</div>
		// 				<div className="flex justify-between items-center py-2">
		// 					<p className="text-sm">Housing</p>
		// 					<p className="font-semibold text-sm">8</p>
		// 				</div>
		// 			</div>

		// 			<hr className="border-gray-200 my-4" />

		// 			<div className="space-y-3">
		// 				<h2 className="font-semibold">Quick Links</h2>
		// 				<div className="space-y-2">
		// 					<Link
		// 						href="#"
		// 						className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
		// 					>
		// 						<MapPin className="w-4 h-4 text-gray-600" />
		// 						<p className="text-sm">Find Local Events</p>
		// 					</Link>
		// 					<Link
		// 						href="#"
		// 						className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
		// 					>
		// 						<UsersRound className="w-4 h-4 text-gray-600" />
		// 						<p className="text-sm">Join Groups</p>
		// 					</Link>
		// 					<Link
		// 						href="#"
		// 						className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
		// 					>
		// 						<BriefcaseConveyorBelt className="w-4 h-4 text-gray-600" />
		// 						<p className="text-sm">Browse Jobs</p>
		// 					</Link>
		// 				</div>
		// 			</div>
		// 		</div>
		// 	</section>
		// </main>
	);
}
