"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSession } from "@/app/store/useSession";
import { useUserProfile } from "@/app/hooks/useUserProfile";
import ProfileHeader from "./components/ProfileHeader";
import ProfileTabs from "./components/ProfileTabs";
import { useAuthModal } from "@/app/store/useAuthModal";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession((state) => state);
  const { openSignIn } = useAuthModal((state) => state.actions);

  // Get the user's ID (handle both _id and id)
  const userId = user?._id || (user as any)?.id;

  const {
    data: profile,
    isLoading: profileLoading,
    isError,
  } = useUserProfile(userId || null);

  // If not logged in, show sign in prompt
  useEffect(() => {
    if (!sessionLoading && !user) {
      openSignIn("view your profile", "/profile");
      router.push("/feeds");
    }
  }, [sessionLoading, user, openSignIn, router]);

  // Show loading state
  if (sessionLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // If no user or error, don't render
  if (!user || !profile) {
    return null;
  }

  return (
    <div className="space-y-6">
      <ProfileHeader profile={profile} isOwnProfile={true} />
      <ProfileTabs userId={profile.id} isOwnProfile={true} />
    </div>
  );
}
