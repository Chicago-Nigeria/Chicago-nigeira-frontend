'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { callApi } from '@/app/libs/helper/callApi';
import { ApiResponse } from '@/app/types';
import { Loader } from '@/app/components/loader';
import {
  Package,
  Search,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Flag,
  Eye,
  MoreVertical,
  MapPin,
  User,
  Calendar,
  Tag,
  Phone,
  Mail,
  MessageCircle,
  DollarSign,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  priceType: string;
  category: string;
  condition: string;
  status: string;
  images: string[];
  location: string;
  tags: string[];
  phoneNumber?: string;
  email?: string;
  whatsappNumber?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  flagReason?: string;
  createdAt: string;
  seller: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    photo?: string;
  };
  _count: {
    likes: number;
    saves: number;
    comments: number;
  };
}

interface PaginatedResponse {
  data: Listing[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function MarketplaceAdminPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [dropdownStyle, setDropdownStyle] = useState<{ top?: number; bottom?: number; right: number }>({ right: 0 });
  const [showDetailsModal, setShowDetailsModal] = useState<Listing | null>(null);
  const [showApproveModal, setShowApproveModal] = useState<Listing | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<Listing | null>(null);
  const [showFlagModal, setShowFlagModal] = useState<Listing | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<Listing | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [flagReason, setFlagReason] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchListings();
  }, [page, statusFilter]);

  const fetchListings = async () => {
    setLoading(true);
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: '20',
      ...(statusFilter && { status: statusFilter }),
      ...(searchQuery && { search: searchQuery }),
    });

    const { data, error } = await callApi<ApiResponse<PaginatedResponse>>(
      `/admin/listings?${queryParams}`,
      'GET'
    );

    if (!error && data) {
      setListings(data.data?.data || []);
      setTotalPages(data.data?.meta.totalPages || 1);
      setTotal(data.data?.meta.total || 0);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    setPage(1);
    fetchListings();
  };

  const handleViewDetails = async (listingId: string) => {
    setShowDropdown(null);
    const { data, error } = await callApi<ApiResponse<Listing>>(
      `/admin/listings/${listingId}`,
      'GET'
    );

    if (!error && data) {
      setShowDetailsModal(data.data || null);
      setSelectedImageIndex(0);
    } else {
      toast.error('Failed to load listing details');
    }
  };

  const handleApproveListing = async (id: string) => {
    const { error } = await callApi(`/admin/listings/${id}/approve`, 'PUT');

    if (error) {
      toast.error('Failed to approve listing');
      return;
    }

    toast.success('Listing approved successfully');
    fetchListings();
    setShowApproveModal(null);
    setShowDetailsModal(null);
  };

  const handleRejectListing = async (id: string) => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    const { error } = await callApi(`/admin/listings/${id}/reject`, 'PUT', { reason: rejectReason });

    if (error) {
      toast.error('Failed to reject listing');
      return;
    }

    toast.success('Listing rejected');
    setRejectReason('');
    fetchListings();
    setShowRejectModal(null);
    setShowDetailsModal(null);
  };

  const handleFlagListing = async (id: string) => {
    if (!flagReason.trim()) {
      toast.error('Please provide a reason for flagging');
      return;
    }

    const { error } = await callApi(`/admin/listings/${id}/flag`, 'PUT', { reason: flagReason });

    if (error) {
      toast.error('Failed to flag listing');
      return;
    }

    toast.success('Listing flagged successfully');
    setFlagReason('');
    fetchListings();
    setShowFlagModal(null);
    setShowDetailsModal(null);
  };

  const handleDeleteListing = async (id: string) => {
    const { error } = await callApi(`/admin/listings/${id}`, 'DELETE', { reason: deleteReason || 'Deleted by admin' });

    if (error) {
      toast.error('Failed to delete listing');
      return;
    }

    toast.success('Listing deleted successfully');
    setDeleteReason('');
    fetchListings();
    setShowDeleteModal(null);
    setShowDetailsModal(null);
  };

  const handleDropdownToggle = (listingId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (showDropdown === listingId) {
      setShowDropdown(null);
      return;
    }

    const button = event.currentTarget;
    const buttonRect = button.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const dropdownHeight = 200;

    const right = viewportWidth - buttonRect.right;

    if (viewportHeight - buttonRect.bottom >= dropdownHeight) {
      setDropdownStyle({ top: buttonRect.bottom + 8, right });
    } else {
      setDropdownStyle({ bottom: viewportHeight - buttonRect.top + 8, right });
    }

    setShowDropdown(listingId);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      sold: 'bg-blue-100 text-blue-800',
      flagged: 'bg-red-100 text-red-800',
      rejected: 'bg-orange-100 text-orange-800',
      inactive: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.inactive}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      new: 'New',
      'like-new': 'Used - Like New',
      good: 'Used - Good',
      fair: 'Used - Fair',
    };
    return labels[condition] || condition;
  };

  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'NGN' ? '₦' : '$';
    return `${symbol}${price.toFixed(2)}`;
  };

  // Stats
  const pendingCount = listings.filter(l => l.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketplace Management</h1>
          <p className="text-gray-600 mt-1">
            Review and manage marketplace listings
          </p>
        </div>

        {/* Stats Card */}
        <div className="bg-yellow-600 text-white rounded-lg p-4 min-w-[180px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pending Review</p>
              <h3 className="text-2xl font-bold mt-1">{pendingCount}</h3>
            </div>
            <div className="bg-yellow-500 p-2 rounded-lg">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-yellow-100 mt-2">
            {total} total listings
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="flagged">Flagged</option>
              <option value="rejected">Rejected</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
          >
            Search
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {listings.length} of {total} listings
        </div>
      </div>

      {/* Listings Table - Desktop */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-visible">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Listing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seller
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Engagement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {listings.length > 0 ? (
                  listings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                            {listing.images && listing.images.length > 0 ? (
                              <Image
                                src={listing.images[0]}
                                alt={listing.title}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                              {listing.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">
                              {listing.location || 'No location'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900">
                          {listing.seller.firstName} {listing.seller.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{listing.seller.email}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-semibold text-emerald-600">
                          {formatPrice(listing.price, listing.currency)}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{listing.priceType}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900">{listing.category}</p>
                        <p className="text-xs text-gray-500">{getConditionLabel(listing.condition)}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(listing.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span title="Likes">❤️ {listing._count.likes}</span>
                          <span title="Saves">💾 {listing._count.saves}</span>
                          <span title="Comments">💬 {listing._count.comments}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="relative">
                          <button
                            onClick={(e) => handleDropdownToggle(listing.id, e)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>

                          {showDropdown === listing.id && (
                            <>
                              <div
                                className="fixed inset-0 z-[100]"
                                onClick={() => setShowDropdown(null)}
                              />
                              <div
                                className="fixed w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[101]"
                                style={{
                                  ...(dropdownStyle.top !== undefined && { top: dropdownStyle.top }),
                                  ...(dropdownStyle.bottom !== undefined && { bottom: dropdownStyle.bottom }),
                                  right: dropdownStyle.right,
                                }}
                              >
                                <button
                                  onClick={() => handleViewDetails(listing.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  View Details
                                </button>
                                {listing.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => { setShowApproveModal(listing); setShowDropdown(null); }}
                                      className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <Check className="h-4 w-4" />
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => { setShowRejectModal(listing); setShowDropdown(null); }}
                                      className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <X className="h-4 w-4" />
                                      Reject
                                    </button>
                                  </>
                                )}
                                {listing.status !== 'flagged' && (
                                  <button
                                    onClick={() => { setShowFlagModal(listing); setShowDropdown(null); }}
                                    className="w-full px-4 py-2 text-left text-sm text-yellow-600 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Flag className="h-4 w-4" />
                                    Flag
                                  </button>
                                )}
                                <button
                                  onClick={() => { setShowDeleteModal(listing); setShowDropdown(null); }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No listings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination - Desktop */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Listings Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12 bg-white rounded-lg">
            <Loader />
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center text-gray-500">
            No listings found
          </div>
        ) : (
          <>
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                    {listing.images && listing.images.length > 0 ? (
                      <Image
                        src={listing.images[0]}
                        alt={listing.title}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {listing.title}
                      </h3>
                      <button
                        onClick={(e) => handleDropdownToggle(listing.id, e)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded flex-shrink-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-lg font-bold text-emerald-600 mt-1">
                      {formatPrice(listing.price, listing.currency)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {getStatusBadge(listing.status)}
                  <span className="text-xs text-gray-500">{listing.category}</span>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <User className="h-3.5 w-3.5" />
                    {listing.seller.firstName} {listing.seller.lastName}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Dropdown for mobile */}
                {showDropdown === listing.id && (
                  <>
                    <div className="fixed inset-0 z-[100]" onClick={() => setShowDropdown(null)} />
                    <div
                      className="fixed w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1.5 z-[101]"
                      style={{
                        ...(dropdownStyle.top !== undefined && { top: dropdownStyle.top }),
                        ...(dropdownStyle.bottom !== undefined && { bottom: dropdownStyle.bottom }),
                        right: dropdownStyle.right,
                      }}
                    >
                      <button
                        onClick={() => handleViewDetails(listing.id)}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                      {listing.status === 'pending' && (
                        <>
                          <button
                            onClick={() => { setShowApproveModal(listing); setShowDropdown(null); }}
                            className="w-full px-3 py-2 text-left text-sm text-green-600 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Check className="h-4 w-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => { setShowRejectModal(listing); setShowDropdown(null); }}
                            className="w-full px-3 py-2 text-left text-sm text-orange-600 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <X className="h-4 w-4" />
                            Reject
                          </button>
                        </>
                      )}
                      {listing.status !== 'flagged' && (
                        <button
                          onClick={() => { setShowFlagModal(listing); setShowDropdown(null); }}
                          className="w-full px-3 py-2 text-left text-sm text-yellow-600 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Flag className="h-4 w-4" />
                          Flag
                        </button>
                      )}
                      <button
                        onClick={() => { setShowDeleteModal(listing); setShowDropdown(null); }}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Pagination - Mobile */}
            {totalPages > 1 && (
              <div className="bg-white rounded-lg p-3 flex items-center justify-between">
                <p className="text-xs text-gray-600">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-900">Listing Details</h2>
              <button
                onClick={() => setShowDetailsModal(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Images Gallery */}
              {showDetailsModal.images && showDetailsModal.images.length > 0 && (
                <div>
                  <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={showDetailsModal.images[selectedImageIndex]}
                      alt={showDetailsModal.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {showDetailsModal.images.length > 1 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                      {showDetailsModal.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                            selectedImageIndex === index
                              ? 'border-emerald-500'
                              : 'border-transparent'
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={image}
                            alt={`${showDetailsModal.title} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Basic Info */}
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{showDetailsModal.title}</h3>
                  {getStatusBadge(showDetailsModal.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">Price:</span>
                      <span className="text-lg font-bold text-emerald-600">
                        {formatPrice(showDetailsModal.price, showDetailsModal.currency)}
                      </span>
                      <span className="text-sm text-gray-500 capitalize">({showDetailsModal.priceType})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">Category:</span>
                      <span className="text-gray-900">{showDetailsModal.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">Condition:</span>
                      <span className="text-gray-900">{getConditionLabel(showDetailsModal.condition)}</span>
                    </div>
                    {showDetailsModal.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">Location:</span>
                        <span className="text-gray-900">{showDetailsModal.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">Created:</span>
                      <span className="text-gray-900">
                        {new Date(showDetailsModal.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span>❤️ {showDetailsModal._count.likes} likes</span>
                      <span>💾 {showDetailsModal._count.saves} saves</span>
                      <span>💬 {showDetailsModal._count.comments} comments</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{showDetailsModal.description}</p>
              </div>

              {/* Tags */}
              {showDetailsModal.tags && showDetailsModal.tags.length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {showDetailsModal.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              {(showDetailsModal.phoneNumber || showDetailsModal.email || showDetailsModal.whatsappNumber) && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {showDetailsModal.phoneNumber && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{showDetailsModal.phoneNumber}</span>
                      </div>
                    )}
                    {showDetailsModal.email && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{showDetailsModal.email}</span>
                      </div>
                    )}
                    {showDetailsModal.whatsappNumber && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <MessageCircle className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{showDetailsModal.whatsappNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Seller Info */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Seller Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    {showDetailsModal.seller.photo ? (
                      <Image
                        src={showDetailsModal.seller.photo}
                        alt={showDetailsModal.seller.firstName}
                        width={48}
                        height={48}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {showDetailsModal.seller.firstName} {showDetailsModal.seller.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{showDetailsModal.seller.email}</p>
                    {showDetailsModal.seller.phone && (
                      <p className="text-sm text-gray-600">{showDetailsModal.seller.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Flag Reason (if flagged) */}
              {showDetailsModal.status === 'flagged' && showDetailsModal.flagReason && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="text-red-800 font-semibold mb-1">Flag Reason</h4>
                    <p className="text-red-700">{showDetailsModal.flagReason}</p>
                    {showDetailsModal.reviewedAt && (
                      <p className="text-red-600 text-sm mt-2">
                        Flagged on {new Date(showDetailsModal.reviewedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex flex-wrap gap-3 justify-end">
              <button
                onClick={() => setShowDetailsModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              >
                Close
              </button>
              {showDetailsModal.status === 'pending' && (
                <>
                  <button
                    onClick={() => setShowRejectModal(showDetailsModal)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 font-medium flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => setShowApproveModal(showDetailsModal)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </button>
                </>
              )}
              {showDetailsModal.status !== 'flagged' && (
                <button
                  onClick={() => setShowFlagModal(showDetailsModal)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 font-medium flex items-center gap-2"
                >
                  <Flag className="h-4 w-4" />
                  Flag
                </button>
              )}
              <button
                onClick={() => setShowDeleteModal(showDetailsModal)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Approve Listing</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to approve &quot;{showApproveModal.title}&quot;? The listing will be visible to all users.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowApproveModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApproveListing(showApproveModal.id)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Listing</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting &quot;{showRejectModal.title}&quot;.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowRejectModal(null); setRejectReason(''); }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectListing(showRejectModal.id)}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flag Modal */}
      {showFlagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Flag Listing</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for flagging &quot;{showFlagModal.title}&quot;.
            </p>
            <textarea
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="Enter flag reason..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              rows={3}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowFlagModal(null); setFlagReason(''); }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleFlagListing(showFlagModal.id)}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                Flag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Listing</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete &quot;{showDeleteModal.title}&quot;? This action cannot be undone.
            </p>
            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Enter reason (optional)..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={2}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowDeleteModal(null); setDeleteReason(''); }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteListing(showDeleteModal.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
