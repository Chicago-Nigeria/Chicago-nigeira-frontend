'use client';

import { useEffect, useState } from 'react';
import { callApi } from '@/app/libs/helper/callApi';
import { ApiResponse } from '@/app/types';
import {
  Search,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CreditCard,
  Banknote,
  RefreshCw,
  ArrowRightLeft,
  Play,
  MoreVertical,
  X,
  Calendar,
  Mail,
  Phone,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Loader } from '@/app/components/loader';

interface PayoutStats {
  counts: {
    pending: number;
    paid: number;
    failed: number;
    pendingStripe: number;
    pendingManual: number;
  };
  amounts: {
    pending: number;
    paid: number;
  };
}

interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  payoutMethod: 'stripe' | 'manual';
  scheduledFor: string;
  processedAt: string | null;
  failureReason: string | null;
  stripeTransferId: string | null;
  organizer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    hasStripe: boolean;
    stripeAccountId: string | null;
  };
  event: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    ticketPrice: number;
  } | null;
  createdAt: string;
}

export default function PayoutsPage() {
  const [stats, setStats] = useState<PayoutStats | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [showPayoutModal, setShowPayoutModal] = useState<Payout | null>(null);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState<Payout | null>(null);
  const [showMigrateModal, setShowMigrateModal] = useState<Payout | null>(null);
  const [showProcessEventModal, setShowProcessEventModal] = useState<Payout | null>(null);
  const [processingAction, setProcessingAction] = useState(false);
  const [processStripeLoading, setProcessStripeLoading] = useState(false);
  const [markPaidNotes, setMarkPaidNotes] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; openUp: boolean } | null>(null);

  useEffect(() => {
    fetchStats();
    fetchPayouts();
  }, [page, search, statusFilter, methodFilter]);

  const fetchStats = async () => {
    setStatsLoading(true);
    const { data, error } = await callApi<ApiResponse<PayoutStats>>(
      '/admin/payouts/stats',
      'GET'
    );

    if (!error && data) {
      setStats(data.data || null);
    }
    setStatsLoading(false);
  };

  const fetchPayouts = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20',
      ...(search && { search }),
      ...(statusFilter !== 'all' && { status: statusFilter }),
      ...(methodFilter !== 'all' && { payoutMethod: methodFilter }),
    });

    const { data, error } = await callApi<ApiResponse<Payout[]>>(
      `/admin/payouts/detailed?${params}`,
      'GET'
    );

    if (!error && data) {
      setPayouts(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
    }
    setLoading(false);
  };

  const handleProcessStripePayouts = async () => {
    setProcessStripeLoading(true);
    const { data, error } = await callApi<ApiResponse<{
      processed: number;
      succeeded: number;
      failed: number;
      results: Array<{ payoutId: string; status: string; error?: string }>;
    }>>(
      '/admin/payouts/process-stripe',
      'POST'
    );

    if (error) {
      toast.error(error.message || 'Failed to process payouts');
    } else if (data) {
      const result = data.data;
      if (result?.processed === 0) {
        toast.info('No pending Stripe payouts to process');
      } else {
        toast.success(`Processed ${result?.processed} payouts: ${result?.succeeded} succeeded, ${result?.failed} failed`);
        fetchStats();
        fetchPayouts();
      }
    }
    setProcessStripeLoading(false);
  };

  const handleMarkAsPaid = async () => {
    if (!showMarkPaidModal) return;
    setProcessingAction(true);

    const { error } = await callApi(
      `/admin/payouts/${showMarkPaidModal.id}/mark-paid`,
      'PUT',
      { notes: markPaidNotes }
    );

    if (error) {
      toast.error(error.message || 'Failed to mark payout as paid');
    } else {
      toast.success('Payout marked as paid');
      fetchStats();
      fetchPayouts();
      setShowMarkPaidModal(null);
      setMarkPaidNotes('');
    }
    setProcessingAction(false);
  };

  const handleRetryPayout = async (payoutId: string) => {
    setProcessingAction(true);
    const { data, error } = await callApi<ApiResponse<{ transferId: string; amount: number }>>(
      `/admin/payouts/${payoutId}/retry`,
      'PUT'
    );

    if (error) {
      toast.error(error.message || 'Failed to retry payout');
    } else {
      toast.success(`Payout retried successfully. Transfer ID: ${data?.data?.transferId}`);
      fetchStats();
      fetchPayouts();
      setShowDropdown(null);
    }
    setProcessingAction(false);
  };

  const handleMigrateToStripe = async () => {
    if (!showMigrateModal) return;
    setProcessingAction(true);

    const { data, error } = await callApi<ApiResponse<{ migratedCount: number }>>(
      `/admin/payouts/migrate/${showMigrateModal.organizer.id}`,
      'PUT'
    );

    if (error) {
      toast.error(error.message || 'Failed to migrate payouts');
    } else {
      toast.success(`Migrated ${data?.data?.migratedCount} payouts to Stripe`);
      fetchStats();
      fetchPayouts();
      setShowMigrateModal(null);
    }
    setProcessingAction(false);
  };

  const handleProcessEventPayout = async () => {
    if (!showProcessEventModal?.event) return;
    setProcessingAction(true);

    const { data, error } = await callApi<ApiResponse<{
      eventTitle: string;
      processed: number;
      succeeded: number;
      failed: number;
      totalAmount: number;
    }>>(
      `/admin/payouts/process-event/${showProcessEventModal.event.id}`,
      'POST'
    );

    if (error) {
      toast.error(error.message || 'Failed to process event payout');
    } else {
      const result = data?.data;
      if (result?.succeeded && result.succeeded > 0) {
        toast.success(`Processed $${result.totalAmount.toFixed(2)} for "${result.eventTitle}"`);
      } else if (result?.failed && result.failed > 0) {
        toast.error(`Failed to process payouts for "${result.eventTitle}"`);
      }
      fetchStats();
      fetchPayouts();
      setShowProcessEventModal(null);
    }
    setProcessingAction(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getMethodBadge = (method: string) => {
    return method === 'stripe'
      ? 'bg-purple-100 text-purple-700'
      : 'bg-blue-100 text-blue-700';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isEventEnded = (payout: Payout) => {
    if (!payout.event) return true;
    const endDate = new Date(payout.event.endDate || payout.event.startDate);
    return endDate <= new Date();
  };

  const handleDropdownToggle = (payoutId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (showDropdown === payoutId) {
      setShowDropdown(null);
      setDropdownPosition(null);
      return;
    }

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const dropdownHeight = 200; // Approximate max height of dropdown
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUp = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    setDropdownPosition({
      top: openUp ? rect.top : rect.bottom + 4,
      left: rect.right - 208, // 208 = dropdown width (w-52 = 13rem = 208px)
      openUp,
    });
    setShowDropdown(payoutId);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Payout Management</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Manage organizer payouts for event ticket sales
          </p>
        </div>
        <button
          onClick={handleProcessStripePayouts}
          disabled={processStripeLoading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition shadow-sm disabled:opacity-50"
        >
          {processStripeLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          <span>Process Stripe Payouts</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        {/* Pending Payouts */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-600">Pending</p>
              <h3 className="text-lg md:text-2xl font-bold text-yellow-600 mt-1">
                {statsLoading ? '...' : stats?.counts.pending || 0}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                ${statsLoading ? '...' : stats?.amounts.pending.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="bg-yellow-50 p-2 rounded-lg">
              <Clock className="h-4 w-4 md:h-5 md:w-5 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Stripe Pending */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-600">Stripe Queue</p>
              <h3 className="text-lg md:text-2xl font-bold text-purple-600 mt-1">
                {statsLoading ? '...' : stats?.counts.pendingStripe || 0}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Ready for auto-payout</p>
            </div>
            <div className="bg-purple-50 p-2 rounded-lg">
              <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Manual Pending */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-600">Manual Queue</p>
              <h3 className="text-lg md:text-2xl font-bold text-blue-600 mt-1">
                {statsLoading ? '...' : stats?.counts.pendingManual || 0}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Requires manual transfer</p>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg">
              <Banknote className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Paid */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-600">Paid</p>
              <h3 className="text-lg md:text-2xl font-bold text-green-600 mt-1">
                {statsLoading ? '...' : stats?.counts.paid || 0}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                ${statsLoading ? '...' : stats?.amounts.paid.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="bg-green-50 p-2 rounded-lg">
              <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
            </div>
          </div>
        </div>

        {/* Failed */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-600">Failed</p>
              <h3 className="text-lg md:text-2xl font-bold text-red-600 mt-1">
                {statsLoading ? '...' : stats?.counts.failed || 0}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Requires retry</p>
            </div>
            <div className="bg-red-50 p-2 rounded-lg">
              <XCircle className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by organizer name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All Methods</option>
            <option value="stripe">Stripe (Automatic)</option>
            <option value="manual">Manual</option>
          </select>
        </div>
      </div>

      {/* Payouts Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-visible">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader />
          </div>
        ) : payouts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No payouts found
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organizer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {payout.organizer.name}
                            </div>
                            <div className="text-xs text-gray-500">{payout.organizer.email}</div>
                          </div>
                          {payout.organizer.hasStripe && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-purple-100 text-purple-700">
                              <CreditCard className="h-3 w-3 mr-0.5" />
                              Stripe
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-[200px] truncate">
                          {payout.event?.title || 'N/A'}
                        </div>
                        {payout.event && (
                          <div className="text-xs text-gray-500">
                            {formatDate(payout.event.endDate || payout.event.startDate)}
                            {!isEventEnded(payout) && (
                              <span className="ml-1 text-yellow-600">(not ended)</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          ${payout.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMethodBadge(payout.payoutMethod)}`}>
                          {payout.payoutMethod === 'stripe' ? 'Stripe' : 'Manual'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(payout.status)}`}>
                          {payout.status}
                        </span>
                        {payout.failureReason && (
                          <div className="text-xs text-red-500 mt-1 max-w-[150px] truncate" title={payout.failureReason}>
                            {payout.failureReason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payout.scheduledFor)}
                        {payout.processedAt && (
                          <div className="text-xs text-green-600">
                            Paid: {formatDate(payout.processedAt)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={(e) => handleDropdownToggle(payout.id, e)}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && payouts.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Dropdown Menu for Desktop Table */}
      {showDropdown && dropdownPosition && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setShowDropdown(null);
              setDropdownPosition(null);
            }}
          />
          <div
            className="fixed w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
            style={{
              top: dropdownPosition.openUp ? 'auto' : dropdownPosition.top,
              bottom: dropdownPosition.openUp ? window.innerHeight - dropdownPosition.top + 4 : 'auto',
              left: dropdownPosition.left,
            }}
          >
            {(() => {
              const payout = payouts.find(p => p.id === showDropdown);
              if (!payout) return null;
              return (
                <>
                  <button
                    onClick={() => {
                      setShowPayoutModal(payout);
                      setShowDropdown(null);
                      setDropdownPosition(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Details
                  </button>

                  {payout.status === 'pending' && payout.payoutMethod === 'manual' && (
                    <button
                      onClick={() => {
                        setShowMarkPaidModal(payout);
                        setShowDropdown(null);
                        setDropdownPosition(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark as Paid
                    </button>
                  )}

                  {payout.status === 'pending' && payout.payoutMethod === 'manual' && payout.organizer.hasStripe && (
                    <button
                      onClick={() => {
                        setShowMigrateModal(payout);
                        setShowDropdown(null);
                        setDropdownPosition(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-purple-600 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                      Migrate to Stripe
                    </button>
                  )}

                  {payout.status === 'pending' && payout.payoutMethod === 'stripe' && payout.event && (
                    <button
                      onClick={() => {
                        setShowProcessEventModal(payout);
                        setShowDropdown(null);
                        setDropdownPosition(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-emerald-600 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Play className="h-4 w-4" />
                      Process Event Payout
                    </button>
                  )}

                  {payout.status === 'failed' && payout.payoutMethod === 'stripe' && (
                    <button
                      onClick={() => {
                        handleRetryPayout(payout.id);
                        setDropdownPosition(null);
                      }}
                      disabled={processingAction}
                      className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Retry Payout
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        </>
      )}

      {/* Payouts Cards - Mobile/Tablet */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12 bg-white rounded-lg">
            <Loader />
          </div>
        ) : payouts.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center text-gray-500">
            No payouts found
          </div>
        ) : (
          <>
            {payouts.map((payout) => (
              <div key={payout.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-gray-900">{payout.organizer.name}</h3>
                      {payout.organizer.hasStripe && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-purple-100 text-purple-700">
                          <CreditCard className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{payout.organizer.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">${payout.amount.toFixed(2)}</p>
                  </div>
                </div>

                {payout.event && (
                  <div className="mt-2 text-sm text-gray-600 truncate">
                    {payout.event.title}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(payout.status)}`}>
                    {payout.status}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getMethodBadge(payout.payoutMethod)}`}>
                    {payout.payoutMethod === 'stripe' ? 'Stripe' : 'Manual'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Scheduled: {formatDate(payout.scheduledFor)}
                  </span>
                </div>

                {payout.failureReason && (
                  <div className="mt-2 text-xs text-red-500 bg-red-50 p-2 rounded">
                    {payout.failureReason}
                  </div>
                )}

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setShowPayoutModal(payout)}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Details
                  </button>
                  {payout.status === 'pending' && payout.payoutMethod === 'manual' && (
                    <button
                      onClick={() => setShowMarkPaidModal(payout)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
                    >
                      Mark Paid
                    </button>
                  )}
                  {payout.status === 'failed' && payout.payoutMethod === 'stripe' && (
                    <button
                      onClick={() => handleRetryPayout(payout.id)}
                      disabled={processingAction}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-orange-600 rounded hover:bg-orange-700 disabled:opacity-50"
                    >
                      Retry
                    </button>
                  )}
                  {payout.status === 'pending' && payout.payoutMethod === 'manual' && payout.organizer.hasStripe && (
                    <button
                      onClick={() => setShowMigrateModal(payout)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded hover:bg-purple-700"
                    >
                      To Stripe
                    </button>
                  )}
                  {payout.status === 'pending' && payout.payoutMethod === 'stripe' && payout.event && (
                    <button
                      onClick={() => setShowProcessEventModal(payout)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded hover:bg-emerald-700"
                    >
                      Process
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination - Mobile */}
            {payouts.length > 0 && (
              <div className="bg-white rounded-lg p-3 flex items-center justify-between">
                <p className="text-xs text-gray-600">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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

      {/* Payout Details Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Payout Details</h2>
              <button
                onClick={() => setShowPayoutModal(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Amount */}
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Payout Amount</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  ${showPayoutModal.amount.toFixed(2)}
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(showPayoutModal.status)}`}>
                    {showPayoutModal.status}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMethodBadge(showPayoutModal.payoutMethod)}`}>
                    {showPayoutModal.payoutMethod === 'stripe' ? 'Stripe' : 'Manual'}
                  </span>
                </div>
              </div>

              {/* Organizer Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Organizer</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{showPayoutModal.organizer.name}</span>
                    {showPayoutModal.organizer.hasStripe && (
                      <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                        Stripe Connected
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{showPayoutModal.organizer.email}</span>
                  </div>
                  {showPayoutModal.organizer.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{showPayoutModal.organizer.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Info */}
              {showPayoutModal.event && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Event</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-900">{showPayoutModal.event.title}</p>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Ends: {formatDate(showPayoutModal.event.endDate || showPayoutModal.event.startDate)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Ticket Price: ${showPayoutModal.event.ticketPrice?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Timeline</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-900">{formatDate(showPayoutModal.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Scheduled:</span>
                    <span className="text-gray-900">{formatDate(showPayoutModal.scheduledFor)}</span>
                  </div>
                  {showPayoutModal.processedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processed:</span>
                      <span className="text-green-600">{formatDate(showPayoutModal.processedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stripe Transfer ID */}
              {showPayoutModal.stripeTransferId && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Stripe Transfer</h3>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {showPayoutModal.stripeTransferId}
                  </code>
                </div>
              )}

              {/* Failure Reason */}
              {showPayoutModal.failureReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700 mb-1">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Failure Reason</span>
                  </div>
                  <p className="text-sm text-red-600">{showPayoutModal.failureReason}</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setShowPayoutModal(null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Paid Modal */}
      {showMarkPaidModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mark Payout as Paid</h3>
              <p className="text-sm text-gray-600 mb-4">
                Confirm that you have manually transferred <strong>${showMarkPaidModal.amount.toFixed(2)}</strong> to{' '}
                <strong>{showMarkPaidModal.organizer.name}</strong>.
              </p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium">Contact Information:</p>
                    <p>{showMarkPaidModal.organizer.email}</p>
                    {showMarkPaidModal.organizer.phone && <p>{showMarkPaidModal.organizer.phone}</p>}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={markPaidNotes}
                  onChange={(e) => setMarkPaidNotes(e.target.value)}
                  placeholder="e.g., Bank transfer reference, check number..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowMarkPaidModal(null);
                    setMarkPaidNotes('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkAsPaid}
                  disabled={processingAction}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processingAction && <Loader2 className="h-4 w-4 animate-spin" />}
                  Confirm Paid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Migrate to Stripe Modal */}
      {showMigrateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Migrate to Stripe</h3>
              <p className="text-sm text-gray-600 mb-4">
                This will migrate all pending manual payouts for <strong>{showMigrateModal.organizer.name}</strong> to use their connected Stripe account for automatic payout.
              </p>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <CreditCard className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-purple-700">
                    <p className="font-medium">Stripe Account</p>
                    <p className="text-xs">{showMigrateModal.organizer.stripeAccountId}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowMigrateModal(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMigrateToStripe}
                  disabled={processingAction}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processingAction && <Loader2 className="h-4 w-4 animate-spin" />}
                  Migrate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Process Event Payout Modal */}
      {showProcessEventModal && showProcessEventModal.event && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Process Event Payout</h3>
              <p className="text-sm text-gray-600 mb-4">
                Process all pending Stripe payouts for this event. The funds will be transferred to the organizer's connected Stripe account.
              </p>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-emerald-700 uppercase">Event</p>
                  <p className="text-sm text-emerald-900 font-medium">{showProcessEventModal.event.title}</p>
                </div>
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs font-medium text-emerald-700 uppercase">Organizer</p>
                    <p className="text-sm text-emerald-900">{showProcessEventModal.organizer.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-emerald-700 uppercase">Amount</p>
                    <p className="text-sm text-emerald-900 font-bold">${showProcessEventModal.amount.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-emerald-200">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs text-emerald-700">Stripe Connected</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-700">
                    This will immediately transfer funds to the organizer. Make sure the event has ended before processing.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowProcessEventModal(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessEventPayout}
                  disabled={processingAction}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processingAction && <Loader2 className="h-4 w-4 animate-spin" />}
                  Process Payout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
