import type { Metadata } from "next";
import EventsClient from "./EventsClient";

export const metadata: Metadata = {
	title: "Nigerian Events in Chicago | Cultural & Networking",
	description:
		"Explore upcoming Nigerian events in Chicago including cultural festivals, networking meetups, parties, and community gatherings across the Chicagoland area. Buy tickets for top Nigerian events in Chicago. Secure entry to cultural celebrations, concerts, networking events, and exclusive community experiences.",
};

export default function EventsPage() {
	return <EventsClient />;
}
