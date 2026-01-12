"use client";
import { useState } from "react";
import ActionButtons from "./action-buttons";

interface Listing {
	title: string;
	date: string;
	views: number;
	inquiries: number;
	performance: "High" | "Medium" | "Low";
	featured?: boolean;
}

const listings: Listing[] = [
	{
		title: "Authentic Nigerian...",
		date: "Posted 3 days ago",
		views: 234,
		inquiries: 18,
		performance: "High",
		featured: true,
	},
	{
		title: "Professional Event...",
		date: "Posted 1 week ago",
		views: 156,
		inquiries: 12,
		performance: "Medium",
	},
	{
		title: "Homemade Nigerian...",
		date: "Posted 2 weeks ago",
		views: 189,
		inquiries: 15,
		performance: "High",
	},
	{
		title: "Yoruba Language...",
		date: "Posted 5 days ago",
		views: 98,
		inquiries: 8,
		performance: "Low",
	},
];

export default function ListingsTable() {
	const [page, setPage] = useState(1);
	const getBadgeColor = (status: Listing["performance"]) => {
		switch (status) {
			case "High":
				return "bg-green-100 text-green-700";
			case "Medium":
				return "bg-yellow-100 text-yellow-700";
			case "Low":
				return "bg-red-100 text-red-700";
		}
	};

	return (
		<div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 w-full  overflow-x-auto md:overflow-x-visible relative">
			<h2 className="text-lg font-semibold mb-4">All Listings</h2>

			<table className="min-w-full text-sm text-left border-collapse">
				<thead>
					<tr className="border-b text-gray-600">
						<th className="py-2 px-2 sm:px-4">Listing</th>
						<th className="py-2 px-2 sm:px-4">Views</th>
						<th className="py-2 px-2 sm:px-4">Inquiries</th>
						<th className="py-2 px-2 sm:px-4">Performance</th>
						<th className="py-2 px-2 sm:px-4">Actions</th>
					</tr>
				</thead>

				<tbody>
					{listings.map((list, i) => (
						<tr
							key={i}
							className="border-b hover:bg-gray-50 transition-colors text-gray-800"
						>
							<td className="py-3 px-2 sm:px-4">
								<div className="flex flex-col">
									<span className="font-medium">
										{list.title}
									</span>
									<div className="flex items-center gap-2 text-xs text-gray-500">
										<span>{list.date}</span>
										{list.featured && (
											<button className="bg-green-100 text-green-700 font-medium">
												Featured
											</button>
										)}
									</div>
								</div>
							</td>
							<td className="py-3 px-2 sm:px-4">{list.views}</td>
							<td className="py-3 px-2 sm:px-4">
								{list.inquiries}
							</td>
							<td className="py-3 px-2 sm:px-4">
								<span
									className={`px-3 py-1 rounded-full text-xs font-medium ${getBadgeColor(
										list.performance,
									)}`}
								>
									{list.performance}
								</span>
							</td>
							<td className="py-3 px-2 sm:px-4 relative">
								<ActionButtons />
							</td>
						</tr>
					))}
				</tbody>
			</table>

			{/* Pagination */}
			<div className="flex items-center justify-between mt-4 text-sm text-gray-600">
				<div className="flex gap-2 items-center">
					<button
						disabled={page === 1}
						onClick={() => setPage((p) => Math.max(p - 1, 1))}
					>
						Prev
					</button>
					<div className="flex gap-1">
						{[1, 2, 3].map((p) => (
							<button key={p} onClick={() => setPage(p)}>
								{p}
							</button>
						))}
						<span>...</span>
						<button>10</button>
					</div>
					<button onClick={() => setPage((p) => p + 1)}>Next</button>
				</div>
			</div>
		</div>
	);
}
