'use client';

import { useEffect, useState } from 'react';
import { callApi } from '@/app/libs/helper/callApi';
import { Search, Loader2, CheckCircle, XCircle, AlertCircle, Eye, MoreVertical, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Loader } from '@/app/components/loader';

interface SocialSubscription {
    id: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        photo?: string;
    };
    businessName: string;
    businessType: string;
    status: string;
    uiStatus?: string;
    amount: number;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    contactEmail: string;
    contactPhone: string;
    socialHandles: Record<string, string>;
    description?: string;
    createdAt: string;
}

interface SubscriptionsAdminResponse {
    success: boolean | string;
    data: SocialSubscription[];
    pagination?: {
        total: number;
        page: number;
        pages: number;
    };
}

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<SocialSubscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [showDropdown, setShowDropdown] = useState<string | null>(null);
    const [dropdownStyle, setDropdownStyle] = useState<{ top?: number; bottom?: number; right: number }>({ right: 0 });
    const [showDetailsModal, setShowDetailsModal] = useState<SocialSubscription | null>(null);

    useEffect(() => {
        fetchSubscriptions();
    }, [page, search, statusFilter]);

    const fetchSubscriptions = async () => {
        setLoading(true);
        const params = new URLSearchParams({
            page: page.toString(),
            limit: '20',
            ...(search && { search }),
            ...(statusFilter !== 'all' && { status: statusFilter }),
        });

        const { data, error } = await callApi<SubscriptionsAdminResponse>(
            `/subscriptions/admin/all?${params}`,
            'GET'
        );

        if (!error && data) {
            setSubscriptions(data.data || []);
            setTotal(data.pagination?.total || 0);
            setTotalPages(data.pagination?.pages || 1);
        } else {
            console.error('Error fetching subscriptions:', error);
            toast.error('Failed to fetch subscriptions');
            setSubscriptions([]);
        }
        setLoading(false);
    };

    const handleDropdownToggle = (id: string, event: React.MouseEvent<HTMLButtonElement>) => {
        if (showDropdown === id) {
            setShowDropdown(null);
            return;
        }

        const button = event.currentTarget;
        const buttonRect = button.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - buttonRect.bottom;
        const right = window.innerWidth - buttonRect.right;

        if (spaceBelow >= 200) {
            setDropdownStyle({ top: buttonRect.bottom + 8, right });
        } else {
            setDropdownStyle({ bottom: viewportHeight - buttonRect.top + 8, right });
        }

        setShowDropdown(id);
    };

    const getStatusBadge = (status: string, cancelAtPeriodEnd: boolean) => {
        const normalizedStatus = status;
        if (cancelAtPeriodEnd && normalizedStatus === 'active') {
            return (
                <span className="px-2.5 py-0.5 inline-flex items-center text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                    Cancels Soon
                </span>
            );
        }

        switch (normalizedStatus) {
            case 'active':
                return (
                    <span className="px-2.5 py-0.5 inline-flex items-center text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Active
                    </span>
                );
            case 'cancels_soon':
                return (
                    <span className="px-2.5 py-0.5 inline-flex items-center text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                        Cancels Soon
                    </span>
                );
            case 'cancelled':
            case 'canceled':
                return (
                    <span className="px-2.5 py-0.5 inline-flex items-center text-xs font-medium rounded-full bg-red-100 text-red-800">
                        Cancelled
                    </span>
                );
            case 'expired':
                return (
                    <span className="px-2.5 py-0.5 inline-flex items-center text-xs font-medium rounded-full bg-slate-100 text-slate-800">
                        Expired
                    </span>
                );
            case 'past_due':
                return (
                    <span className="px-2.5 py-0.5 inline-flex items-center text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        Past Due
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-0.5 inline-flex items-center text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {normalizedStatus}
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Social Media Subscriptions</h1>
                    <p className="text-gray-600 mt-1">
                        Manage subscribers for social media management services
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search business or user..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="cancels_soon">Cancels Soon</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="canceled">Canceled (Stripe)</option>
                        <option value="expired">Expired</option>
                        <option value="past_due">Past Due</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renewal Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {subscriptions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            No subscriptions found
                                        </td>
                                    </tr>
                                ) : (
                                    subscriptions.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                                                            {sub.user.firstName[0]}{sub.user.lastName[0]}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{sub.user.firstName} {sub.user.lastName}</div>
                                                        <div className="text-sm text-gray-500">{sub.user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{sub.businessName}</div>
                                                <div className="text-xs text-gray-500">{sub.businessType}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                ${(sub.amount / 100).toFixed(2)}/mo
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(sub.uiStatus || sub.status, sub.cancelAtPeriodEnd)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                                                <button
                                                    onClick={(e) => handleDropdownToggle(sub.id, e)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <MoreVertical className="h-5 w-5" />
                                                </button>

                                                {showDropdown === sub.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(null)} />
                                                        <div
                                                            className="fixed w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20"
                                                            style={{
                                                                ...(dropdownStyle.top !== undefined && { top: dropdownStyle.top }),
                                                                ...(dropdownStyle.bottom !== undefined && { bottom: dropdownStyle.bottom }),
                                                                right: dropdownStyle.right,
                                                            }}
                                                        >
                                                            <button
                                                                onClick={() => {
                                                                    setShowDetailsModal(sub);
                                                                    setShowDropdown(null);
                                                                }}
                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                            >
                                                                <Eye className="w-4 h-4" /> View Details
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Subscription Details Modal */}
            {showDetailsModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">Subscription Details</h3>
                            <button onClick={() => setShowDetailsModal(null)} className="text-gray-400 hover:text-gray-600">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Status Banner */}
                            <div className={`p-4 rounded-lg flex items-center gap-3 ${(showDetailsModal.uiStatus || showDetailsModal.status) === 'active' ? 'bg-green-50 text-green-800' :
                                    (showDetailsModal.uiStatus || showDetailsModal.status) === 'cancelled' ? 'bg-red-50 text-red-800' :
                                        (showDetailsModal.uiStatus || showDetailsModal.status) === 'expired' ? 'bg-slate-50 text-slate-800' :
                                            (showDetailsModal.uiStatus || showDetailsModal.status) === 'cancels_soon' ? 'bg-orange-50 text-orange-800' : 'bg-gray-50 text-gray-800'
                                }`}>
                                {(showDetailsModal.uiStatus || showDetailsModal.status) === 'active' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                <div>
                                    <p className="font-medium text-sm">Status: {(showDetailsModal.uiStatus || showDetailsModal.status).toUpperCase()}</p>
                                    {showDetailsModal.cancelAtPeriodEnd && (
                                        <p className="text-xs mt-0.5">Cancels on {new Date(showDetailsModal.currentPeriodEnd).toLocaleDateString()}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Business Information</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-xs text-gray-400 block">Business Name</span>
                                            <span className="text-sm font-medium text-gray-900">{showDetailsModal.businessName}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-400 block">Category</span>
                                            <span className="text-sm text-gray-900">{showDetailsModal.businessType}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-400 block">Description</span>
                                            <p className="text-sm text-gray-600 mt-1 line-clamp-3">{showDetailsModal.description || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Contact Information</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-xs text-gray-400 block">Contact Name</span>
                                            <span className="text-sm font-medium text-gray-900">{showDetailsModal.user.firstName} {showDetailsModal.user.lastName}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-400 block">Email</span>
                                            <span className="text-sm text-gray-900">{showDetailsModal.contactEmail}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-400 block">Phone</span>
                                            <span className="text-sm text-gray-900">{showDetailsModal.contactPhone}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-6">
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">Social Media Info</h4>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                    {showDetailsModal.socialHandles?.hasExistingAccounts === 'no' ? (
                                        <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded border border-green-100">
                                            <CheckCircle className="w-4 h-4" />
                                            <span className="text-sm font-medium">Requesting New Account Creation</span>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            {Object.entries(showDetailsModal.socialHandles || {})
                                                .filter(([key, val]) => key !== 'hasExistingAccounts' && val)
                                                .map(([platform, handle]) => (
                                                    <div key={platform}>
                                                        <span className="text-xs text-gray-400 capitalize block">{platform}</span>
                                                        <span className="text-sm font-medium text-gray-900">{handle as string}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end">
                            <button onClick={() => setShowDetailsModal(null)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
