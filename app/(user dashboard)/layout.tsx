import SideNavigation from "./components/navigation";
import TopNavigation from "./components/topnavigation";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<TopNavigation />
			<SideNavigation>{children}</SideNavigation>
		</>
	);
}
