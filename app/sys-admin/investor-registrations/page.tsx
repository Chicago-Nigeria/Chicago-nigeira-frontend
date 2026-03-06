'use client';

import { useEffect, useState } from 'react';
import { callApi } from '@/app/libs/helper/callApi';
import { ApiResponse } from '@/app/types';
import { Search, Download, Eye, X, Users, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Loader } from '@/app/components/loader';

interface InvestorRegistration {
  id: string;
  role: string;
  incomeRange: string;
  investmentInterest: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  jobTitle?: string;
  linkedIn?: string;
  referralSource?: string;
  isVip: boolean;
  createdAt: string;
}

export default function InvestorRegistrationsPage() {
  const [registrations, setRegistrations] = useState<InvestorRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [vipFilter, setVipFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showDetailsModal, setShowDetailsModal] = useState<InvestorRegistration | null>(null);

  // Stats
  const [stats, setStats] = useState({ total: 0, vip: 0 });

  useEffect(() => {
    fetchRegistrations();
  }, [page, vipFilter]);

  const fetchRegistrations = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20',
      ...(vipFilter !== 'all' && { isVip: vipFilter }),
    });

    const { data, error } = await callApi<ApiResponse<any>>(
      `/investor-registration?${params}`,
      'GET'
    );

    if (!error && data) {
      const items = Array.isArray(data.data) ? data.data : [];
      const metaData = data.meta || {};

      setRegistrations(items);
      setTotal(metaData.total || 0);
      setTotalPages(metaData.totalPages || 1);

      if (page === 1) {
        fetchStats();
      }
    } else {
      toast.error('Failed to fetch registrations');
      setRegistrations([]);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    const { data: allData } = await callApi<ApiResponse<any>>(
      '/investor-registration?limit=1000',
      'GET'
    );
    if (allData) {
      const all = Array.isArray(allData.data) ? allData.data : [];
      setStats({
        total: allData.meta?.total || all.length,
        vip: all.filter((r: InvestorRegistration) => r.isVip).length,
      });
    }
  };

  const filteredRegistrations = search
    ? registrations.filter(
        (r) =>
          `${r.firstName} ${r.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
          r.email.toLowerCase().includes(search.toLowerCase()) ||
          r.company?.toLowerCase().includes(search.toLowerCase())
      )
    : registrations;

  const downloadCSV = () => {
    callApi<ApiResponse<any>>('/investor-registration?limit=1000', 'GET').then(({ data, error }) => {
      if (error || !data) {
        toast.error('Failed to export data');
        return;
      }

      const items: InvestorRegistration[] = Array.isArray(data.data) ? data.data : [];
      if (items.length === 0) {
        toast.error('No data to export');
        return;
      }

      const headers = [
        'First Name',
        'Last Name',
        'Email',
        'Phone',
        'Company',
        'Job Title',
        'Role',
        'Income Range',
        'Investment Interest',
        'Referral Source',
        'LinkedIn',
        'VIP',
        'Registered At',
      ];

      const rows = items.map((r) => [
        r.firstName,
        r.lastName,
        r.email,
        r.phone,
        r.company || '',
        r.jobTitle || '',
        r.role,
        r.incomeRange,
        r.investmentInterest,
        r.referralSource || '',
        r.linkedIn || '',
        r.isVip ? 'Yes' : 'No',
        new Date(r.createdAt).toLocaleDateString(),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `smart-city-lagos-registrations-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('CSV downloaded successfully');
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const statCards = [
    { title: 'Total Registrations', value: stats.total, icon: Users, bgColor: 'bg-blue-50', iconColor: 'text-blue-600' },
    { title: 'VIP Investors', value: stats.vip, icon: Star, bgColor: 'bg-amber-50', iconColor: 'text-amber-600' },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">SMART City Lagos Registrations</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Manage investor registrations for the Property Show event
          </p>
        </div>
        <button
          onClick={downloadCSV}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition shadow-sm"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-3 md:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-medium text-gray-600 truncate">{card.title}</p>
                  <h3 className="text-lg md:text-2xl font-bold text-gray-900 mt-1 md:mt-2">{card.value}</h3>
                </div>
                <div className={`${card.bgColor} p-2 md:p-3 rounded-lg flex-shrink-0`}>
                  <Icon className={`h-4 w-4 md:h-6 md:w-6 ${card.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-sm p-3 md:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <select
            value={vipFilter}
            onChange={(e) => { setVipFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All Investors</option>
            <option value="true">VIP Only</option>
            <option value="false">Non-VIP</option>
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader />
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No registrations found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Income</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {reg.firstName} {reg.lastName}
                          {reg.isVip && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">VIP</span>
                          )}
                        </div>
                        {reg.company && (
                          <div className="text-xs text-gray-500">{reg.jobTitle ? `${reg.jobTitle} at ` : ''}{reg.company}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{reg.email}</div>
                      <div className="text-xs text-gray-500">{reg.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{reg.role}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${reg.isVip ? 'text-amber-700' : 'text-gray-700'}`}>
                        {reg.incomeRange}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{reg.investmentInterest}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(reg.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => setShowDetailsModal(reg)}
                        className="text-gray-400 hover:text-emerald-600 transition-colors"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredRegistrations.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing page {page} of {totalPages} ({total} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12 bg-white rounded-lg">
            <Loader />
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center text-gray-500">
            No registrations found
          </div>
        ) : (
          <>
            {filteredRegistrations.map((reg) => (
              <div key={reg.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      {reg.firstName} {reg.lastName}
                      {reg.isVip && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">VIP</span>
                      )}
                    </div>
                    {reg.company && (
                      <div className="text-xs text-gray-500 mt-0.5">{reg.jobTitle ? `${reg.jobTitle} at ` : ''}{reg.company}</div>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-gray-600">
                  <div>{reg.email}</div>
                  <div>{reg.phone}</div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
                    <span className={`font-medium ${reg.isVip ? 'text-amber-700' : 'text-gray-700'}`}>{reg.incomeRange}</span>
                    <button
                      onClick={() => setShowDetailsModal(reg)}
                      className="text-emerald-600 font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Mobile Pagination */}
            {filteredRegistrations.length > 0 && (
              <div className="bg-white rounded-lg p-3 flex items-center justify-between">
                <p className="text-xs text-gray-600">Page {page} of {totalPages}</p>
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

      {/* Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">Registration Details</h2>
                {showDetailsModal.isVip && (
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">VIP</span>
                )}
              </div>
              <button
                onClick={() => setShowDetailsModal(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Name</span>
                    <span className="text-sm font-medium text-gray-900">{showDetailsModal.firstName} {showDetailsModal.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Email</span>
                    <span className="text-sm font-medium text-gray-900">{showDetailsModal.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Phone</span>
                    <span className="text-sm font-medium text-gray-900">{showDetailsModal.phone}</span>
                  </div>
                  {showDetailsModal.company && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Company</span>
                      <span className="text-sm font-medium text-gray-900">{showDetailsModal.company}</span>
                    </div>
                  )}
                  {showDetailsModal.jobTitle && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Job Title</span>
                      <span className="text-sm font-medium text-gray-900">{showDetailsModal.jobTitle}</span>
                    </div>
                  )}
                  {showDetailsModal.linkedIn && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">LinkedIn</span>
                      <a href={showDetailsModal.linkedIn} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-emerald-600 hover:underline">
                        View Profile
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Qualification Data */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Qualification Data</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Role</span>
                    <span className="text-sm font-medium text-gray-900">{showDetailsModal.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Income Range</span>
                    <span className={`text-sm font-medium ${showDetailsModal.isVip ? 'text-amber-700' : 'text-gray-900'}`}>
                      {showDetailsModal.incomeRange}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Investment Interest</span>
                    <span className="text-sm font-medium text-gray-900">{showDetailsModal.investmentInterest}</span>
                  </div>
                  {showDetailsModal.referralSource && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Referral Source</span>
                      <span className="text-sm font-medium text-gray-900">{showDetailsModal.referralSource}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Registered</span>
                    <span className="text-sm font-medium text-gray-900">{formatDate(showDetailsModal.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
