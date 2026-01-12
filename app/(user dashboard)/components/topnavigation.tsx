"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell, Menu, Search, X, User, Settings as SettingsIcon, LogOut, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import Badge from "./badge";
import { useSession } from "@/app/store/useSession";
import { useAuthModal } from "@/app/store/useAuthModal";
import { callApi } from "@/app/libs/helper/callApi";

const NAV_LINKS = [
	{ name: "Home", href: "/" },
	{ name: "About", href: "/about" },
	{ name: "Marketplace", href: "/marketplace" },
	{ name: "Event/Ticketing", href: "/upcoming-events" },
	{ name: "News/Trending", href: "/news" },
	{ name: "Contact Us", href: "/contact" },
];

export default function TopNavigation() {
	const [mobileOpen, setMobileOpen] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const router = useRouter();
	const { user } = useSession((state) => state);
	const { clearSession } = useSession((state) => state.actions);
	const { openSignIn, openSignUp } = useAuthModal((state) => state.actions);

	useEffect(() => {
		document.body.style.overflow = mobileOpen ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [mobileOpen]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setDropdownOpen(false);
			}
		};

		if (dropdownOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [dropdownOpen]);

	const handleLogout = async () => {
		try {
			await callApi("/auth/logout", "POST");
			clearSession();
			setDropdownOpen(false);
			router.push("/");
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	return (
		<nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 py-2 z-50">
			<div className="container-custom mx-auto flex items-center justify-between gap-4 md:gap-8">
				{/* Logo */}
				<Link href="/" className="flex-shrink-0">
					<Image
						src="/chicago-nigeria-logo-1.png"
						alt="Chicago Nigeria Logo"
						width={80}
						height={20}
						className=""
						priority
					/>
				</Link>

				{/* Search bar (Desktop only) - Coming Soon */}
				<div className="hidden md:flex items-center gap-2 w-full max-w-md bg-gray-100 rounded-lg py-2 px-3 relative">
					<Search className="w-5 h-5 stroke-gray-400" />
					<input
						type="text"
						placeholder="Search for people, posts, events..."
						className="w-full px-2 py-1 text-sm bg-transparent focus-visible:outline-none text-gray-400 cursor-not-allowed"
						disabled
					/>
					<span className="absolute right-3 text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded">
						Coming Soon
					</span>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-3 md:gap-4">
					{user ? (
						<>
							{/* Notification */}
							<Link href="/notifications" className="relative">
								<Bell className="w-5 h-5" aria-label="Notifications" />
							</Link>

							{/* Profile dropdown */}
							<div className="relative" ref={dropdownRef}>
								<button
									onClick={() => setDropdownOpen(!dropdownOpen)}
									className="flex items-center gap-2 focus:outline-none group"
									aria-label="Profile menu"
								>
									<div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-200 group-hover:ring-2 group-hover:ring-[var(--primary-color)]/20 transition-all">
										{user.photo ? (
											<Image
												src={user.photo}
												alt="Profile picture"
												width={40}
												height={40}
												className="object-cover w-full h-full"
											/>
										) : (
											<User className="w-5 h-5 text-gray-600" />
										)}
									</div>
									<ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
								</button>

								{/* Dropdown Menu */}
								{dropdownOpen && (
									<div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
										<Link
											href="/settings"
											onClick={() => setDropdownOpen(false)}
											className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
										>
											<SettingsIcon className="w-4 h-4" />
											Settings
										</Link>
										<button
											onClick={handleLogout}
											className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
										>
											<LogOut className="w-4 h-4" />
											Logout
										</button>
									</div>
								)}
							</div>
						</>
					) : (
						<>
							{/* Sign In Button */}
							<button
								onClick={() => openSignIn()}
								className="px-3 md:px-4 py-2 text-sm rounded-lg border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 transition-colors"
							>
								Sign In
							</button>
							{/* Sign Up Button */}
							<button
								onClick={() => openSignUp()}
								className="px-3 md:px-4 py-2 text-sm rounded-lg bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90 transition-colors"
							>
								Sign Up
							</button>
						</>
					)}
				</div>
			</div>
		</nav>
	);
}
