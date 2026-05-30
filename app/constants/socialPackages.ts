// Social Media Management packages & add-ons.
// Mirror of backend `src/config/socialPackages.js` — keep the two in sync.
// Amounts are in cents.

export interface SocialPackage {
	id: "bronze" | "silver" | "gold";
	name: string;
	amount: number; // cents / month
	tagline: string;
	highlight?: boolean;
	features: string[];
}

export interface SocialAddon {
	id: "additional_reel" | "ad_campaign_setup" | "event_promotion" | "seo";
	name: string;
	amount: number; // cents
	quantityBased?: boolean;
	maxQuantity?: number;
	unitLabel?: string;
}

export const SOCIAL_PACKAGES: SocialPackage[] = [
	{
		id: "bronze",
		name: "Bronze Package",
		amount: 6500,
		tagline: "Get your business online with the essentials.",
		features: [
			"8 Social Media Posts",
			"Basic Graphic Design",
			"Facebook & Instagram Management",
			"Content Scheduling",
			"Monthly Performance Report",
		],
	},
	{
		id: "silver",
		name: "Silver Package",
		amount: 15000,
		tagline: "Grow your reach with custom content and engagement.",
		highlight: true,
		features: [
			"16 Social Media Posts",
			"Custom Graphics & Stories",
			"Facebook, Instagram & LinkedIn Management",
			"Community Engagement",
			"Hashtag Research",
			"Monthly Strategy Session",
		],
	},
	{
		id: "gold",
		name: "Gold Package",
		amount: 30000,
		tagline: "Full-service management with video and paid ads.",
		features: [
			"30 Social Media Posts",
			"Reels & Short-Form Video Content",
			"Multi-Platform Management",
			"Advanced Graphic Design",
			"Community Management",
			"Basic Paid Ad Management",
			"Detailed Analytics Report",
			"Priority Support",
		],
	},
];

export const SOCIAL_ADDONS: SocialAddon[] = [
	{
		id: "additional_reel",
		name: "Additional Reel",
		amount: 1500,
		quantityBased: true,
		maxQuantity: 20,
		unitLabel: "each",
	},
	{
		id: "ad_campaign_setup",
		name: "Social Media Ad Campaign Setup",
		amount: 5000,
	},
	{
		id: "event_promotion",
		name: "Event Promotion Campaign",
		amount: 7500,
	},
	{
		id: "seo",
		name: "Website SEO Optimization",
		amount: 10000,
		unitLabel: "/month",
	},
];

export const formatCents = (cents: number) => {
	const dollars = cents / 100;
	return Number.isInteger(dollars)
		? `$${dollars}`
		: `$${dollars.toFixed(2)}`;
};
