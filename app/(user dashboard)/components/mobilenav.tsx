"use client";

import Badge from "./badge";
import type { NavItem } from "./navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function MobileNavigation({ navigationLinks }: { navigationLinks: NavItem[] }) {
	const pathname = usePathname();
	return (
		<nav className="fixed overflow-auto bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50 safe-area-bottom">
			<div className="flex items-center">
				{navigationLinks.map((item) => {
					const IconComponent = item.icon;

					return (
						<Link
							key={item.href}
							href={item.href}
							className={`flex flex-col items-center px-2 py-3 w-full transition-colors duration-200 ${
								pathname.startsWith(item.href)
									? "text-[var(--primary-color)]"
									: "text-gray-600 hover:text-gray-900"
							}`}>
							<div className="relative">
								<IconComponent className="w-5 h-5" />
								{item.badge && (
									<span className="absolute -top-2 -right-2">
										<Badge value={item.badge} />
									</span>
								)}
							</div>
							<span className="text-xs mt-1 font-medium">{item.label}</span>

							{/* Active indicator dot */}
							{pathname.startsWith(item.href)&& (
								<div className="w-1 h-1 bg-[var(--primary-color)] rounded-full mt-1"></div>
							)}
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
