'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { callApi } from '../libs/helper/callApi';
import { ApiResponse } from '../types';
import { useShallow } from 'zustand/shallow';

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'super_admin';
}

type AdminSession = {
  admin: AdminUser | null;
  loading: boolean;
  lastFetch: number | null;
  actions: {
    clearSession: () => void;
    updateAdmin: (data: AdminUser) => void;
    getSession: (force?: boolean) => Promise<void>;
  };
};

const initialState = {
  admin: null,
  loading: true,
  lastFetch: null,
};

export const initAdminSession = create<AdminSession>()(
  persist(
    (set, get) => ({
      ...initialState,
      actions: {
        getSession: async (force = false) => {
          const state = get();
          const now = Date.now();

          // Skip fetch if we fetched recently (within 30 seconds) and not forced
          if (!force && state.lastFetch && now - state.lastFetch < 30000) {
            set({ loading: false });
            return;
          }

          try {
            const { data, error } = await callApi<ApiResponse<AdminUser>>(
              `/admin/auth/session`,
              'GET'
            );

            if (!error && data?.data) {
              set({
                admin: data.data,
                loading: false,
                lastFetch: now,
              });
            } else {
              // Session invalid, clear it
              set({
                admin: null,
                loading: false,
                lastFetch: null,
              });
            }
          } catch (err) {
            set({
              admin: null,
              loading: false,
              lastFetch: null,
            });
          }
        },

        updateAdmin: (data: AdminUser) =>
          set({ admin: data, loading: false, lastFetch: Date.now() }),

        clearSession: () => {
          set({ admin: null, loading: false, lastFetch: null });
        },
      },
    }),
    {
      name: 'admin-session-storage',
      partialize: (state) => ({
        admin: state.admin,
        lastFetch: state.lastFetch,
      }),
    }
  )
);

export const useAdminSession = <TResult>(
  selector: (state: AdminSession) => TResult
) => {
  return initAdminSession(useShallow(selector));
};
