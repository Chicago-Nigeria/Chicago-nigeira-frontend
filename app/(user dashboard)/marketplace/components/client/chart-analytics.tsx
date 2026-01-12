"use client";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
} from "recharts";

const lineData = [
	{ date: "Oct 8", value: 5 },
	{ date: "Oct 22", value: 10 },
	{ date: "Nov 12", value: 17 },
];

const pieData = [
	{ name: "Fashion", value: 40, color: "#6366F1" },
	{ name: "Services", value: 25, color: "#F97316" },
	{ name: "Food", value: 20, color: "#10B981" },
	{ name: "Education", value: 10, color: "#F59E0B" },
	{ name: "Others", value: 5, color: "#6B7280" },
];
export default function ChartAnalytics() {
	return (
		<>
			{/* Top Stats */}
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
			<div className="bg-white p-8 rounded-lg">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div className="bg-white rounded-2xl shadow p-4">
						<h3 className="font-semibold text-gray-700 mb-2">
							Listing Growth
						</h3>
						<ResponsiveContainer width="100%" height={200}>
							<LineChart data={lineData}>
								<XAxis dataKey="date" />
								<YAxis />
								<Tooltip />
								<Line
									type="monotone"
									dataKey="value"
									stroke="#6366F1"
									strokeWidth={3}
									dot={{ r: 5 }}
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>

					<div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center justify-center">
						<h3 className="font-semibold text-gray-700 mb-4">
							Category Distribution
						</h3>
						<ResponsiveContainer width="100%" height={220}>
							<PieChart>
								<Pie
									data={pieData}
									dataKey="value"
									outerRadius={80}
									label
								>
									{pieData.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={entry.color}
										/>
									))}
								</Pie>
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
					</div>
				</div>
				{/* Boost Section */}
				<div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-center space-y-1 mt-8">
					<h3 className="text-lg font-semibold text-gray-700">
						Boost Your Performance
					</h3>
					<p className="text-gray-500 text-sm">
						Get more visibility and inquiries with premium features
					</p>
					<div className="flex justify-center gap-4 flex-wrap mt-4">
						<button className="bg-green-500 hover:bg-green-600 text-white rounded-xl px-5 py-2">
							Boost Listing
						</button>
						<button className="rounded-xl px-5 py-2">
							Create New Listing
						</button>
					</div>
				</div>
			</div>
		</>
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
