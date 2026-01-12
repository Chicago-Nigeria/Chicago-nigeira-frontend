import { useSession } from "../store/useSession";
import { useAuthModal } from "../store/useAuthModal";

export function useAuthGuard() {
	const { user } = useSession((state) => state);
	const { openSignIn } = useAuthModal((state) => state.actions);

	const requireAuth = (callback: () => void, context?: string) => {
		if (!user) {
			openSignIn(context || "perform this action");
			return false;
		}
		callback();
		return true;
	};

	return {
		requireAuth,
		isAuthenticated: !!user,
	};
}
