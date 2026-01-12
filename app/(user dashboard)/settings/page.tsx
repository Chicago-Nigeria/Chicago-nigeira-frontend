"use client";

import { useState } from "react";
import { Bell, Lock, Shield, User as UserIcon } from "lucide-react";
import ProfileSettings from "./components/ProfileSettings";
// import NotificationSettings from "./components/NotificationSettings";
// import PrivacySettings from "./components/PrivacySettings";

type TabType = "profile" | "account" | "notifications" | "privacy";

const tabs = [
	{ id: "profile" as TabType, label: "Profile", icon: UserIcon },
	{ id: "account" as TabType, label: "Account", icon: Shield },
	{ id: "notifications" as TabType, label: "Notifications", icon: Bell },
	{ id: "privacy" as TabType, label: "Privacy", icon: Lock },
];

export default function SettingsPage() {
	const [activeTab, setActiveTab] = useState<TabType>("profile");

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="bg-white px-6 py-5 rounded-xl border border-gray-200 shadow-sm">
				<h1 className="text-2xl font-bold text-gray-900">Settings</h1>
				<p className="text-sm text-gray-600 mt-1">
					Manage your account settings and preferences
				</p>
			</div>

			{/* Tabs */}
			<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
				{/* Tab Navigation */}
				<div className="border-b border-gray-200">
					<div className="flex gap-2 p-2">
						{tabs.map((tab) => {
							const Icon = tab.icon;
							return (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
										activeTab === tab.id
											? "bg-[var(--primary-color)] text-white"
											: "text-gray-700 hover:bg-gray-50"
									}`}
								>
									<Icon className="w-4 h-4" />
									{tab.label}
								</button>
							);
						})}
					</div>
				</div>

				{/* Tab Content */}
				<div className="p-6">
					{activeTab === "profile" && <ProfileSettings />}
					{activeTab === "account" && (
						<div className="text-center py-12 text-gray-500">
							<Shield className="w-12 h-12 mx-auto mb-3 text-gray-400" />
							<h3 className="text-lg font-medium text-gray-900 mb-1">
								Account Settings
							</h3>
							<p className="text-sm">Coming soon</p>
						</div>
					)}
					{activeTab === "notifications" && (
						<div className="text-center py-12 text-gray-500">
							<Bell className="w-12 h-12 mx-auto mb-3 text-gray-400" />
							<h3 className="text-lg font-medium text-gray-900 mb-1">
								Notification Settings
							</h3>
							<p className="text-sm">Coming soon</p>
						</div>
					)}
					{activeTab === "privacy" && (
						<div className="text-center py-12 text-gray-500">
							<Lock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
							<h3 className="text-lg font-medium text-gray-900 mb-1">
								Privacy Settings
							</h3>
							<p className="text-sm">Coming soon</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
