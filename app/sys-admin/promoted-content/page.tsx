'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { callApi } from '@/app/libs/helper/callApi';
import { ApiResponse, IPromotedContent, Meta } from '@/app/types';
import {
  MoreVertical,
  Trash2,
  Eye,
  Plus,
  Calendar,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  MousePointerClick,
  Megaphone,
  Clock,
} from 'lucide-react';
import PromoteEventModal from './components/PromoteEventModal';
import { toast } from 'sonner';
import { Loader } from '@/app/components/loader';
import { AdminPromoted } from '@/app/services';

export default function PromotedContentPage() {
  const [promotedContent, setPromotedContent] = useState<IPromotedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [dropdownStyle, setDropdownStyle] = useState<{ top?: number; bottom?: number; right: number }>({ right: 0 });
  const [showDeleteModal, setShowDeleteModal] = useState<IPromotedContent | null>(null);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchPromotedContent();
  }, [page, activeFilter]);

  const fetchPromotedContent = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20',
      contentType: 'event',
      ...(activeFilter !== 'all' && { isActive: activeFilter === 'active' ? 'true' : 'false' }),
    });

    const { data, error } = await callApi<ApiResponse<IPromotedContent[]> & { meta: Meta }>(
      `/admin/promoted-content?${params}`,
      'GET'
    );

    if (!error && data) {
      setPromotedContent(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
    }
    setLoading(false);
  };

  const handleToggle = async (item: IPromotedContent) => {
    const { data, error } = await AdminPromoted.toggle(item.id);

    if (error) {
      toast.error(error.message || 'Failed to toggle promotion');
    } else {
      toast.success(`Promotion ${data?.data?.isActive ? 'activated' : 'deactivated'}`);
      fetchPromotedContent();
    }
    setShowDropdown(null);
  };

  const handleDelete = async (itemId: string) => {
    const { error } = await AdminPromoted.remove(itemId);

    if (error) {
      toast.error(error.message || 'Failed to delete promotion');
    } else {
      toast.success('Promotion removed successfully');
      fetchPromotedContent();
      setShowDeleteModal(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateCTR = (impressions: number, clicks: number) => {
    if (impressions === 0) return '0%';
    return ((clicks / impressions) * 100).toFixed(1) + '%';
  };

  const handleDropdownToggle = (itemId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (showDropdown === itemId) {
      setShowDropdown(null);
      return;
    }

    const button = event.currentTarget;
    const buttonRect = button.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    const dropdownHeight = 120;

    const right = viewportWidth - buttonRect.right;

    if (spaceBelow >= dropdownHeight) {
      setDropdownStyle({ top: buttonRect.bottom + 8, right });
    } else if (spaceAbove >= dropdownHeight) {
      setDropdownStyle({ bottom: viewportHeight - buttonRect.top + 8, right });
    } else {
      if (spaceBelow >= spaceAbove) {
        setDropdownStyle({ top: buttonRect.bottom + 8, right });
      } else {
        setDropdownStyle({ bottom: viewportHeight - buttonRect.top + 8, right });
      }
    }

    setShowDropdown(itemId);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Promoted Content</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Manage promoted events shown in the news feed
          </p>
        </div>

        <button
          onClick={() => setShowPromoteModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Promote Event</span>
        </button>
      </div>

      {/* Promoted Events Section */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">Promoted Events</h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${
                  activeFilter === 'all'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('active')}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${
                  activeFilter === 'active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setActiveFilter('inactive')}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${
                  activeFilter === 'inactive'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader />
          </div>
        ) : promotedContent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Megaphone className="h-12 w-12 text-gray-300 mb-4" />
            <p className="font-medium">No promoted events</p>
            <p className="text-sm mt-1">Promote events to display them in the news feed</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Impressions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CTR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {promotedContent.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {item.event?.coverImage ? (
                              <Image
                                src={item.event.coverImage}
                                alt={item.event.title}
                                width={64}
                                height={48}
                                className="rounded object-cover"
                              />
                            ) : (
                              <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{item.event?.title}</p>
                              <p className="text-sm text-gray-500">{item.event?.location}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                              item.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {item.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{item.priority}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Eye className="h-4 w-4" />
                            {item.impressions.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MousePointerClick className="h-4 w-4" />
                            {item.clicks.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-emerald-600">
                            {calculateCTR(item.impressions, item.clicks)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDate(item.startDate)}
                            {item.endDate && ` - ${formatDate(item.endDate)}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="relative">
                            <button
                              onClick={(e) => handleDropdownToggle(item.id, e)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <MoreVertical className="h-5 w-5" />
                            </button>

                            {showDropdown === item.id && (
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
                                    onClick={() => handleToggle(item)}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    {item.isActive ? (
                                      <>
                                        <ToggleLeft className="h-4 w-4" />
                                        Deactivate
                                      </>
                                    ) : (
                                      <>
                                        <ToggleRight className="h-4 w-4" />
                                        Activate
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShowDeleteModal(item);
                                      setShowDropdown(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Remove Promotion
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3 p-4">
              {promotedContent.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {item.event?.coverImage ? (
                        <Image
                          src={item.event.coverImage}
                          alt={item.event.title}
                          width={48}
                          height={36}
                          className="rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-9 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{item.event?.title}</p>
                        <p className="text-xs text-gray-500 truncate">{item.event?.location}</p>
                      </div>
                    </div>
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={(e) => handleDropdownToggle(item.id, e)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {showDropdown === item.id && (
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
                              onClick={() => handleToggle(item)}
                              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              {item.isActive ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                              {item.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => { setShowDeleteModal(item); setShowDropdown(null); }}
                              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-gray-500">Priority: {item.priority}</span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {item.impressions.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MousePointerClick className="h-3.5 w-3.5" />
                        {item.clicks.toLocaleString()}
                      </span>
                      <span className="text-emerald-600 font-medium">
                        {calculateCTR(item.impressions, item.clicks)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {promotedContent.length > 0 && (
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
          </>
        )}
      </div>

      {/* Sponsored Ads Section - Placeholder */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Sponsored Ads</h2>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              Coming Soon
            </span>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Third-Party Ad Integration</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            This section will allow you to manage sponsored advertisements from third-party ad providers.
            Ads will be displayed in the news feed alongside promoted events.
          </p>
          <button
            disabled
            className="mt-6 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg font-medium cursor-not-allowed"
          >
            Create Ad (Coming Soon)
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 max-w-md w-full mx-4">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
              Remove Promotion
            </h3>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
              Are you sure you want to remove the promotion for "{showDeleteModal.event?.title}"?
              The event will no longer appear in the news feed as promoted content.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-3 md:px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal.id)}
                className="flex-1 px-3 md:px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promote Event Modal */}
      {showPromoteModal && (
        <PromoteEventModal
          onClose={() => setShowPromoteModal(false)}
          onSuccess={() => {
            fetchPromotedContent();
          }}
        />
      )}
    </div>
  );
}
