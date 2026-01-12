"use client";

import { CircleAlert, CheckCircle, Flame, LucideIcon } from "lucide-react";

type PerformanceTip = {
	title: string;
	description: string;
	status: "info" | "success" | "warning" | "error";
	icon: LucideIcon;
};

const performanceTips: PerformanceTip[] = [
	{
		title: "Optimize Images",
		description:
			"Compress and serve images in modern formats like WebP for faster load times.",
		status: "info",
		icon: CircleAlert,
	},
	{
		title: "Enable Caching",
		description:
			"Use browser and server caching strategies to reduce redundant network requests.",
		status: "success",
		icon: CheckCircle,
	},
	{
		title: "Reduce Bundle Size",
		description:
			"Remove unused dependencies and apply code-splitting for improved performance.",
		status: "warning",
		icon: Flame,
	},
];

export default function PerformanceAnalytics() {
	function statusColor(status: string): string {
		switch (status) {
			case "success":
				return "green";
			case "info":
				return "gray";
			case "warning":
				return "yellow";
			case "error":
				return "red";
			default:
				return "";
		}
	}
	return (
		<div className="bg-white p-8 rounded-lg">
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
				<StatCard
					title="Total Listings"
					value="12"
					sub="2 Active Listings"
				/>
				<StatCard
					title="Total Views"
					value="3,247"
					sub="+15.3% Last 30 Days"
					highlight
				/>
				<StatCard
					title="Inquiries"
					value="89"
					sub="+2.2% Message Received"
				/>
				<StatCard
					title="Conversion Rate"
					value="2.7%"
					sub="-0.3% Views to Inquiries"
				/>
			</div>
			<div className="grid gap-6">
				{performanceTips.map(
					({ title, description, status, icon: Icon }, i) => (
						<div
							key={i}
							className={`p-6 bg-${statusColor(status)}-50 rounded-lg grid grid-cols-[40px_1fr]`}
						>
							<Icon className={`text-${statusColor(status)}-600`} />
							<p className="font-semibold col-2">{title}</p>
							<p className="text-xs col-2">{description}</p>
						</div>
					),
				)}
			</div>
		</div>
	);
}

function StatCard({
	title,
	value,
	sub,
	highlight,
}: {
	title: string;
	value: string;
	sub: string;
	highlight?: boolean;
}) {
	return (
		<div
			className={`bg-white rounded-2xl shadow p-4 flex flex-col ${highlight ? "border-l-4 border-indigo-500" : ""}`}
		>
			<h4 className="text-gray-500 text-sm">{title}</h4>
			<p className="text-2xl font-semibold text-gray-800">{value}</p>
			<span className="text-xs text-gray-400">{sub}</span>
		</div>
	);
}
