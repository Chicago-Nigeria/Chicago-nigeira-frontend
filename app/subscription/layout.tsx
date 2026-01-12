import { Toaster } from "sonner";
import "../globals.css";
import { Metadata } from "next";
export const metadata: Metadata = {
	title: "Chicago Nigeria - Subsciption",
	description:
		"Chicago Nigeria is a web platform to connect Nigerians who reside in Chicago together",
	icons: {
		icon: "/favicon_io/favicon.ico",
		shortcut: "/favicon_io/favicon-32x32.png",
		apple: "/favicon_io/favicon-32x32.png",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			{children} <Toaster position="top-center" richColors />{" "}
		</>
	);
}
