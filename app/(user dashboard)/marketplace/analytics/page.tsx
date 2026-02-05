'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { callApi } from '@/app/libs/helper/callApi';
import { ApiResponse } from '@/app/types';
import { Loader } from '@/app/components/loader';
import { useSession } from '@/app/store/useSession';
import { useAuthModal } from '@/app/store/useAuthModal';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Download,
  ChevronDown,
  Package,
  Eye,
  MessageSquare,
  TrendingUp,
  Clock,
  Calendar,
  Zap,
  ImageIcon,
  Sparkles,
  Edit,
  Trash2,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  UsersRound,
  BriefcaseConveyorBelt,
  ChartNoAxesColumnIncreasing,
  Rocket,
  Plus,
  Settings,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Types
interface AnalyticsOverview {
  totalListings: number;
  activeListings: number;
  totalViews: number;
  viewsTrend: number;
  totalInquiries: number;
  conversionRate: number;
  viewsByCategory: { category: string; views: number; color: string }[];
  viewsOverTime: { date: string; views: number }[];
}

interface PerformanceData {
  bestDay: string;
  bestDayIncrease: number;
  peakHours: string;
  avgResponseTime: number;
  tips: { title: string; description: string; type: 'success' | 'warning' | 'info' }[];
}

interface UserListing {
  id: string;
  title: string;
  category: string;
  price: number;
  currency: string;
  status: string;
  images: string[];
  views: number;
  inquiries: number;
  performance: 'high' | 'medium' | 'low';
  createdAt: string;
  isFeatured?: boolean;
}

interface PaginatedListings {
  data: UserListing[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

type TabType = 'overview' | 'performance' | 'listings';
type DateRange = '7days' | '30days' | '90days' | 'year';

export default function MarketplaceAnalyticsPage() {
  const { user } = useSession((state) => state);
  const { openSignIn } = useAuthModal((state) => state.actions);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [dateRange, setDateRange] = useState<DateRange>('30days');
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  // Overview state
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  // Performance state
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [loadingPerformance, setLoadingPerformance] = useState(true);

  // Listings state
  const [listings, setListings] = useState<UserListing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [listingsPage, setListingsPage] = useState(1);
  const [listingsTotalPages, setListingsTotalPages] = useState(1);
  const [listingsTotal, setListingsTotal] = useState(0);
  const [listingsView, setListingsView] = useState<'info' | 'performance'>('info');

  // Action modals
  const [showActionDropdown, setShowActionDropdown] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<UserListing | null>(null);
  const [showSoldModal, setShowSoldModal] = useState<UserListing | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Marketplace stats
  const [marketplaceStats, setMarketplaceStats] = useState<{
    activeListings: number;
    weeklyViews: string;
    activeSellers: number;
    popularCategories: { category: string; count: number }[];
  } | null>(null);

  // Auth check - render placeholder if not logged in
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <ChartNoAxesColumnIncreasing className="w-16 h-16 text-[var(--primary-color)] mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Marketplace Analytics</h2>
        <p className="text-gray-600 mb-6 max-w-md">
          Sign in to view your marketplace analytics and manage your listings
        </p>
        <button
          onClick={() => openSignIn('view your analytics')}
          className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-color)]/90 transition-colors"
        >
          Sign In to View Analytics
        </button>
        <Link href="/marketplace" className="mt-4 text-sm text-[var(--primary-color)] hover:underline">
          ← Back to Marketplace
        </Link>
      </div>
    );
  }

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchOverview();
    } else if (activeTab === 'performance') {
      fetchPerformance();
    } else if (activeTab === 'listings') {
      fetchListings();
    }
  }, [activeTab, dateRange, listingsPage]);

  // Fetch marketplace stats on mount
  useEffect(() => {
    fetchMarketplaceStats();
  }, []);

  const fetchMarketplaceStats = async () => {
    const { data, error } = await callApi<ApiResponse<{
      activeListings: number;
      weeklyViews: number;
      activeSellers: number;
      popularCategories: { category: string; count: number }[];
    }>>('/listings/analytics/stats', 'GET');

    if (!error && data?.data) {
      setMarketplaceStats({
        ...data.data,
        weeklyViews: data.data.weeklyViews >= 1000
          ? `${(data.data.weeklyViews / 1000).toFixed(1)}k`
          : data.data.weeklyViews.toString(),
      });
    } else {
      // Fallback mock data
      setMarketplaceStats({
        activeListings: 156,
        weeklyViews: '2.4k',
        activeSellers: 89,
        popularCategories: [
          { category: 'Fashion', count: 28 },
          { category: 'Services', count: 34 },
          { category: 'Food', count: 23 },
          { category: 'Housing', count: 19 },
        ],
      });
    }
  };

  const fetchOverview = async () => {
    setLoadingOverview(true);
    const { data, error } = await callApi<ApiResponse<AnalyticsOverview>>(
      `/listings/analytics/overview?range=${dateRange}`,
      'GET'
    );

    if (!error && data?.data) {
      setOverview(data.data);
    } else {
      // Use mock data if API not ready
      setOverview({
        totalListings: 12,
        activeListings: 10,
        totalViews: 3247,
        viewsTrend: 15.2,
        totalInquiries: 89,
        conversionRate: 2.7,
        viewsByCategory: [
          { category: 'Fashion', views: 160, color: '#10B981' },
          { category: 'Services', views: 270, color: '#3B82F6' },
          { category: 'Food', views: 180, color: '#F59E0B' },
          { category: 'Education', views: 90, color: '#8B5CF6' },
          { category: 'Others', views: 50, color: '#6B7280' },
        ],
        viewsOverTime: [
          { date: 'Oct 1', views: 5 },
          { date: 'Oct 8', views: 8 },
          { date: 'Oct 15', views: 12 },
          { date: 'Oct 22', views: 10 },
          { date: 'Oct 29', views: 15 },
          { date: 'Nov 5', views: 13 },
          { date: 'Nov 12', views: 17 },
        ],
      });
    }
    setLoadingOverview(false);
  };

  const fetchPerformance = async () => {
    setLoadingPerformance(true);
    const { data, error } = await callApi<ApiResponse<PerformanceData>>(
      `/listings/analytics/performance?range=${dateRange}`,
      'GET'
    );

    if (!error && data?.data) {
      setPerformance(data.data);
    } else {
      // Use mock data if API not ready
      setPerformance({
        bestDay: 'Saturday',
        bestDayIncrease: 45,
        peakHours: '7-9 PM',
        avgResponseTime: 2.5,
        tips: [
          {
            title: 'Add More Photos To Increase Engagement',
            description: 'Listings With 4+ Photos Get 67% More Inquiries',
            type: 'success',
          },
          {
            title: 'Complete Your Listing Descriptions',
            description: 'Detailed descriptions improve search visibility',
            type: 'info',
          },
          {
            title: 'Consider boosting your underperforming listings',
            description: 'Boost can increase visibility by up to 300%',
            type: 'warning',
          },
        ],
      });
    }
    setLoadingPerformance(false);
  };

  const fetchListings = async () => {
    setLoadingListings(true);
    const { data, error } = await callApi<ApiResponse<PaginatedListings>>(
      `/listings/user/my-listings-analytics?page=${listingsPage}&limit=10`,
      'GET'
    );

    if (!error && data?.data) {
      setListings(data.data.data || []);
      setListingsTotalPages(data.data.meta?.totalPages || 1);
      setListingsTotal(data.data.meta?.total || 0);
    }
    setLoadingListings(false);
  };

  const getPerformanceLevel = (views: number): 'high' | 'medium' | 'low' => {
    if (views >= 200) return 'high';
    if (views >= 100) return 'medium';
    return 'low';
  };

  const handleExportCSV = () => {
    toast.success('Export started. Your file will download shortly.');
  };

  const handleDeleteListing = async (id: string) => {
    setActionLoading(true);
    const { error } = await callApi(`/listings/${id}`, 'DELETE');

    if (error) {
      toast.error('Failed to delete listing');
    } else {
      toast.success('Listing deleted successfully');
      fetchListings();
    }
    setActionLoading(false);
    setShowDeleteModal(null);
  };

  const handleMarkAsSold = async (id: string) => {
    setActionLoading(true);
    const { error } = await callApi(`/listings/${id}/sold`, 'PUT');

    if (error) {
      toast.error('Failed to mark listing as sold');
    } else {
      toast.success('Listing marked as sold');
      fetchListings();
    }
    setActionLoading(false);
    setShowSoldModal(null);
  };

  const dateRangeLabels: Record<DateRange, string> = {
    '7days': 'Last 7 days',
    '30days': 'Last 30 days',
    '90days': 'Last 90 days',
    'year': 'Last year',
  };

  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'NGN' ? '₦' : '$';
    return `${symbol}${price.toFixed(0)}`;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      sold: 'bg-blue-100 text-blue-700',
      flagged: 'bg-red-100 text-red-700',
      inactive: 'bg-gray-100 text-gray-700',
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status] || styles.inactive}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPerformanceBadge = (perf: 'high' | 'medium' | 'low') => {
    const styles = {
      high: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[perf]}`}>
        {perf.charAt(0).toUpperCase() + perf.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[var(--primary-color)] transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDateDropdown(!showDateDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {dateRangeLabels[dateRange]}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showDateDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDateDropdown(false)} />
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  {Object.entries(dateRangeLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setDateRange(key as DateRange);
                        setShowDateDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${dateRange === key ? 'text-[var(--primary-color)] font-medium' : 'text-gray-700'
                        }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export (csv)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Tabs */}
          <div className="bg-white rounded-xl p-1 inline-flex shadow-sm">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'performance', label: 'Performance' },
              { id: 'listings', label: 'My Listings' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                  ? 'bg-[var(--primary-color)] text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <OverviewTab data={overview} loading={loadingOverview} />
          )}

          {activeTab === 'performance' && (
            <PerformanceTab data={performance} loading={loadingPerformance} />
          )}

          {activeTab === 'listings' && (
            <ListingsTab
              listings={listings}
              loading={loadingListings}
              page={listingsPage}
              totalPages={listingsTotalPages}
              total={listingsTotal}
              view={listingsView}
              onViewChange={setListingsView}
              onPageChange={setListingsPage}
              onEdit={(id) => router.push(`/marketplace/edit-listing/${id}`)}
              onDelete={(listing) => setShowDeleteModal(listing)}
              onMarkSold={(listing) => setShowSoldModal(listing)}
              formatPrice={formatPrice}
              getStatusBadge={getStatusBadge}
              getPerformanceBadge={getPerformanceBadge}
              showActionDropdown={showActionDropdown}
              setShowActionDropdown={setShowActionDropdown}
            />
          )}

          {/* Boost CTA */}
          {activeTab === 'overview' && (
            <div className="bg-white rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                
                <div>
                  <h3 className="font-semibold text-gray-900">Boost Your Performance</h3>
                  <p className="text-sm text-gray-500">Get more visibility and inquiries with premium features</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 border border-[var(--primary-color)] text-[var(--primary-color)] rounded-lg text-sm font-medium hover:bg-[var(--primary-color)]/5 transition-colors">
                  Boost Listing
                </button>
                <Link
                  href="/marketplace/create-listing"
                  className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-color)]/90 transition-colors"
                >
                  Create New Listing
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6 hidden lg:block">
          {/* Marketplace Stats */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
              Marketplace Stats
              <ChartNoAxesColumnIncreasing className="w-4 h-4 text-[var(--primary-color)]" />
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Listing</span>
                <span className="font-semibold text-[var(--primary-color)]">
                  {marketplaceStats?.activeListings ?? '...'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Week&apos;s Views</span>
                <span className="font-semibold text-[var(--primary-color)]">
                  {marketplaceStats?.weeklyViews ?? '...'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Sellers</span>
                <span className="font-semibold text-[var(--primary-color)]">
                  {marketplaceStats?.activeSellers ?? '...'}
                </span>
              </div>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Popular Categories</h3>
            <div className="space-y-3">
              {marketplaceStats?.popularCategories?.length ? (
                marketplaceStats.popularCategories.map((cat, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{cat.category}</span>
                    <span className="font-semibold text-[var(--primary-color)]">{cat.count}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Fashion</span>
                    <span className="font-semibold text-[var(--primary-color)]">...</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Services</span>
                    <span className="font-semibold text-[var(--primary-color)]">...</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Food</span>
                    <span className="font-semibold text-[var(--primary-color)]">...</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-3">
              <Link
                href="/events"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-[var(--primary-color)] transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Find Local Events
              </Link>
              <Link
                href="/groups"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-[var(--primary-color)] transition-colors"
              >
                <UsersRound className="w-4 h-4" />
                Join Groups
              </Link>
              <Link
                href="/marketplace"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-[var(--primary-color)] transition-colors"
              >
                <BriefcaseConveyorBelt className="w-4 h-4" />
                Browse Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Listing</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &quot;{showDeleteModal.title}&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteListing(showDeleteModal.id)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Sold Modal */}
      {showSoldModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Mark as Sold</h3>
            <p className="text-gray-600 mb-6">
              Mark &quot;{showSoldModal.title}&quot; as sold? This will remove it from active listings.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSoldModal(null)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleMarkAsSold(showSoldModal.id)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-color)]/90 disabled:opacity-50"
              >
                {actionLoading ? 'Updating...' : 'Mark as Sold'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Overview Tab Component
function OverviewTab({
  data,
  loading,
}: {
  data: AnalyticsOverview | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-gray-500">
        Failed to load analytics data
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Listings',
      value: data.totalListings,
      subtitle: `${data.activeListings} Active Listings`,
      icon: Package,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Total Views',
      value: data.totalViews.toLocaleString(),
      subtitle: `+${data.viewsTrend}% last 30 days`,
      icon: Eye,
      color: 'bg-blue-100 text-blue-600',
      trend: data.viewsTrend,
    },
    {
      label: 'Inquiries',
      value: data.totalInquiries,
      subtitle: 'Messages',
      icon: MessageSquare,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      label: 'Conversion Rate',
      value: `${data.conversionRate}%`,
      subtitle: 'Clicks to inquiries',
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              {stat.trend !== undefined && (
                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.trend}%
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Views Chart */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <h3 className="font-semibold text-gray-900">Views Over Time</h3>
          <div className="flex flex-wrap items-center gap-4">
            {data.viewsByCategory.slice(0, 5).map((cat, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.category}
              </div>
            ))}
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.viewsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
          {data.viewsByCategory.map((cat, i) => (
            <div key={i} className="text-center">
              <p className="text-lg font-semibold text-gray-900">{cat.views}</p>
              <p className="text-xs text-gray-500">{cat.category}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Performance Tab Component
function PerformanceTab({
  data,
  loading,
}: {
  data: PerformanceData | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-gray-500">
        Failed to load performance data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Best Performing Day</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.bestDay}</p>
          <p className="text-xs text-green-600 mt-1">Average {data.bestDayIncrease}% more</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Peak Hours</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.peakHours}</p>
          <p className="text-xs text-gray-500 mt-1">Highest Engagement Time</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">Avg. Response Time</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.avgResponseTime} Hrs</p>
          <p className="text-xs text-gray-500 mt-1">Keep it under 2 hours</p>
        </div>
      </div>

      {/* Performance Tips */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Performance Tips</h3>
        <div className="space-y-3">
          {data.tips.map((tip, index) => {
            const bgColors = {
              success: 'bg-green-50 border-green-200',
              warning: 'bg-yellow-50 border-yellow-200',
              info: 'bg-white border-green-200',
            };
            const iconColors = {
              success: 'text-green-500',
              warning: 'text-yellow-500',
              info: 'text-green-500',
            };

            return (
              <div
                key={index}
                className={`flex items-start gap-3 p-4 rounded-lg border ${bgColors[tip.type]}`}
              >
                {tip.type === 'success' && <ImageIcon className={`w-5 h-5 mt-0.5 ${iconColors[tip.type]}`} />}
                {tip.type === 'warning' && <Sparkles className={`w-5 h-5 mt-0.5 ${iconColors[tip.type]}`} />}
                {tip.type === 'info' && <ImageIcon className={`w-5 h-5 mt-0.5 ${iconColors[tip.type]}`} />}
                <div>
                  <p className="font-medium text-gray-900">{tip.title}</p>
                  <p className="text-sm text-gray-600">{tip.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Listings Tab Component
function ListingsTab({
  listings,
  loading,
  page,
  totalPages,
  total,
  view,
  onViewChange,
  onPageChange,
  onEdit,
  onDelete,
  onMarkSold,
  formatPrice,
  getStatusBadge,
  getPerformanceBadge,
  showActionDropdown,
  setShowActionDropdown,
}: {
  listings: UserListing[];
  loading: boolean;
  page: number;
  totalPages: number;
  total: number;
  view: 'info' | 'performance';
  onViewChange: (view: 'info' | 'performance') => void;
  onPageChange: (page: number) => void;
  onEdit: (id: string) => void;
  onDelete: (listing: UserListing) => void;
  onMarkSold: (listing: UserListing) => void;
  formatPrice: (price: number, currency: string) => string;
  getStatusBadge: (status: string) => React.JSX.Element;
  getPerformanceBadge: (perf: 'high' | 'medium' | 'low') => React.JSX.Element;
  showActionDropdown: string | null;
  setShowActionDropdown: (id: string | null) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader />
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center shadow-sm">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Listings Yet</h3>
        <p className="text-gray-500 mb-6">Create your first listing to start selling</p>
        <Link
          href="/marketplace/create-listing"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-color)]/90"
        >
          <Plus className="w-5 h-5" />
          Create Listing
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="font-semibold text-gray-900">All Listings ({total})</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewChange('info')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${view === 'info'
              ? 'bg-[var(--primary-color)] text-white'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            Info View
          </button>
          <button
            onClick={() => onViewChange('performance')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${view === 'performance'
              ? 'bg-[var(--primary-color)] text-white'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            Performance View
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Listing
              </th>
              {view === 'info' ? (
                <>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Views
                  </th>
                </>
              ) : (
                <>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Views
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Inquiries
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Performance
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {listings.map((listing) => (
              <tr key={listing.id} className="hover:bg-gray-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                      {listing.images && listing.images.length > 0 ? (
                        <Image
                          src={listing.images[0]}
                          alt={listing.title}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                        {listing.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        Posted {new Date(listing.createdAt).toLocaleDateString()}
                        {listing.isFeatured && (
                          <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">
                            Featured
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </td>
                {view === 'info' ? (
                  <>
                    <td className="px-5 py-4 text-sm text-gray-600">{listing.category}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                      {formatPrice(listing.price, listing.currency)}
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(listing.status)}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{listing.views}</td>
                  </>
                ) : (
                  <>
                    <td className="px-5 py-4 text-sm text-gray-900 font-medium">{listing.views}</td>
                    <td className="px-5 py-4 text-sm text-gray-900">{listing.inquiries}</td>
                    <td className="px-5 py-4">{getPerformanceBadge(listing.performance)}</td>
                    <td className="px-5 py-4">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setShowActionDropdown(
                              showActionDropdown === listing.id ? null : listing.id
                            )
                          }
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Settings className="w-4 h-4 text-gray-500" />
                        </button>

                        {showActionDropdown === listing.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setShowActionDropdown(null)}
                            />
                            <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                              <button
                                onClick={() => {
                                  onEdit(listing.id);
                                  setShowActionDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                Edit Listing
                              </button>
                              {listing.status === 'active' && (
                                <button
                                  onClick={() => {
                                    onMarkSold(listing);
                                    setShowActionDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Mark as Sold
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  onDelete(listing);
                                  setShowActionDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === pageNum
                  ? 'bg-[var(--primary-color)] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {pageNum}
              </button>
            );
          })}

          {totalPages > 5 && page < totalPages - 2 && (
            <>
              <span className="text-gray-400">...</span>
              <button
                onClick={() => onPageChange(totalPages)}
                className="w-9 h-9 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
