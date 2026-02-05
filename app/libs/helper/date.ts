type FormatOptions = {
	year?: "numeric" | "2-digit";
	month?: "long" | "short" | "narrow" | "numeric" | "2-digit";
	day?: "numeric" | "2-digit";
	weekday?: "long" | "short" | "narrow";
	hour?: "numeric" | "2-digit";
	minute?: "numeric" | "2-digit";
	second?: "numeric" | "2-digit";
	timeZoneName?: "short" | "long";
};

export default function formatDate(
	date: string | Date | undefined,
	options?: FormatOptions,
): string {
	if(!date) return "Date not available"
	const dateObject = new Date(date);

	const defaultOptions: FormatOptions = {
		year: "numeric",
		month: "long",
		day: "numeric",
	};

	return dateObject.toLocaleDateString("en-US", {
		...defaultOptions,
		...options,
	});
}

/**
 * Formats a date as relative time (e.g., "2 days ago", "Just now")
 * Shows exact date when it's been more than 7 days
 */
export function formatRelativeDate(date: string | Date | undefined): string {
	if (!date) return "Date not available";

	const dateObject = new Date(date);
	const now = new Date();
	const diffInMs = now.getTime() - dateObject.getTime();
	const diffInSeconds = Math.floor(diffInMs / 1000);
	const diffInMinutes = Math.floor(diffInSeconds / 60);
	const diffInHours = Math.floor(diffInMinutes / 60);
	const diffInDays = Math.floor(diffInHours / 24);

	// Show exact date if more than 7 days
	if (diffInDays >= 7) {
		return dateObject.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	}

	if (diffInSeconds < 60) {
		return "Just now";
	}

	if (diffInMinutes < 60) {
		return diffInMinutes === 1 ? "1 minute ago" : `${diffInMinutes} minutes ago`;
	}

	if (diffInHours < 24) {
		return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
	}

	return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
}
