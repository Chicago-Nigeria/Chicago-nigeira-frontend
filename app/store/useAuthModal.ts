import { create } from "zustand";
import { useShallow } from "zustand/shallow";

interface AuthModalState {
	isOpen: boolean;
	mode: "signin" | "signup";
	context: string;
	redirectAfterAuth: string | null;
	actions: {
		openSignIn: (context?: string, redirect?: string | null) => void;
		openSignUp: (context?: string, redirect?: string | null) => void;
		closeModal: () => void;
		switchToSignIn: () => void;
		switchToSignUp: () => void;
	};
}

export type SelectorFn<TStore, TResult> = (state: TStore) => TResult;

const initialState = {
	isOpen: false,
	mode: "signin" as const,
	context: "",
	redirectAfterAuth: null,
};

export const initAuthModal = create<AuthModalState>()((set) => ({
	...initialState,
	actions: {
		openSignIn: (context = "", redirect = null) =>
			set({
				isOpen: true,
				mode: "signin",
				context,
				redirectAfterAuth: redirect,
			}),

		openSignUp: (context = "", redirect = null) =>
			set({
				isOpen: true,
				mode: "signup",
				context,
				redirectAfterAuth: redirect,
			}),

		closeModal: () => set({ ...initialState }),

		switchToSignIn: () => set({ mode: "signin" }),

		switchToSignUp: () => set({ mode: "signup" }),
	} satisfies AuthModalState["actions"],
}));

export const useAuthModal = <TResult>(
	selector: SelectorFn<AuthModalState, TResult>,
) => {
	return initAuthModal(useShallow(selector));
};
