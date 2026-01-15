'use client';

import { useRouter } from 'next/navigation';
import { useAdminSession } from '@/app/store/useAdminSession';
import { callApi } from '@/app/libs/helper/callApi';
import { Bell, ChevronDown, LogOut, Menu, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

interface AdminTopNavProps {
  onMenuClick?: () => void;
}

export default function AdminTopNav({ onMenuClick }: AdminTopNavProps) {
  const { admin } = useAdminSession((state) => state);
  const { clearSession } = useAdminSession((state) => state.actions);
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    // Call backend to clear cookies and refresh token
    await callApi('/admin/auth/logout', 'POST');

    // Clear frontend session
    clearSession();

    toast.success('Logged out successfully');
    router.push('/sys-admin/auth/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Hamburger Menu for Mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Search Bar - Hidden on mobile, visible on tablet+ */}
        <div className="hidden sm:block flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile Search Button */}
          <button className="sm:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <Search className="h-5 w-5" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
          </button>

          {/* Admin Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-medium">
                  {admin?.firstName?.[0]}
                  {admin?.lastName?.[0]}
                </span>
              </div>
              {/* Name - Hidden on mobile */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {admin?.firstName} {admin?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">{admin?.role}</p>
              </div>
              <ChevronDown className="hidden md:block h-4 w-4 text-gray-500" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  {/* Show name on mobile dropdown */}
                  <div className="md:hidden px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {admin?.firstName} {admin?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{admin?.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
