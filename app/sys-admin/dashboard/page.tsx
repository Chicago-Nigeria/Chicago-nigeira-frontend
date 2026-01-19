'use client';

import { useEffect, useState } from 'react';
import { callApi } from '@/app/libs/helper/callApi';
import { ApiResponse } from '@/app/types';
import { Users, Calendar, Package, DollarSign } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {Loader} from '@/app/components/loader';

interface DashboardStats {
  users: { total: number; active: number; paid: number };
  events: { total: number; upcoming: number; pending: number };
  listings: { total: number; pending: number };
  revenue: number;
  userGrowth: { month: string; users: number }[];
  userTypes: { name: string; value: number; color: string }[];
  revenueBySource: { source: string; amount: number }[];
}

interface UserActivity {
  type: 'user_registration' | 'event_submission' | 'listing_submission' | 'ticket_purchase';
  title: string;
  subtitle: string;
  status?: string;
  price?: number;
  amount?: number;
  timestamp: string;
  id: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const [statsRes, activitiesRes] = await Promise.all([
      callApi<ApiResponse<DashboardStats>>('/admin/dashboard/stats', 'GET'),
      callApi<ApiResponse<UserActivity[]>>('/admin/dashboard/recent-activities', 'GET'),
    ]);

    if (!statsRes.error && statsRes.data) {
      setStats(statsRes.data.data);
    }

    if (!activitiesRes.error && activitiesRes.data) {
      setActivities(activitiesRes.data.data || []);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users.total || 0,
      subtitle: `${stats?.users.active || 0} active`,
      icon: Users,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Active Users',
      value: stats?.users.active || 0,
      subtitle: `${((stats?.users.active || 0) / (stats?.users.total || 1) * 100).toFixed(1)}% of total`,
      icon: Users,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Paid Users',
      value: stats?.users.paid || 0,
      subtitle: 'Subscribed',
      icon: DollarSign,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Service Fee Revenue',
      value: `$${(stats?.revenue || 0).toLocaleString()}`,
      subtitle: '$5 per ticket sold',
      icon: DollarSign,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Pending Events',
      value: stats?.events.pending || 0,
      subtitle: 'Awaiting approval',
      icon: Calendar,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      title: 'Pending Listings',
      value: stats?.listings.pending || 0,
      subtitle: 'Awaiting review',
      icon: Package,
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600',
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">
          Welcome back! Here's what's happening with your platform.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm p-3 md:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-medium text-gray-600 truncate">{card.title}</p>
                  <h3 className="text-lg md:text-2xl font-bold text-gray-900 mt-1 md:mt-2">
                    {card.value}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 md:mt-1 truncate">{card.subtitle}</p>
                </div>
                <div className={`${card.bgColor} p-2 md:p-3 rounded-lg flex-shrink-0`}>
                  <Icon className={`h-4 w-4 md:h-6 md:w-6 ${card.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">User Growth (Last 7 Months)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats?.userGrowth || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#068E52"
                strokeWidth={2}
                name="Total Users"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Source Chart */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Revenue by Source</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats?.revenueBySource || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="source" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => `$${value.toFixed(2)}`}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="amount" fill="#068E52" name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* User Types Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">User Types Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={stats?.userTypes || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {(stats?.userTypes || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Recent User Activity</h3>
          <div className="space-y-3 md:space-y-4 max-h-[300px] overflow-y-auto">
            {activities.length > 0 ? (
              activities.map((activity, index) => {
                const getActivityColor = () => {
                  switch (activity.type) {
                    case 'user_registration':
                      return 'bg-blue-600';
                    case 'event_submission':
                      return activity.status === 'pending' ? 'bg-yellow-600' : 'bg-green-600';
                    case 'listing_submission':
                      return activity.status === 'pending' ? 'bg-orange-600' : 'bg-emerald-600';
                    case 'ticket_purchase':
                      return 'bg-purple-600';
                    default:
                      return 'bg-gray-600';
                  }
                };

                const formatTimeAgo = (timestamp: string) => {
                  const now = new Date();
                  const time = new Date(timestamp);
                  const diff = Math.floor((now.getTime() - time.getTime()) / 1000);

                  if (diff < 60) return `${diff}s ago`;
                  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
                  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
                  return `${Math.floor(diff / 86400)}d ago`;
                };

                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-2 h-2 mt-2 rounded-full ${getActivityColor()}`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 font-medium">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.subtitle}</p>
                      {activity.amount && (
                        <p className="text-xs text-green-600 font-medium mt-0.5">
                          ${activity.amount.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
