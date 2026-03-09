import type { Metadata } from "next";

const BANNER_URL =
	"https://res.cloudinary.com/dinu5qevr/image/upload/v1773086706/chicago-nigeria/events/smart-city-lagos-banner.jpg";

export const metadata: Metadata = {
	title: "Alaro City Private Property Showcase | Chicago Nigerians",
	description:
		"Exclusive Investor Reception in Chicago. Discover investment opportunities in Alaro City — a master-planned 2,000-hectare smart city in the Lekki Free Zone, Lagos.",
	openGraph: {
		title: "Alaro City Private Property Showcase",
		description:
			"Exclusive Investor Reception in Chicago. Discover investment opportunities in Alaro City — a 2,000-hectare smart city in the Lekki Free Zone.",
		images: [
			{
				url: BANNER_URL,
				width: 1200,
				height: 630,
				alt: "Alaro City Free Zone entrance",
			},
		],
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Alaro City Private Property Showcase",
		description:
			"Exclusive Investor Reception in Chicago. Discover investment opportunities in Alaro City.",
		images: [BANNER_URL],
	},
};

export default function SmartCityLagosLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
