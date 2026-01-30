"use client";

import { useToggleFollow } from "@/app/hooks/useFollow";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { motion } from "framer-motion";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  variant?: "default" | "compact";
  className?: string;
}

export default function FollowButton({
  userId,
  isFollowing,
  variant = "default",
  className = "",
}: FollowButtonProps) {
  const { toggle, isPending } = useToggleFollow();
  const { requireAuth } = useAuthGuard();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    requireAuth(() => {
      toggle(userId, isFollowing);
    }, isFollowing ? "unfollow this user" : "follow this user");
  };

  if (variant === "compact") {
    return (
      <motion.button
        onClick={handleClick}
        disabled={isPending}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all border ${
          isFollowing
            ? "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 border-gray-200"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
        } ${className}`}
      >
        {isPending ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : isFollowing ? (
          "Following"
        ) : (
          "Follow"
        )}
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={handleClick}
      disabled={isPending}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${
        isFollowing
          ? "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200"
          : "bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90"
      } ${className}`}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="w-4 h-4" />
          <span>Following</span>
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          <span>Follow</span>
        </>
      )}
    </motion.button>
  );
}
