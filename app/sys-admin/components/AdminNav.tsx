'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Calendar, Shield, ScrollText, Package, X, Wallet, FileText, Megaphone } from 'lucide-react';

interface AdminNavProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminNav({ isOpen = true, onClose }: AdminNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/sys-admin/dashboard',
      icon: Home,
    },
    {
      name: 'Users',
      href: '/sys-admin/users',
      icon: Users,
    },
    {
      name: 'Events',
      href: '/sys-admin/events',
      icon: Calendar,
    },
    {
      name: 'Marketplace',
      href: '/sys-admin/marketplace',
      icon: Package,
    },
    {
      name: 'Payouts',
      href: '/sys-admin/payouts',
      icon: Wallet,
    },
    {
      name: 'Blog Posts',
      href: '/sys-admin/blog-posts',
      icon: FileText,
    },
    {
      name: 'Promoted Content',
      href: '/sys-admin/promoted-content',
      icon: Megaphone,
    },
    {
      name: 'Activity Logs',
      href: '/sys-admin/logs',
      icon: ScrollText,
    },
  ];

  const handleLinkClick = () => {
    // Close mobile nav when a link is clicked
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-gray-200 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo/Brand */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">Admin Portal</h1>
                <p className="text-xs text-gray-500">Chicago Nigeria</p>
              </div>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Admin Dashboard v1.0
          </p>
        </div>
      </aside>
    </>
  );
}
