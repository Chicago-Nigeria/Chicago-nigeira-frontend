"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";

interface PrivacySetting {
	id: string;
	label: string;
	description: string;
	enabled: boolean;
}

export default function PrivacySettings() {
	const [settings, setSettings] = useState<PrivacySetting[]>([
		{
			id: "showEmail",
			label: "Show Email Address",
			description: "Let others see your email on your profile",
			enabled: true,
		},
		{
			id: "showPhone",
			label: "Show Phone Number",
			description: "display your phone number publicly",
			enabled: true,
		},
		{
			id: "allowMessages",
			label: "Allow Messages From Anyone",
			description: "Let anyone send you messages, not just connections",
			enabled: true,
		},
		{
			id: "showOnlineStatus",
			label: "Show Online Status",
			description: "Let others see when you're active",
			enabled: true,
		},
	]);

	const toggleSetting = (id: string) => {
		setSettings((prev) =>
			prev.map((setting) =>
				setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
			)
		);
	};

	const handleSave = () => {
		// This would normally save to backend
		toast.success("Privacy settings saved successfully");
	};

	return (
		<div className="space-y-6">
			<h2 className="text-lg font-semibold text-gray-900">Privacy Settings</h2>

			{/* Privacy Settings List */}
			<div className="space-y-4">
				{settings.map((setting) => (
					<div
						key={setting.id}
						className="flex items-center justify-between py-4 border-b border-gray-200 last:border-0"
					>
						<div className="flex-1">
							<h3 className="text-sm font-medium text-gray-900">
								{setting.label}
							</h3>
							<p className="text-sm text-gray-600 mt-0.5">
								{setting.description}
							</p>
						</div>
						<button
							type="button"
							onClick={() => toggleSetting(setting.id)}
							className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-offset-2 ${
								setting.enabled ? "bg-[var(--primary-color)]" : "bg-gray-300"
							}`}
						>
							<span
								className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
									setting.enabled ? "translate-x-6" : "translate-x-1"
								}`}
							/>
						</button>
					</div>
				))}
			</div>

			{/* Save Button */}
			<div className="flex justify-end pt-4">
				<button
					onClick={handleSave}
					className="flex items-center gap-2 px-6 py-2.5 bg-[var(--primary-color)] text-white text-sm font-medium rounded-lg hover:bg-[var(--primary-color)]/90 transition-colors"
				>
					<Save className="w-4 h-4" />
					Save Settings
				</button>
			</div>
		</div>
	);
}
