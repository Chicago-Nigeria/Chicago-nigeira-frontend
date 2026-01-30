"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserX } from "lucide-react";
import { useSession } from "@/app/store/useSession";
import { useUserProfile } from "@/app/hooks/useUserProfile";
import ProfileHeader from "../components/ProfileHeader";
import ProfileTabs from "../components/ProfileTabs";

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default function UserProfilePage({ params }: ProfilePageProps) {
  const { userId } = use(params);
  const router = useRouter();
  const { user } = useSession((state) => state);

  // Get current user's ID
  const currentUserId = user?._id || (user as any)?.id;

  // If viewing own profile, redirect to /profile
  if (currentUserId && currentUserId === userId) {
    router.replace("/profile");
    return null;
  }

  const {
    data: profile,
    isLoading,
    isError,
  } = useUserProfile(userId);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Show error state
  if (isError || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <UserX className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          User not found
        </h2>
        <p className="text-gray-500 mb-6 max-w-sm">
          The user you're looking for doesn't exist or may have been removed.
        </p>
        <button
          onClick={() => router.push("/feeds")}
          className="px-5 py-2.5 bg-[var(--primary-color)] text-white text-sm font-medium rounded-lg hover:bg-[var(--primary-color)]/90 transition"
        >
          Go to Feeds
        </button>
      </div>
    );
  }

  const isOwnProfile = profile.isOwnProfile || false;

  return (
    <div className="space-y-6">
      <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />
      <ProfileTabs userId={profile.id} isOwnProfile={isOwnProfile} />
    </div>
  );
}
