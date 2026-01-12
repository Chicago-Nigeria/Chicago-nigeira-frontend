"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../store/useSession";
import { useAuthModal } from "../store/useAuthModal";

/**
 * Hook to protect routes that require authentication (e.g., Settings pages)
 * If user is not authenticated, opens auth modal and redirects to marketplace
 */
export function useProtectedRoute() {
	const { user, loading } = useSession((state) => state);
	const router = useRouter();
	const { openSignIn } = useAuthModal((state) => state.actions);

	useEffect(() => {
		if (!loading && !user) {
			console.log("🛡️ Protected route: User not authenticated, opening auth modal");
			openSignIn("access this page", window.location.pathname);
			router.push("/marketplace");
		}
	}, [user, loading, openSignIn, router]);

	return { user, loading };
}
