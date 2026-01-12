// import ChartAnalytics from "../client/chart-analytics";

// export default async function ChartAnalyticsData() {
// 	return <ChartAnalytics />;
// }

// components/SimpleToggleNav.tsx
"use client";
import { useState } from "react";
import ChartAnalytics from "../client/chart-analytics";

import PerformanceAnalytics from "../client/performance-analytics";
import ListingsTable from "../client/mylistings-analytics";

export default function SimpleToggleNav() {
	const [activeTab, setActiveTab] = useState("tab1");

	const tabs = [
		{ id: "tab1", label: "Overview" },
		{ id: "tab2", label: "Performance" },
		{ id: "tab3", label: "My Listings" },
	];

	return (
		<div className="w-full max-w-4xl mx-auto">
			{/* Simple Tab Navigation */}
			<div className="border-b border-gray-200">
				<nav className="flex space-x-8">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${
					activeTab === tab.id
						? "border-blue-500 text-blue-600"
						: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
				}
              `}
						>
							{tab.label}
						</button>
					))}
				</nav>
			</div>

			{/* Tab Content */}
			<div className="py-6">
				{activeTab === "tab1" && <ChartAnalytics />}
				{activeTab === "tab2" && <PerformanceAnalytics />}
				{activeTab === "tab3" && <ListingsTable />}
			</div>
		</div>
	);
}
