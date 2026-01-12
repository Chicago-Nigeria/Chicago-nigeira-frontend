'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { callApi } from '@/app/libs/helper/callApi';
import { ApiResponse } from '@/app/types';
import {
  Search,
  MoreVertical,
  CheckCircle,
  Trash2,
  Eye,
  DollarSign,
  Calendar,
  MapPin,
  User,
  Ticket,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {Loader} from '@/app/components/loader';

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  venue?: string;
  coverImage?: string;
  isFree: boolean;
  ticketPrice: number | null;
  totalTickets?: number;
  status: string;
  organizer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  _count: {
    tickets: number;
    registrations: number;
  };
  tickets?: Array<{
    id: string;
    ticketCode: string;
    quantity: number;
    totalPrice: number;
    status: string;
    purchasedAt: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
  registrations?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    status: string;
    registeredAt: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [showApproveModal, setShowApproveModal] = useState<Event | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<Event | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<Event | null>(null);
  const [totalServiceFees, setTotalServiceFees] = useState(0);
  const [loadingServiceFees, setLoadingServiceFees] = useState(true);

  useEffect(() => {
    fetchEvents();
    fetchServiceFees();
  }, [page, search, statusFilter]);

  const fetchEvents = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20',
      ...(search && { search }),
      ...(statusFilter !== 'all' && { status: statusFilter }),
    });

    const { data, error } = await callApi<ApiResponse<Event[]>>(
      `/admin/events?${params}`,
      'GET'
    );

    if (!error && data) {
      setEvents(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
    }
    setLoading(false);
  };

  const fetchServiceFees = async () => {
    setLoadingServiceFees(true);
    const { data, error } = await callApi<ApiResponse<{ totalServiceFees: number }>>(
      '/admin/events/service-fees/total',
      'GET'
    );

    if (!error && data) {
      setTotalServiceFees(data.data?.totalServiceFees || 0);
    }
    setLoadingServiceFees(false);
  };

  const handleViewDetails = async (eventId: string) => {
    setShowDropdown(null);
    const { data, error } = await callApi<ApiResponse<Event>>(
      `/admin/events/${eventId}`,
      'GET'
    );

    if (!error && data) {
      setShowDetailsModal(data.data || null);
    } else {
      toast.error('Failed to load event details');
    }
  };

  const handleApproveEvent = async (eventId: string) => {
    const { error } = await callApi(
      `/admin/events/${eventId}/approve`,
      'PUT'
    );

    if (error) {
      toast.error(error.message || 'Failed to approve event');
    } else {
      toast.success('Event approved successfully');
      fetchEvents();
      fetchServiceFees();
      setShowApproveModal(null);
      setShowDetailsModal(null);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    const { error } = await callApi(
      `/admin/events/${eventId}`,
      'DELETE',
      { reason: 'Deleted by admin' }
    );

    if (error) {
      toast.error(error.message || 'Failed to delete event');
    } else {
      toast.success('Event deleted successfully');
      fetchEvents();
      fetchServiceFees();
      setShowDeleteModal(null);
      setShowDetailsModal(null);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-700';
      case 'ongoing':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Service Fees Card */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage all platform events
          </p>
        </div>

        {/* Total Service Fees Card */}
        <div className="bg-emerald-600 text-white rounded-lg p-4 min-w-[200px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Total Service Fees</p>
              <h3 className="text-2xl font-bold mt-1">
                {loadingServiceFees ? (
                  <span className="text-lg">Loading...</span>
                ) : (
                  `$${totalServiceFees.toFixed(2)}`
                )}
              </h3>
            </div>
            <div className="bg-emerald-500 p-2 rounded-lg">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-sm text-emerald-100">5% of ticket sales</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or location..."
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
            <option value="all">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-visible">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader />
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organizer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event, index) => {
                  // Open dropdown upward for last 2 rows, downward for others
                  const isLastRows = index >= events.length - 2;
                  return (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {event.title}
                      </div>
                      <div className="text-sm text-gray-500">{event.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {event.organizer.firstName} {event.organizer.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {event.organizer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(event.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                          event.isFree
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {event.isFree ? 'Free' : 'Paid'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusBadgeColor(
                          event.status
                        )}`}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.isFree
                        ? `${event._count.registrations} registered`
                        : `${event._count.tickets} tickets`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setShowDropdown(
                              showDropdown === event.id ? null : event.id
                            )
                          }
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>

                        {showDropdown === event.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setShowDropdown(null)}
                            />
                            <div className={`absolute right-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 ${
                              isLastRows ? 'bottom-full mb-2' : 'mt-2'
                            }`}>
                              <button
                                onClick={() => handleViewDetails(event.id)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  setShowApproveModal(event);
                                  setShowDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-emerald-600 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setShowDeleteModal(event);
                                  setShowDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Event
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && events.length > 0 && (
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

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Approve Event
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to approve "{showApproveModal.title}"? The event
              will be visible to all users.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowApproveModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApproveEvent(showApproveModal.id)}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                Approve Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Event
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{showDeleteModal.title}"? This
              action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEvent(showDeleteModal.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Event Details</h2>
              <button
                onClick={() => setShowDetailsModal(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Event Banner */}
            {showDetailsModal.coverImage && (
              <div className="relative w-full h-64 bg-gray-100">
                <Image
                  src={showDetailsModal.coverImage}
                  alt={showDetailsModal.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Event Title</label>
                      <p className="text-gray-900 mt-1">{showDetailsModal.title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Category</label>
                      <p className="text-gray-900 mt-1">{showDetailsModal.category}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className="mt-1">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusBadgeColor(
                            showDetailsModal.status
                          )}`}
                        >
                          {showDetailsModal.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Location</label>
                      <div className="flex items-start gap-2 mt-1">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-900">{showDetailsModal.location}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Start Date</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">
                          {new Date(showDetailsModal.startDate).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {showDetailsModal.endDate && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">End Date</label>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <p className="text-gray-900">
                            {new Date(showDetailsModal.endDate).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                    {showDetailsModal.description}
                  </p>
                </div>
              </div>

              {/* Ticket Info */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Type</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {showDetailsModal.isFree ? 'Free Event' : 'Paid Event'}
                    </p>
                  </div>
                  {!showDetailsModal.isFree && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">Ticket Price</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        ${(showDetailsModal.ticketPrice || 0).toFixed(2)}
                      </p>
                    </div>
                  )}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">
                      {showDetailsModal.isFree ? 'Registrations' : 'Tickets Sold'}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {showDetailsModal.isFree
                        ? showDetailsModal.registrations?.length || showDetailsModal._count?.registrations || 0
                        : showDetailsModal.tickets?.length || showDetailsModal._count?.tickets || 0}
                      {showDetailsModal.totalTickets && ` / ${showDetailsModal.totalTickets}`}
                    </p>
                  </div>
                  {!showDetailsModal.isFree && showDetailsModal.ticketPrice && (
                    <div className="bg-emerald-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-emerald-700">Service Fee (5%)</p>
                      <p className="text-lg font-semibold text-emerald-900 mt-1">
                        $
                        {(
                          (showDetailsModal.ticketPrice || 0) *
                          0.05 *
                          (showDetailsModal.tickets?.length || showDetailsModal._count?.tickets || 0)
                        ).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Organizer Info */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Organizer Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-500">Name:</span>
                    <span className="text-gray-900">
                      {showDetailsModal.organizer.firstName} {showDetailsModal.organizer.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500 ml-6">Email:</span>
                    <span className="text-gray-900">{showDetailsModal.organizer.email}</span>
                  </div>
                  {showDetailsModal.organizer.phone && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500 ml-6">Phone:</span>
                      <span className="text-gray-900">{showDetailsModal.organizer.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Attendees List (Paid Events) */}
              {!showDetailsModal.isFree && showDetailsModal.tickets && showDetailsModal.tickets.length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Ticket Holders ({showDetailsModal.tickets.length})
                  </h3>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Attendee
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Ticket Code
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Quantity
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Amount
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Purchased
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {showDetailsModal.tickets.map((ticket) => (
                            <tr key={ticket.id}>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {ticket.user.firstName} {ticket.user.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{ticket.user.email}</div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="text-sm font-mono text-gray-900">
                                  {ticket.ticketCode}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {ticket.quantity}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                ${ticket.totalPrice.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    ticket.status === 'confirmed'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {ticket.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {new Date(ticket.purchasedAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Registrations List (Free Events) */}
              {showDetailsModal.isFree && showDetailsModal.registrations && showDetailsModal.registrations.length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Registered Participants ({showDetailsModal.registrations.length})
                  </h3>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Participant
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Phone
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Registered
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {showDetailsModal.registrations.map((registration) => (
                            <tr key={registration.id}>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {registration.firstName} {registration.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{registration.email}</div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {registration.phone}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    registration.status === 'confirmed'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {registration.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {new Date(registration.registeredAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => setShowDetailsModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              >
                Close
              </button>
              {showDetailsModal.status === 'pending' && (
                <button
                  onClick={() => {
                    setShowApproveModal(showDetailsModal);
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 font-medium flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </button>
              )}
              <button
                onClick={() => {
                  setShowDeleteModal(showDetailsModal);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
