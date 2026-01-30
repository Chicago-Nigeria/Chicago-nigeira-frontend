"use client";

import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useSuggestedUsers } from "@/app/hooks/useUserProfile";
import FollowButton from "./FollowButton";
import { useSession } from "@/app/store/useSession";

interface SuggestedUsersProps {
  limit?: number;
}

// Array of colors for avatar backgrounds
const avatarColors = [
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-teal-100", text: "text-teal-700" },
  { bg: "bg-pink-100", text: "text-pink-700" },
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-orange-100", text: "text-orange-700" },
  { bg: "bg-indigo-100", text: "text-indigo-700" },
];

function getAvatarColor(index: number) {
  return avatarColors[index % avatarColors.length];
}

export default function SuggestedUsers({ limit = 5 }: SuggestedUsersProps) {
  const { user } = useSession((state) => state);
  const { data: suggestions, isLoading, isError } = useSuggestedUsers(limit);

  // Don't show if user is not logged in
  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (isError || !suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3">
        <h3 className="font-semibold text-gray-900">You might know</h3>
      </div>

      <div className="px-4 pb-3 space-y-3">
        {suggestions.map((suggestion, index) => {
          const color = getAvatarColor(index);
          return (
            <div
              key={suggestion.id}
              className="flex items-center gap-3"
            >
              <Link href={`/profile/${suggestion.id}`} className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  {suggestion.photo ? (
                    <Image
                      src={suggestion.photo}
                      alt={`${suggestion.firstName} ${suggestion.lastName}`}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${color.bg} ${color.text} text-sm font-semibold`}>
                      {suggestion.firstName[0]}
                      {suggestion.lastName[0]}
                    </div>
                  )}
                </div>
              </Link>

              <Link href={`/profile/${suggestion.id}`} className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate hover:underline">
                  {suggestion.firstName} {suggestion.lastName}
                </p>
                {suggestion.profession && (
                  <p className="text-xs text-gray-500 truncate">
                    {suggestion.profession}
                  </p>
                )}
              </Link>

              <FollowButton
                userId={suggestion.id}
                isFollowing={suggestion.isFollowing || false}
                variant="compact"
              />
            </div>
          );
        })}
      </div>

      {suggestions.length >= limit && (
        <div className="px-4 py-3 border-t border-gray-100">
          <button className="text-sm text-[var(--primary-color)] hover:underline font-medium">
            Show more
          </button>
        </div>
      )}
    </div>
  );
}
