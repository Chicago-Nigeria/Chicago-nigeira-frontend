import Link from "next/link";
import {
	BriefcaseConveyorBelt,
	ChartNoAxesColumnIncreasing,
	MapPin,
	UsersRound,
} from "lucide-react";
import ChartAnalyticsData from "../components/server/chart-analytics-data";
import { Suspense } from "react";
export default function DashboardPage() {
	return (
		<main className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-4 md:gap-12">
			<div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-6">
				{/* Chart and Category Breakdown */}
				<Suspense fallback={<div>loading...</div>}>
					<ChartAnalyticsData />
				</Suspense>
			</div>

			{/* Right Sidebar - Hidden on Mobile */}
			<section className="space-y-8 sticky top-0 h-screen pt-4 hidden md:block">
				<div className="bg-white p-4 rounded-lg space-y-4">
					<h2 className="flex gap-2 items-center font-semibold">
						<span>Community stats</span>
						<ChartNoAxesColumnIncreasing className="w-5 h-5 text-[var(--primary-color)]" />
					</h2>
					<div className="space-y-3">
						<div className="flex justify-between items-center py-2 border-b border-gray-100">
							<p className="text-sm">Active Members</p>
							<p className="font-semibold">2,847</p>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-gray-100">
							<p className="text-sm">Posts today</p>
							<p className="font-semibold">127</p>
						</div>
						<div className="flex justify-between items-center py-2">
							<p className="text-sm">Events This Week</p>
							<p className="font-semibold">8</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-4 rounded-lg space-y-4">
					<h2 className="font-semibold">Popular Categories</h2>
					<div className="space-y-3">
						<div className="flex justify-between items-center py-2 border-b border-gray-100">
							<p className="text-sm">Fashion</p>
							<p className="font-semibold text-sm">28</p>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-gray-100">
							<p className="text-sm">Services</p>
							<p className="font-semibold text-sm">34</p>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-gray-100">
							<p className="text-sm">Food</p>
							<p className="font-semibold text-sm">23</p>
						</div>
						<div className="flex justify-between items-center py-2">
							<p className="text-sm">Housing</p>
							<p className="font-semibold text-sm">8</p>
						</div>
					</div>

					<hr className="border-gray-200 my-4" />

					<div className="space-y-3">
						<h2 className="font-semibold">Quick Links</h2>
						<div className="space-y-2">
							<Link
								href="#"
								className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
							>
								<MapPin className="w-4 h-4 text-gray-600" />
								<p className="text-sm">Find Local Events</p>
							</Link>
							<Link
								href="#"
								className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
							>
								<UsersRound className="w-4 h-4 text-gray-600" />
								<p className="text-sm">Join Groups</p>
							</Link>
							<Link
								href="#"
								className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
							>
								<BriefcaseConveyorBelt className="w-4 h-4 text-gray-600" />
								<p className="text-sm">Browse Jobs</p>
							</Link>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}

// function PerformanceCard({
// 	title,
// 	value,
// 	sub,
// 	highlight,
// }: {
// 	title: string;
// 	value: string;
// 	sub: string;
// 	highlight?: boolean;
// }) {
// 	return (
// 		<div
// 			className={`p-4 rounded-xl border ${highlight ? "bg-indigo-50 border-indigo-200" : "bg-gray-50 border-gray-100"}`}
// 		>
// 			<h4 className="text-sm text-gray-500">{title}</h4>
// 			<p className="text-xl font-semibold text-gray-800">{value}</p>
// 			<span className="text-xs text-gray-400">{sub}</span>
// 		</div>
// 	);
// }

// function TipCard({
// 	color,
// 	text,
// 	sub,
// }: {
// 	color: "green" | "blue" | "yellow";
// 	text: string;
// 	sub: string;
// }) {
// 	const colors = {
// 		green: "bg-green-50 border-green-100",
// 		blue: "bg-blue-50 border-blue-100",
// 		yellow: "bg-yellow-50 border-yellow-100",
// 	};

// 	return (
// 		<div className={`p-4 rounded-xl border ${colors[color]} text-sm`}>
// 			<p className="font-semibold text-gray-700">{text}</p>
// 			<p className="text-gray-500 text-xs">{sub}</p>
// 		</div>
// 	);
// }
