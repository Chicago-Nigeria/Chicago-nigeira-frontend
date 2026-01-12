// hooks/useUserLogger.ts
import { useEffect } from 'react';
import { useSessionState } from '@/app/store/useSession';

export const useUserLogger = (pageName: string = 'Page') => {
  const { user, loading, hasCheckedAuth } = useSessionState(state => ({
    user: state.user,
    loading: state.loading,
    hasCheckedAuth: state.hasCheckedAuth
  }));

  useEffect(() => {
    console.log(`👤 ${pageName} - User Data:`, {
      user,
      loading,
      hasCheckedAuth,
      userExists: !!user,
      timestamp: new Date().toISOString()
    });
  }, [user, loading, hasCheckedAuth, pageName]);

  return { user, loading, hasCheckedAuth };
};