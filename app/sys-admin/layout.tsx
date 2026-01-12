'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminSession } from '@/app/store/useAdminSession';
import AdminNav from './components/AdminNav';
import AdminTopNav from './components/AdminTopNav';
import {Loader} from '@/app/components/loader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { admin, loading } = useAdminSession((state) => state);
  const { getSession } = useAdminSession((state) => state.actions);
  const router = useRouter();
  const pathname = usePathname();
  const [initialLoad, setInitialLoad] = useState(true);

  // Fetch admin session on mount (will skip if recently fetched)
  useEffect(() => {
    getSession().finally(() => {
      setInitialLoad(false);
    });
  }, [getSession]);

  // Redirect if not admin (except on login page)
  useEffect(() => {
    if (!initialLoad && !loading && !admin && pathname !== '/sys-admin/auth/login') {
      router.push('/sys-admin/auth/login');
    }
  }, [admin, loading, router, pathname, initialLoad]);

  // Show loader only on initial load if we don't have persisted admin data
  if (initialLoad && loading && !admin) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <Loader />
      </div>
    );
  }

  // Don't show layout on login page
  if (pathname === '/sys-admin/auth/login') {
    return <>{children}</>;
  }

  // Redirect if not admin (will trigger)
  if (!admin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-emerald-50 via-white to-white overflow-hidden">
      <AdminNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopNav />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
