import type { Metadata } from "next";
import Index from ".";

export const metadata: Metadata = {
	title: "Chicago Nigerians - The Leading Online Community for Nigerians in Chicago",
	description:
		"ChicagoNigerians is the leading online community for Nigerians in Chicago, connecting the vibrant Nigerian diaspora in Chicago, Illinois through networking, cultural events, and business opportunities. Our platform serves as a trusted hub for Nigerian professionals, entrepreneurs, students, and families living in Chicago and the Chicagoland area. We provide access to Nigerian events in Chicago, African cultural festivals, business networking opportunities, local Nigerian-owned businesses, community news, and a dedicated marketplace where members can discover trusted services and promote their brands. Our mission is to strengthen the Nigerian community in Chicago by fostering meaningful connections, supporting Black and African-owned businesses, and creating opportunities for professional growth, collaboration, and cultural celebration. Whether you are new to Chicago or a long-time resident, ChicagoNigerians.com helps you connect with Nigerians near you, discover local events, find Nigerian restaurants and services in Chicago, and stay updated on community news all in one place. Join the fastest-growing Nigerian community platform in Chicago and stay connected to your culture, business network, and local opportunities.",
};

export default function Home() {
	return <Index />;
}
