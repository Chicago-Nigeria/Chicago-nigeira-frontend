'use client';

import { useEffect, useState } from 'react';
import { callApi } from '@/app/libs/helper/callApi';
import { ApiResponse } from '@/app/types';
import {  Search, MoreVertical, Ban, CheckCircle, Trash2, Eye, UserPlus, X, Mail, Phone, Calendar, Activity, Copy } from 'lucide-react';
import { toast } from 'sonner';
import {Loader} from '@/app/components/loader';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photo?: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  _count: {
    listings: number;
    events: number;
    posts: number;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ [key: string]: 'bottom' | 'top' }>({});
  const [showDetailsModal, setShowDetailsModal] = useState<User | null>(null);
  const [showBanModal, setShowBanModal] = useState<User | null>(null);
  const [showUnbanModal, setShowUnbanModal] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20',
      ...(search && { search }),
      ...(roleFilter !== 'all' && { role: roleFilter }),
      ...(statusFilter !== 'all' && { isActive: statusFilter }),
    });

    const { data, error } = await callApi<ApiResponse<any>>(
      `/admin/users?${params}`,
      'GET'
    );

    console.log('Users API Response:', { data, error });

    if (!error && data) {
      // Backend returns: { success: true, data: [...users], meta: {...} }
      const usersArray = Array.isArray(data.data) ? data.data : [];
      const metaData = data.meta || {};

      console.log('Parsed users:', usersArray);
      console.log('Meta:', metaData);

      setUsers(usersArray);
      setTotal(metaData.total || 0);
      setTotalPages(metaData.totalPages || 1);
    } else {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
      setUsers([]);
    }
    setLoading(false);
  };

  const handleBanUser = async (userId: string) => {
    const { error } = await callApi(
      `/admin/users/${userId}/ban`,
      'PUT',
      { reason: 'Banned by admin' }
    );

    if (error) {
      toast.error(error.message || 'Failed to ban user');
    } else {
      toast.success('User banned successfully');
      fetchUsers();
      setShowBanModal(null);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    const { error } = await callApi(
      `/admin/users/${userId}/unban`,
      'PUT'
    );

    if (error) {
      toast.error(error.message || 'Failed to unban user');
    } else {
      toast.success('User unbanned successfully');
      fetchUsers();
      setShowUnbanModal(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const { error } = await callApi(
      `/admin/users/${userId}`,
      'DELETE',
      { reason: 'Deleted by admin' }
    );

    if (error) {
      toast.error(error.message || 'Failed to delete user');
    } else {
      toast.success('User deleted successfully');
      fetchUsers();
      setShowDeleteModal(null);
    }
  };

  const handleDropdownToggle = (userId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const buttonRect = button.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const dropdownHeight = 200; // Approximate height of dropdown menu (3 buttons + padding + margins)

    // Determine if dropdown should open upwards or downwards
    // Add extra buffer to ensure it opens upward earlier
    const position = spaceBelow < dropdownHeight ? 'top' : 'bottom';

    setDropdownPosition(prev => ({ ...prev, [userId]: position }));
    setShowDropdown(showDropdown === userId ? null : userId);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
      case 'super_admin':
        return 'bg-purple-100 text-purple-700';
      case 'paid':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Manage and monitor all platform users
          </p>
        </div>
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 flex items-center justify-center gap-2 text-sm md:text-base">
          <UserPlus className="h-4 w-4 md:h-5 md:w-5" />
          Add Admin
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-3 md:p-4">
        {!loading && total > 0 && (
          <div className="mb-3 md:mb-4">
            <p className="text-xs md:text-sm text-gray-600">
              Showing <span className="font-medium text-gray-900">{users.length}</span> of{' '}
              <span className="font-medium text-gray-900">{total}</span> users
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="paid">Paid</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="true">Active</option>
            <option value="false">Banned</option>
          </select>
        </div>
      </div>

      {/* Users Table - Desktop */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
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
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Signup Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No users found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Try adjusting your search or filter criteria
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <span className="text-emerald-700 font-medium">
                            {user.firstName?.[0] || 'U'}{user.lastName?.[0] || 'U'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.phone || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                          user.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Banned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-2">
                        <span className="text-xs">{user._count.posts} posts</span>
                        <span className="text-xs">{user._count.events} events</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="relative">
                        <button
                          onClick={(e) => handleDropdownToggle(user.id, e)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>

                        {showDropdown === user.id && (
                          <>
                            <div
                              className="fixed inset-0 z-[100]"
                              onClick={() => setShowDropdown(null)}
                            />
                            <div
                              className={`absolute right-0 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[101] max-h-64 overflow-y-auto ${
                                dropdownPosition[user.id] === 'top'
                                  ? 'bottom-full mb-2'
                                  : 'top-full mt-2'
                              }`}
                            >
                              <button
                                onClick={() => {
                                  setShowDetailsModal(user);
                                  setShowDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </button>
                              {user.isActive ? (
                                <button
                                  onClick={() => {
                                    setShowBanModal(user);
                                    setShowDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Ban className="h-4 w-4" />
                                  Ban User
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setShowUnbanModal(user);
                                    setShowDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Unban User
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setShowDeleteModal(user);
                                  setShowDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete User
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination - Desktop */}
        {!loading && users.length > 0 && (
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

      {/* Users Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12 bg-white rounded-lg">
            <Loader />
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center text-gray-500">
            No users found
          </div>
        ) : (
          <>
            {users.map((user) => (
              <div key={user.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-700 font-medium text-sm">
                        {user.firstName?.[0] || 'U'}{user.lastName?.[0] || 'U'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={(e) => handleDropdownToggle(user.id, e)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {showDropdown === user.id && (
                      <>
                        <div className="fixed inset-0 z-[100]" onClick={() => setShowDropdown(null)} />
                        <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1.5 z-[101]">
                          <button
                            onClick={() => { setShowDetailsModal(user); setShowDropdown(null); }}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                          {user.isActive ? (
                            <button
                              onClick={() => { setShowBanModal(user); setShowDropdown(null); }}
                              className="w-full px-3 py-2 text-left text-sm text-orange-600 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Ban className="h-4 w-4" />
                              Ban
                            </button>
                          ) : (
                            <button
                              onClick={() => { setShowUnbanModal(user); setShowDropdown(null); }}
                              className="w-full px-3 py-2 text-left text-sm text-green-600 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Unban
                            </button>
                          )}
                          <button
                            onClick={() => { setShowDeleteModal(user); setShowDropdown(null); }}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.isActive ? 'Active' : 'Banned'}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                  <span>{user._count.posts} posts • {user._count.events} events</span>
                </div>
              </div>
            ))}

            {/* Pagination - Mobile */}
            {users.length > 0 && (
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

      {/* User Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">User Details</h3>
              <button
                onClick={() => setShowDetailsModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* User Header */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                  {showDetailsModal.photo ? (
                    <img
                      src={showDetailsModal.photo}
                      alt={`${showDetailsModal.firstName} ${showDetailsModal.lastName}`}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-emerald-700 font-semibold text-2xl">
                      {showDetailsModal.firstName?.[0] || 'U'}{showDetailsModal.lastName?.[0] || 'U'}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">
                    {showDetailsModal.firstName} {showDetailsModal.lastName}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getRoleBadgeColor(
                        showDetailsModal.role
                      )}`}
                    >
                      {showDetailsModal.role}
                    </span>
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                        showDetailsModal.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {showDetailsModal.isActive ? 'Active' : 'Banned'}
                    </span>
                    {showDetailsModal.isVerified && (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-blue-100 text-blue-700">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">{showDetailsModal.email}</p>
                      <button
                        onClick={() => copyToClipboard(showDetailsModal.email, 'Email')}
                        className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Copy Email"
                      >
                        <Copy className="h-3.5 w-3.5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{showDetailsModal.phone || 'N/A'}</p>
                      {showDetailsModal.phone && (
                        <button
                          onClick={() => copyToClipboard(showDetailsModal.phone, 'Phone')}
                          className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Copy Phone"
                        >
                          <Copy className="h-3.5 w-3.5 text-gray-600" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Joined</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(showDetailsModal.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Activity className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">User ID</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 font-mono truncate">
                        {showDetailsModal.id}
                      </p>
                      <button
                        onClick={() => copyToClipboard(showDetailsModal.id, 'User ID')}
                        className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Copy User ID"
                      >
                        <Copy className="h-3.5 w-3.5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Stats */}
              <div>
                <h5 className="text-sm font-semibold text-gray-900 mb-3">Activity Statistics</h5>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{showDetailsModal._count.posts}</p>
                    <p className="text-xs text-gray-600 mt-1">Posts</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{showDetailsModal._count.events}</p>
                    <p className="text-xs text-gray-600 mt-1">Events</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{showDetailsModal._count.listings}</p>
                    <p className="text-xs text-gray-600 mt-1">Listings</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowDetailsModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban Modal */}
      {showBanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-orange-100 rounded-full mb-4">
              <Ban className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
              Ban User
            </h3>
            <p className="text-gray-600 mb-6 text-center">
              Are you sure you want to ban <strong>{showBanModal.firstName}{' '}
              {showBanModal.lastName}</strong>? They will no longer be able to access the
              platform.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBanModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBanUser(showBanModal.id)}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
              >
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unban Modal */}
      {showUnbanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
              Unban User
            </h3>
            <p className="text-gray-600 mb-6 text-center">
              Are you sure you want to unban <strong>{showUnbanModal.firstName}{' '}
              {showUnbanModal.lastName}</strong>? They will regain access to the platform.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUnbanModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUnbanUser(showUnbanModal.id)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Unban User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
              Delete User
            </h3>
            <p className="text-gray-600 mb-6 text-center">
              Are you sure you want to delete <strong>{showDeleteModal.firstName}{' '}
              {showDeleteModal.lastName}</strong>? This action cannot be undone and will
              remove all their data from the platform.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(showDeleteModal.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
