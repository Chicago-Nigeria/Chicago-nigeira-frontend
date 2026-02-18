import type { Metadata } from "next";
import MarketplaceClient from "./MarketplaceClient";

export const metadata: Metadata = {
	title: "Nigerian Businesses in Chicago | Marketplace & Local Services",
	description:
		"Discover Nigerian-owned businesses, services, and products in Chicago. Shop, promote, and connect with trusted vendors in the Chicago Nigerian marketplace.",
};

export default function MarketplacePage() {
	return <MarketplaceClient />;
}
