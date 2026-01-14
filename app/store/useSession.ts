import { create } from "zustand";
import { callApi } from "../libs/helper/callApi";
import { ApiResponse, IUser } from "../types";
import { useShallow } from "zustand/shallow";
import { toast } from "sonner";

type Session = {
  user: IUser | null;
  loading: boolean;
  isFirstMount: boolean;
  actions: {
    clearSession: () => void;
    updateUser: (data: IUser) => void;
    getSession: (isInitialLoad?: boolean) => Promise<void>;
  };
};

export type SelectorFn<TStore, TResult> = (state: TStore) => TResult;

const initialState = {
  user: null,
  loading: true,
  isFirstMount: false,
};

export const initSession = create<Session>()((set, get) => ({
  ...initialState,
  actions: {
    getSession: async (isInitialLoad = false) => {
      console.log(" <====  🛡️ Getting Session  ===> ");
      if (typeof isInitialLoad === "boolean") {
        set({ isFirstMount: true });
      }

      const { data } = await callApi<ApiResponse<IUser>>(
        `/auth/session`
      );

      set({ ...(data?.data && { user: data.data }), loading: false });

      console.log(data?.data);
    },

    updateUser: (data: IUser) => set({ user: data }),

    clearSession: () => {
      set({ user: null, loading: false });

      // Clear tokens from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }

      // Don't force redirect - let user continue browsing
      if (!get().isFirstMount) {
        toast.info(
          "You've been signed out. Sign in to interact with content.",
        );
      }
    },
  } satisfies Session["actions"],
}));

export const useSession = <TResult>(selector: SelectorFn<Session, TResult>) => {
  return initSession(useShallow(selector));
};
