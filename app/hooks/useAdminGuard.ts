'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminSession } from '../store/useAdminSession';

export function useAdminGuard() {
  const { admin, loading } = useAdminSession((state) => state);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Allow access to login page
    if (pathname === '/sys-admin/auth/login') {
      if (admin && !loading) {
        // Redirect authenticated admins away from login
        router.push('/sys-admin/dashboard');
      }
      return;
    }

    // Protect all other admin routes
    if (!loading && !admin) {
      router.push('/sys-admin/auth/login');
    }
  }, [admin, loading, router, pathname]);

  return { admin, loading, isAdmin: !!admin };
}
