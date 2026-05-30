"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, X, TrendingUp } from "lucide-react";

// Dismissing the banner snoozes it for 7 days (instead of hiding it forever),
// so the offer stays discoverable without nagging users on every visit.
const SNOOZE_KEY = "sub_banner_snoozed_until";
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export default function SubscriptionBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const snoozedUntil = Number(localStorage.getItem(SNOOZE_KEY));
        // Show if never snoozed, or the snooze window has elapsed.
        if (!snoozedUntil || Date.now() > snoozedUntil) {
            // Clear stale legacy permanent-dismiss flag from the old behavior.
            localStorage.removeItem("hide_sub_banner");
            setIsVisible(true);
        }
    }, []);

    // Also hiding if not visible to prevent layout shift initially
    if (!isVisible) return null;

    const handleDismiss = () => {
        localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
        setIsVisible(false);
    };

    return (
        <div className="relative rounded-xl bg-gradient-to-r from-[var(--primary-color)] to-[#03543d] shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:px-4 sm:py-3 gap-3 pr-8 sm:pr-10">
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-lg shrink-0 hidden sm:block">
                        <TrendingUp className="w-5 h-5 text-yellow-300" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-sm flex items-center gap-1.5">
                            Grow Your Business <Sparkles className="w-3 h-3 text-yellow-300" />
                        </h3>
                        <p className="text-emerald-50 text-xs mt-0.5 line-clamp-2 sm:line-clamp-1 max-w-xl">
                            No time to post? Let our experts handle your social media management and content. Plans from $65/mo.
                        </p>
                    </div>
                </div>

                <Link
                    href="/social-media-subscription"
                    className="w-full sm:w-auto text-center bg-white text-[var(--primary-color)] hover:bg-gray-50 font-medium px-4 py-1.5 rounded-lg transition-colors shadow-sm whitespace-nowrap text-sm shrink-0"
                >
                    Learn More
                </Link>

                <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 sm:top-1/2 sm:-translate-y-1/2 p-1 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                    aria-label="Dismiss banner"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
