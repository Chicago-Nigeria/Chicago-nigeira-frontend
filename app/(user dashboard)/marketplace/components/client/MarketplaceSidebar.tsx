"use client";

import { useEffect, useState } from "react";
import {
    ChartNoAxesColumnIncreasing,
    MapPin,
    UsersRound,
    BriefcaseConveyorBelt,
} from "lucide-react";
import Link from "next/link";
import { callApi } from "@/app/libs/helper/callApi";
import { ApiResponse } from "@/app/types";

interface MarketplaceStats {
    activeListings: number;
    weeklyViews: number;
    activeSellers: number;
    popularCategories: { category: string; count: number }[];
}

interface MarketplaceSidebarProps {
    className?: string;
    showQuickAction?: boolean;
}

export default function MarketplaceSidebar({ className = "", showQuickAction = false }: MarketplaceSidebarProps) {
    const [stats, setStats] = useState<MarketplaceStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const { data, error } = await callApi<ApiResponse<MarketplaceStats>>(
                '/listings/analytics/stats',
                'GET'
            );

            if (!error && data?.data) {
                setStats(data.data);
            }
            setLoading(false);
        };

        fetchStats();
    }, []);

    const formatNumber = (num: number): string => {
        if (num >= 1000) {
            return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}k`;
        }
        return num.toLocaleString();
    };

    return (
        <aside className={`space-y-4 sticky top-4 h-fit hidden lg:block ${className}`}>
            {/* Quick Action - Only for Main Page */}
            {showQuickAction && (
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                    <h2 className="font-bold text-gray-900">Quick Action</h2>
                    <div className="space-y-3">
                        <Link
                            href="/marketplace/create-listing"
                            className="flex items-center gap-2 justify-center p-2.5 rounded-lg text-sm bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90 transition-colors font-medium shadow-sm"
                        >
                            <span className="text-xl leading-none">+</span>
                            <span>Create Listing</span>
                        </Link>
                        <Link
                            href="/marketplace/analytics"
                            className="flex items-center gap-2 justify-center p-2.5 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 transition-colors font-medium text-gray-700"
                        >
                            <ChartNoAxesColumnIncreasing className="w-4 h-4 text-[var(--primary-color)]" />
                            <span>View Analytics</span>
                        </Link>
                    </div>
                </div>
            )}

            {/* Marketplace Stats */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                <h2 className="flex gap-2 items-center text-base font-semibold text-gray-900 mb-4">
                    <span>Marketplace Stats</span>
                    <ChartNoAxesColumnIncreasing className="w-5 h-5 text-[var(--primary-color)]" />
                </h2>
                <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <p className="text-sm text-gray-600">Active Listings</p>
                        <p className="text-sm font-semibold text-[var(--primary-color)]">
                            {loading ? '...' : formatNumber(stats?.activeListings ?? 0)}
                        </p>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <p className="text-sm text-gray-600">This Week&apos;s Views</p>
                        <p className="text-sm font-semibold text-[var(--primary-color)]">
                            {loading ? '...' : formatNumber(stats?.weeklyViews ?? 0)}
                        </p>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <p className="text-sm text-gray-600">Active Sellers</p>
                        <p className="text-sm font-semibold text-[var(--primary-color)]">
                            {loading ? '...' : formatNumber(stats?.activeSellers ?? 0)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Popular Categories */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Popular Categories</h2>
                <div className="space-y-3">
                    {loading ? (
                        <>
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                                </div>
                            ))}
                        </>
                    ) : stats?.popularCategories?.length ? (
                        stats.popularCategories.map((category) => (
                            <div
                                key={category.category}
                                className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                            >
                                <p className="text-sm text-gray-600">{category.category}</p>
                                <p className="text-sm font-semibold text-[var(--primary-color)]">{category.count}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">No categories available</p>
                    )}
                </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                <h2 className="text-base font-semibold text-gray-900 mb-3">Quick Links</h2>
                <div className="space-y-2">
                    <Link
                        href="/events"
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition text-sm text-gray-600 hover:text-gray-900"
                    >
                        <MapPin className="w-4 h-4 text-[var(--primary-color)]" />
                        <span>Find Local Events</span>
                    </Link>
                    <Link
                        href="/groups"
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition text-sm text-gray-600 hover:text-gray-900"
                    >
                        <UsersRound className="w-4 h-4 text-[var(--primary-color)]" />
                        <span>Join Groups</span>
                    </Link>
                    <Link
                        href="/marketplace"
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition text-sm text-gray-600 hover:text-gray-900"
                    >
                        <BriefcaseConveyorBelt className="w-4 h-4 text-[var(--primary-color)]" />
                        <span>Browse Marketplace</span>
                    </Link>
                </div>
            </div>
        </aside>
    );
}
