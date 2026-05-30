"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Megaphone, Sparkles, TrendingUp } from "lucide-react";

const HREF = "/social-media-subscription";

/**
 * Distinct sidebar nav link — deliberately styled differently from the plain
 * nav items (gradient pill) so the social-media service stands out and stays
 * reachable even after the banner is dismissed. Rendered OUTSIDE the
 * `.sidebar-buttons` container so it doesn't inherit the base link styling.
 */
export function PromoteBusinessLink() {
    const pathname = usePathname();
    const isActive = pathname.startsWith(HREF);

    return (
        <Link
            href={HREF}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all ${
                isActive
                    ? "bg-[#03543d] text-white"
                    : "bg-gradient-to-r from-[var(--primary-color)] to-[#03543d] text-white hover:opacity-95"
            }`}
        >
            <Megaphone className="w-4 h-4 text-yellow-300 shrink-0" />
            <span>Promote Business</span>
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 ml-auto shrink-0" />
        </Link>
    );
}

/**
 * Richer promo card for the sidebar — always visible upsell for the social
 * media management packages.
 */
export function PromoteBusinessCard() {
    return (
        <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
                <div className="bg-[var(--primary-color)]/10 p-1.5 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-[var(--primary-color)]" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Grow Your Business</h3>
            </div>
            <p className="text-xs text-gray-500 mb-3">
                Let our experts manage your social media. Plans from $65/mo.
            </p>
            <Link
                href={HREF}
                className="block text-center bg-[var(--primary-color)] text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-[var(--primary-color)]/90 transition-colors"
            >
                View Plans
            </Link>
        </div>
    );
}
