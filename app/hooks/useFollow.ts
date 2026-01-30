"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@/app/services";
import { toast } from "sonner";
import { IUserProfile, IFollowUser } from "@/app/types";
import { useSession } from "@/app/store/useSession";

// Hook for following a user
export function useFollowUser() {
  const queryClient = useQueryClient();
  const { user } = useSession((state) => state);
  const currentUserId = user?._id || (user as any)?.id;

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await User.followUser(userId);
      if (response.error) throw new Error(response.error.message);
      return { userId, followerCount: response.data?.data?.followerCount };
    },
    onMutate: async (userId) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ["userProfile", userId] });
      await queryClient.cancelQueries({ queryKey: ["suggestedUsers"] });

      // Snapshot previous values
      const previousProfile = queryClient.getQueryData<IUserProfile>(["userProfile", userId]);

      // Optimistically update the profile
      if (previousProfile) {
        queryClient.setQueryData<IUserProfile>(["userProfile", userId], {
          ...previousProfile,
          isFollowing: true,
          _count: {
            ...previousProfile._count,
            followers: previousProfile._count.followers + 1,
          },
        });
      }

      return { previousProfile };
    },
    onError: (error, userId, context) => {
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(["userProfile", userId], context.previousProfile);
      }
      toast.error(error.message || "Failed to follow user");
    },
    onSuccess: (data) => {
      toast.success("Following!");
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["followers", data.userId] });
      // Invalidate posts feed so all posts by this author update their follow state
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      // Invalidate current user's following list and profile
      if (currentUserId) {
        queryClient.invalidateQueries({ queryKey: ["following", currentUserId] });
        queryClient.invalidateQueries({ queryKey: ["userProfile", currentUserId] });
      }
    },
  });
}

// Hook for unfollowing a user
export function useUnfollowUser() {
  const queryClient = useQueryClient();
  const { user } = useSession((state) => state);
  const currentUserId = user?._id || (user as any)?.id;

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await User.unfollowUser(userId);
      if (response.error) throw new Error(response.error.message);
      return { userId, followerCount: response.data?.data?.followerCount };
    },
    onMutate: async (userId) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ["userProfile", userId] });
      await queryClient.cancelQueries({ queryKey: ["following", currentUserId] });

      // Snapshot previous values
      const previousProfile = queryClient.getQueryData<IUserProfile>(["userProfile", userId]);

      // Optimistically update the profile
      if (previousProfile) {
        queryClient.setQueryData<IUserProfile>(["userProfile", userId], {
          ...previousProfile,
          isFollowing: false,
          _count: {
            ...previousProfile._count,
            followers: Math.max(0, previousProfile._count.followers - 1),
          },
        });
      }

      return { previousProfile };
    },
    onError: (error, userId, context) => {
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(["userProfile", userId], context.previousProfile);
      }
      toast.error(error.message || "Failed to unfollow user");
    },
    onSuccess: (data) => {
      toast.success("Unfollowed");
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["followers", data.userId] });
      // Invalidate posts feed so all posts by this author update their follow state
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      // Invalidate current user's following list and profile
      if (currentUserId) {
        queryClient.invalidateQueries({ queryKey: ["following", currentUserId] });
        queryClient.invalidateQueries({ queryKey: ["userProfile", currentUserId] });
      }
    },
  });
}

// Combined hook for toggling follow state
export function useToggleFollow() {
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  return {
    toggle: (userId: string, isCurrentlyFollowing: boolean) => {
      if (isCurrentlyFollowing) {
        unfollowMutation.mutate(userId);
      } else {
        followMutation.mutate(userId);
      }
    },
    isPending: followMutation.isPending || unfollowMutation.isPending,
  };
}
