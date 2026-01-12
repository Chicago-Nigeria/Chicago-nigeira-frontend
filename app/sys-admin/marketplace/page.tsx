'use client';

import { useEffect, useState } from 'react';
import { callApi } from '@/app/libs/helper/callApi';
import { ApiResponse } from '@/app/types';
import { Loader } from '@/app/components/loader';
import { Package, Search, ChevronLeft, ChevronRight, Check, X, Flag } from 'lucide-react';
import { toast } from 'sonner';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  status: string;
  images: string[];
  createdAt: string;
  seller: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
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

  const handleApproveListing = async (id: string) => {
    const { error } = await callApi(`/admin/listings/${id}/approve`, 'PUT');

    if (error) {
      toast.error('Failed to approve listing');
      return;
    }

    toast.success('Listing approved successfully');
    fetchListings();
  };

  const handleFlagListing = async (id: string) => {
    const reason = prompt('Enter reason for flagging this listing:');
    if (!reason) return;

    const { error } = await callApi(`/admin/listings/${id}/flag`, 'PUT', { reason });

    if (error) {
      toast.error('Failed to flag listing');
      return;
    }

    toast.success('Listing flagged successfully');
    fetchListings();
  };

  const handleDeleteListing = async (id: string) => {
    const reason = prompt('Enter reason for deleting this listing:');
    if (!reason) return;

    if (!confirm('Are you sure you want to delete this listing?')) return;

    const { error } = await callApi(`/admin/listings/${id}`, 'DELETE', { reason });

    if (error) {
      toast.error('Failed to delete listing');
      return;
    }

    toast.success('Listing deleted successfully');
    fetchListings();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      sold: 'bg-blue-100 text-blue-800',
      flagged: 'bg-red-100 text-red-800',
      inactive: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles] || styles.inactive}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketplace Management</h1>
        <p className="text-gray-600 mt-1">
          Review and manage marketplace listings
        </p>
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
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
              <option value="flagged">Flagged</option>
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

      {/* Listings Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {listings.length > 0 ? (
            listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition"
              >
                <div className="aspect-video bg-gray-200 relative">
                  {listing.images && listing.images.length > 0 ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(listing.status)}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">
                    {listing.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {listing.description}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-emerald-600">
                      ${listing.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500">{listing.category}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>By {listing.seller.firstName} {listing.seller.lastName}</span>
                    <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <span>❤️ {listing._count.likes}</span>
                    <span>💾 {listing._count.saves}</span>
                    <span>💬 {listing._count.comments}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {listing.status === 'pending' && (
                      <button
                        onClick={() => handleApproveListing(listing.id)}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </button>
                    )}
                    {listing.status !== 'flagged' && (
                      <button
                        onClick={() => handleFlagListing(listing.id)}
                        className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <Flag className="h-4 w-4" />
                        Flag
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteListing(listing.id)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <X className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              No listings found
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </div>
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
  );
}
