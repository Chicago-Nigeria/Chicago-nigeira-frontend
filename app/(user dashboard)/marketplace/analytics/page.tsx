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
  inquiriesTrend: number;
  conversionRate: number;
  conversionTrend: number;
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
        inquiriesTrend: 8.5,
        conversionRate: 2.7,
        conversionTrend: 5.3,
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
    try {
      const csvRows: string[] = [];

      // Header with export date
      csvRows.push(`Marketplace Analytics Export - ${new Date().toLocaleDateString()}`);
      csvRows.push(`Date Range: ${dateRangeLabels[dateRange]}`);
      csvRows.push('');

      // Overview Section
      if (overview) {
        csvRows.push('=== OVERVIEW ===');
        csvRows.push('Metric,Value,Trend');
        csvRows.push(`Total Listings,${overview.totalListings},`);
        csvRows.push(`Active Listings,${overview.activeListings},`);
        csvRows.push(`Total Views,${overview.totalViews},${overview.viewsTrend}%`);
        csvRows.push(`Total Inquiries,${overview.totalInquiries},${overview.inquiriesTrend}%`);
        csvRows.push(`Conversion Rate,${overview.conversionRate}%,${overview.conversionTrend}%`);
        csvRows.push('');

        // Views by Category
        csvRows.push('=== VIEWS BY CATEGORY ===');
        csvRows.push('Category,Views');
        overview.viewsByCategory.forEach(cat => {
          csvRows.push(`${cat.category},${cat.views}`);
        });
        csvRows.push('');

        // Views Over Time
        csvRows.push('=== VIEWS OVER TIME ===');
        csvRows.push('Date,Views');
        overview.viewsOverTime.forEach(item => {
          csvRows.push(`${item.date},${item.views}`);
        });
        csvRows.push('');
      }

      // Performance Section
      if (performance) {
        csvRows.push('=== PERFORMANCE ===');
        csvRows.push('Metric,Value');
        csvRows.push(`Best Performing Day,${performance.bestDay}`);
        csvRows.push(`Best Day Increase,${performance.bestDayIncrease}%`);
        csvRows.push(`Peak Hours,${performance.peakHours}`);
        csvRows.push(`Average Response Time,${performance.avgResponseTime} hours`);
        csvRows.push('');
      }

      // Listings Section
      if (listings.length > 0) {
        csvRows.push('=== MY LISTINGS ===');
        csvRows.push('Title,Category,Price,Currency,Status,Views,Inquiries,Performance,Created At');
        listings.forEach(listing => {
          csvRows.push(`"${listing.title.replace(/"/g, '""')}",${listing.category},${listing.price},${listing.currency},${listing.status},${listing.views},${listing.inquiries},${listing.performance},${new Date(listing.createdAt).toLocaleDateString()}`);
        });
      }

      // Create CSV content
      const csvContent = csvRows.join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `marketplace-analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Analytics exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export analytics. Please try again.');
    }
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
      label: `${data.totalListings} ${data.totalListings === 1 ? 'Listing' : 'Listings'}`,
      subtitle: `${data.activeListings} Active`,
      icon: Package,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: `${data.totalViews.toLocaleString()} ${data.totalViews === 1 ? 'View' : 'Views'}`,
      subtitle: `${data.viewsTrend >= 0 ? '+' : ''}${data.viewsTrend}% from last period`,
      icon: Eye,
      color: 'bg-blue-100 text-blue-600',
      trend: data.viewsTrend,
    },
    {
      label: `${data.totalInquiries} ${data.totalInquiries === 1 ? 'Message' : 'Messages'}`,
      subtitle: `${data.inquiriesTrend >= 0 ? '+' : ''}${data.inquiriesTrend}% from last period`,
      icon: MessageSquare,
      color: 'bg-orange-100 text-orange-600',
      trend: data.inquiriesTrend,
    },
    {
      label: `${data.conversionRate}% Conversion`,
      subtitle: `${data.conversionTrend >= 0 ? '+' : ''}${data.conversionTrend}% from last period`,
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
      trend: data.conversionTrend,
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
                <span className={`text-xs font-medium flex items-center gap-1 ${stat.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp className={`w-3 h-3 ${stat.trend < 0 ? 'rotate-180' : ''}`} />
                  {Math.abs(stat.trend)}%
                </span>
              )}
            </div>
            <p className="font-bold text-gray-900">{stat.label}</p>
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
          <p className="text-xl font-bold text-gray-900">{data.bestDay}</p>
          <p className="text-xs text-green-600 mt-1">Average {data.bestDayIncrease}% more</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Peak Hours</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{data.peakHours}</p>
          <p className="text-xs text-gray-500 mt-1">Highest Engagement Time</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">Avg. Response Time</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{data.avgResponseTime} Hrs</p>
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
    <div className="bg-white rounded-xl shadow-sm max-w-[700px]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="font-semibold text-gray-900">All Listings ({total})</h3>
      </div>

      {/* Horizontally Scrollable Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap sticky left-0 bg-gray-50 z-10">
                Listing
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Views
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Inquiries
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Performance
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {listings.map((listing) => (
              <tr key={listing.id} className="hover:bg-gray-50">
                {/* Listing - Sticky Column */}
                <td className="px-4 py-4 sticky left-0 bg-white hover:bg-gray-50 z-10">
                  <Link href={`/marketplace/${listing.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
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
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[150px] hover:text-[var(--primary-color)] transition-colors">
                        {listing.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(listing.createdAt).toLocaleDateString()}
                        {listing.isFeatured && (
                          <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">
                            Featured
                          </span>
                        )}
                      </p>
                    </div>
                  </Link>
                </td>
                {/* Category */}
                <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">{listing.category}</td>
                {/* Price */}
                <td className="px-4 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                  {formatPrice(listing.price, listing.currency)}
                </td>
                {/* Status */}
                <td className="px-4 py-4 whitespace-nowrap">{getStatusBadge(listing.status)}</td>
                {/* Views */}
                <td className="px-4 py-4 text-sm text-gray-900 font-medium whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-gray-400" />
                    {listing.views}
                  </div>
                </td>
                {/* Inquiries */}
                <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                    {listing.inquiries}
                  </div>
                </td>
                {/* Performance */}
                <td className="px-4 py-4 whitespace-nowrap">{getPerformanceBadge(listing.performance)}</td>
                {/* Actions */}
                <td className="px-4 py-4 whitespace-nowrap overflow-visible">
                  <div className="dropdown-container" style={{ position: 'static' }}>
                    <button
                      id={`action-btn-${listing.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowActionDropdown(
                          showActionDropdown === listing.id ? null : listing.id
                        );
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions Dropdown - Rendered outside table for proper visibility */}
      {showActionDropdown && (() => {
        const buttonEl = document.getElementById(`action-btn-${showActionDropdown}`);
        const rect = buttonEl?.getBoundingClientRect();
        return (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowActionDropdown(null)} />
            <div
              className="fixed z-50 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1"
              style={{
                top: rect ? `${rect.bottom + 4}px` : '50%',
                left: rect ? `${rect.right - 176}px` : '50%',
              }}
            >
              <button
                onClick={() => {
                  const listing = listings.find(l => l.id === showActionDropdown);
                  if (listing) onEdit(listing.id);
                  setShowActionDropdown(null);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Listing
              </button>
              {listings.find(l => l.id === showActionDropdown)?.status === 'active' && (
                <button
                  onClick={() => {
                    const listing = listings.find(l => l.id === showActionDropdown);
                    if (listing) onMarkSold(listing);
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
                  const listing = listings.find(l => l.id === showActionDropdown);
                  if (listing) onDelete(listing);
                  setShowActionDropdown(null);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </>
        );
      })()}

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
