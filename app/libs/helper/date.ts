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
