"use client";
import {
	Bell,
	Calendar,
	Clock,
	Home,
	LucideIcon,
	MessageCircle,
	Settings,
	ShoppingBag,
	TrendingUp,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Badge from "./badge";
import MobileNavigation from "./mobilenav";
import { Message, Notification } from "@/app/services";
import { useSession } from "@/app/store/useSession";

export type NavItem = {
	href: string;
	label: string;
	icon: LucideIcon;
	badge?: number;
};

const baseNavItems: NavItem[] = [
	{ href: "/feeds", label: "Feeds", icon: Home },
	{ href: "/events", label: "Events", icon: Calendar },
	{ href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
	{ href: "/messages", label: "Messages", icon: MessageCircle },
	{ href: "/groups", label: "Groups", icon: Users },
	{ href: "/notifications", label: "Notifications", icon: Bell },
	{ href: "/settings", label: "Settings", icon: Settings },
];

export default function SideNavigation({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const { user } = useSession((s) => s);
	const [unreadNotifCount, setUnreadNotifCount] = useState(0);
	const [unreadMsgCount, setUnreadMsgCount] = useState(0);

	useEffect(() => {
		if (!user) return;

		const fetchCounts = async () => {
			const [notifRes, msgRes] = await Promise.all([
				Notification.getUnreadCount(),
				Message.getUnreadCount(),
			]);
			if (notifRes.data) setUnreadNotifCount(notifRes.data.count);
			if (msgRes.data) setUnreadMsgCount(msgRes.data.count);
		};

		fetchCounts();
		const interval = setInterval(fetchCounts, 30_000);
		return () => clearInterval(interval);
	}, [user]);

	// Clear badges when on the respective pages
	useEffect(() => {
		if (pathname.startsWith("/notifications")) setUnreadNotifCount(0);
		if (pathname.startsWith("/messages")) setUnreadMsgCount(0);
	}, [pathname]);

	const navItems = baseNavItems.map((item) => {
		if (item.href === "/notifications" && unreadNotifCount > 0)
			return { ...item, badge: unreadNotifCount };
		if (item.href === "/messages" && unreadMsgCount > 0)
			return { ...item, badge: unreadMsgCount };
		return item;
	});

	// Filter out notifications and settings for mobile navigation
	const mobileNavItems = navItems.filter(
		(item) => item.href !== "/notifications" && item.href !== "/settings"
	);

	return (
		<>
			<main className="container-custom grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 pt-24 pb-24 lg:pb-12">
				<aside className="lg:block hidden">
					<div className="fixed top-24 w-[240px] space-y-6 h-[calc(100vh-5rem)] overflow-y-auto">
						<aside className="space-y-1 bg-white p-3 rounded-xl border border-gray-200 shadow-sm sidebar-buttons">
							{navItems.map(
								({ href, label, icon: Icon, badge }) => (
									<Link
										key={href}
										href={href}
										className={`${
											pathname.startsWith(href)
												? "bg-[var(--primary-color)] text-white"
												: ""
										}`}
									>
										<Icon className="w-4 h-4" />
										<span>{label}</span>
										{badge && <Badge value={badge} />}
									</Link>
								),
							)}
						</aside>
						<div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
							<h2 className="flex items-center gap-2 text-sm font-semibold">
								<TrendingUp className="text-[var(--primary-color)] w-5 h-5" />
								Trending Now
							</h2>
							<div className="flex flex-col items-center justify-center py-6 space-y-2">
								<Clock className="w-10 h-10 text-gray-300" />
								<p className="text-sm text-gray-500 font-medium">Coming Soon</p>
								<p className="text-xs text-gray-400 text-center">
									Trending topics will be available here
								</p>
							</div>
						</div>
					</div>
				</aside>
				<section className="bg-transparent">{children}</section>
				<MobileNavigation navigationLinks={mobileNavItems} />
			</main>
		</>
	);
}
