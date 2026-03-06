"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
	CheckCircle2,
	CalendarCheck,
	MessageCircle,
	Heart,
	MessageSquare,
	MoreHorizontal,
	ChevronDown,
	ChevronUp,
	Bell,
	BellOff,
	Loader2,
	XCircle,
	CheckCheck,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Notification } from "@/app/services";
import { useSession } from "@/app/store/useSession";
import { toast } from "sonner";

type INotification = Notification.INotification;

// --- Icon component ---
const NotificationIcon = ({ type }: { type: string }) => {
	switch (type) {
		case "listing_approved":
			return (
				<div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
					<CheckCircle2 className="w-5 h-5 text-green-600" />
				</div>
			);
		case "listing_rejected":
			return (
				<div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
					<XCircle className="w-5 h-5 text-red-500" />
				</div>
			);
		case "event_approved":
			return (
				<div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
					<CalendarCheck className="w-5 h-5 text-blue-600" />
				</div>
			);
		case "event_rejected":
			return (
				<div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
					<XCircle className="w-5 h-5 text-red-500" />
				</div>
			);
		case "like":
			return (
				<div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
					<Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
				</div>
			);
		case "comment":
			return (
				<div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
					<MessageSquare className="w-5 h-5 text-blue-500" />
				</div>
			);
		case "message":
			return (
				<div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
					<MessageCircle className="w-5 h-5 text-green-500" />
				</div>
			);
		default:
			return (
				<div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
					<Bell className="w-5 h-5 text-gray-400" />
				</div>
			);
	}
};

// --- Browser notification permission ---
async function requestBrowserNotificationPermission(): Promise<boolean> {
	if (!("Notification" in window)) return false;
	if (window.Notification.permission === "granted") return true;
	if (window.Notification.permission === "denied") return false;
	const result = await window.Notification.requestPermission();
	return result === "granted";
}

function fireBrowserNotification(title: string, body: string, link?: string | null) {
	if (!("Notification" in window) || window.Notification.permission !== "granted") return;
	const n = new window.Notification(title, {
		body,
		icon: "/favicon.ico",
	});
	if (link) {
		n.onclick = () => {
			window.focus();
			window.location.href = link;
		};
	}
}

export default function Notifications() {
	const router = useRouter();
	const { user } = useSession((s) => s);
	const [notifications, setNotifications] = useState<INotification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const [browserPermission, setBrowserPermission] = useState<NotificationPermission | "unsupported">("default");

	// Track which notification ids we've already shown as browser notifications
	const shownIds = useRef<Set<string>>(new Set());

	// Close menu on outside click
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setMenuOpen(false);
			}
		};
		if (menuOpen) document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [menuOpen]);

	// Fetch notifications
	const fetchNotifications = useCallback(async (isBackground = false) => {
		if (!user) {
			setLoading(false);
			return;
		}
		if (!isBackground) setLoading(true);
		const { data, error } = await Notification.getAll({ limit: 50 });
		if (!error && data) {
			const newNotifications = data.data;
			setUnreadCount(data.unreadCount);

			// Fire browser notifications for newly arrived unread ones
			if (isBackground && "Notification" in window && window.Notification.permission === "granted") {
				for (const n of newNotifications) {
					if (!n.isRead && !shownIds.current.has(n.id)) {
						shownIds.current.add(n.id);
						fireBrowserNotification(n.title, n.message, n.link);
					}
				}
			} else {
				// On initial load just seed the set without firing
				for (const n of newNotifications) {
					shownIds.current.add(n.id);
				}
			}

			setNotifications(newNotifications);
		}
		if (!isBackground) setLoading(false);
	}, [user]);

	// Initial load
	useEffect(() => {
		fetchNotifications(false);
	}, [fetchNotifications]);

	// Poll for new notifications every 30s
	useEffect(() => {
		if (!user) return;
		const interval = setInterval(() => fetchNotifications(true), 30_000);
		return () => clearInterval(interval);
	}, [user, fetchNotifications]);

	// Check browser notification permission state
	useEffect(() => {
		if (!("Notification" in window)) {
			setBrowserPermission("unsupported");
		} else {
			setBrowserPermission(window.Notification.permission);
		}
	}, []);

	const handleEnableBrowserNotifications = async () => {
		const granted = await requestBrowserNotificationPermission();
		setBrowserPermission(granted ? "granted" : "denied");
		if (granted) {
			toast.success("Browser notifications enabled");
		} else {
			toast.error("Permission denied. Enable notifications in your browser settings.");
		}
	};

	const handleNotificationClick = async (notification: INotification) => {
		// Mark as read
		if (!notification.isRead) {
			setNotifications((prev) =>
				prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
			);
			setUnreadCount((prev) => Math.max(0, prev - 1));
			await Notification.markAsRead(notification.id);
		}

		// Navigate to the linked page
		if (notification.link) {
			router.push(notification.link);
		}
	};

	const handleMarkAllAsRead = async () => {
		setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
		setUnreadCount(0);
		const { error } = await Notification.markAllAsRead();
		if (error) {
			toast.error("Failed to mark all as read");
			fetchNotifications(false);
		}
	};

	if (!user) {
		return (
			<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center">
				<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
					<Bell className="w-8 h-8 text-gray-400" />
				</div>
				<h3 className="text-lg font-medium text-gray-900 mb-2">Sign in to see notifications</h3>
				<p className="text-gray-500">You need to be signed in to view your notifications.</p>
			</div>
		);
	}

	return (
		<div className="space-y-6 pb-20 md:pb-6">

			{/* Header Section */}
			<div className="bg-white px-6 py-5 rounded-2xl border border-gray-200 shadow-sm">
				<div className="flex items-center justify-between sm:hidden">
					<h2 className="text-xl font-bold text-gray-900">Notifications</h2>
					<button
						onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
						className="p-1 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
					>
						{isHeaderCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
					</button>
				</div>

				<div className={`flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isHeaderCollapsed ? 'hidden sm:flex' : 'flex mt-4 sm:mt-0'}`}>
					<div className="flex-1 hidden sm:block">
						<h2 className="text-xl font-bold text-gray-900 flex items-center">
							<span>Notifications</span>
							{unreadCount > 0 && (
								<span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-[var(--primary-color)] rounded-full">
									{unreadCount > 9 ? "9+" : unreadCount}
								</span>
							)}
						</h2>
						<p className="text-sm text-gray-600">Stay updated on activities and messages</p>
					</div>
					<div className="flex-1 sm:hidden">
						<p className="text-sm text-gray-600">Stay updated on activities and messages</p>
					</div>

					<div className="flex items-center gap-2">
						{/* Browser notification toggle */}
						{browserPermission !== "unsupported" && browserPermission !== "granted" && (
							<button
								onClick={handleEnableBrowserNotifications}
								className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
								title="Enable browser notifications"
							>
								<Bell className="w-4 h-4" />
								<span className="hidden sm:inline">Enable alerts</span>
							</button>
						)}
						{browserPermission === "granted" && (
							<span className="flex items-center gap-1 text-xs text-green-600 px-2 py-1 bg-green-50 rounded-lg">
								<Bell className="w-3.5 h-3.5" />
								Alerts on
							</span>
						)}
						<div className="relative" ref={menuRef}>
							<button
								onClick={() => setMenuOpen((o) => !o)}
								className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
							>
								<MoreHorizontal className="w-5 h-5" />
							</button>
							{menuOpen && (
								<div className="absolute left-0 sm:left-auto sm:right-0 mt-1 w-48 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-10">
									<button
										onClick={() => { handleMarkAllAsRead(); setMenuOpen(false); }}
										disabled={unreadCount === 0}
										className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
									>
										<CheckCheck className="w-4 h-4" />
										Mark all as read
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Notifications List */}
			<div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
				{loading ? (
					<div className="flex items-center justify-center py-16">
						<Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
					</div>
				) : notifications.length > 0 ? (
					<div className="divide-y divide-gray-100">
						{notifications.map((notification) => (
							<div
								key={notification.id}
								onClick={() => handleNotificationClick(notification)}
								className={`flex gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer relative
                                    ${!notification.isRead ? 'bg-blue-50/30' : ''}
                                `}
							>
								{/* Unread left bar */}
								{!notification.isRead && (
									<div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--primary-color)]" />
								)}

								{/* Icon */}
								<NotificationIcon type={notification.type} />

								{/* Content */}
								<div className="flex-1 min-w-0">
									<p className="text-sm font-semibold text-gray-900">{notification.title}</p>
									<p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{notification.message}</p>
									<p className="text-xs text-gray-400 mt-1.5">
										{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
									</p>
								</div>

								{/* Unread dot */}
								{!notification.isRead && (
									<div className="w-2.5 h-2.5 rounded-full bg-[var(--primary-color)] shrink-0 mt-2" />
								)}
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-16 px-4">
						<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<Bell className="w-8 h-8 text-gray-400" />
						</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
						<p className="text-gray-500 max-w-sm mx-auto">
							When you get comments, likes, or messages, they will show up here.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
