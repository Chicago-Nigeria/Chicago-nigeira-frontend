"use client";
import TestUserProfile from "@/app/components/testUserProfile";
import PageInConstruction from "../components/construction";
import { Loader } from "@/app/components/fieldError";
import { useEffect, useState } from "react";
import { useSessionState } from "@/app/store/useSession";
export default function Messages() {
	const { user, loading } = useSessionState((state) => state);
	const { fetchFullUserProfile } = useSessionState((state) => state.actions);
	const [hasTriedFullFetch, setHasTriedFullFetch] = useState(false);

	// Auto-fetch full profile when page loads (optional)
	useEffect(() => {
		const fetchFullProfileIfNeeded = async () => {
			if (user?._id && !("email" in user) && !hasTriedFullFetch) {
				try {
					console.log("🔄 Auto-fetching full profile...");
					await fetchFullUserProfile();
					setHasTriedFullFetch(true);
				} catch (error) {
					console.log("⚠️ Auto-fetch failed, will try manually");
				}
			}
		};

		fetchFullProfileIfNeeded();
	}, [user, fetchFullUserProfile, hasTriedFullFetch]);

	if (loading) {
		return <Loader />;
	}

	return (
		<>
			<TestUserProfile />
			<PageInConstruction />
		</>
	);
}
