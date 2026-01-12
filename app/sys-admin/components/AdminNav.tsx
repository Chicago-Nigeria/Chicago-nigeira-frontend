'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Calendar, Shield, ScrollText, Package } from 'lucide-react';

export default function AdminNav() {
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
      name: 'Activity Logs',
      href: '/sys-admin/logs',
      icon: ScrollText,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">Admin Portal</h1>
            <p className="text-xs text-gray-500">Chicago Nigeria</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
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
  );
}
