"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { User } from "@/app/services";
import { IUserProfile, IPost, IFollowUser } from "@/app/types";

// Hook to fetch a user's public profile
export function useUserProfile(userId: string | null) {
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await User.getPublicProfile(userId);
      if (response.error) throw new Error(response.error.message);
      return response.data?.data as IUserProfile;
    },
    enabled: !!userId,
  });
}

// Hook to fetch user's posts with infinite scroll
export function useUserPosts(userId: string | null) {
  return useInfiniteQuery({
    queryKey: ["userPosts", userId],
    queryFn: async ({ pageParam }) => {
      if (!userId) return { data: [], meta: { hasMore: false, nextCursor: null } };
      const response = await User.getUserPosts(userId, {
        cursor: pageParam as string | undefined,
        limit: 10,
      });
      if (response.error) throw new Error(response.error.message);
      return {
        data: response.data?.data as IPost[],
        meta: response.data?.meta,
      };
    },
    getNextPageParam: (lastPage) => lastPage.meta?.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!userId,
  });
}

// Hook to fetch user's events
export function useUserEvents(userId: string | null) {
  return useInfiniteQuery({
    queryKey: ["userEvents", userId],
    queryFn: async ({ pageParam }) => {
      if (!userId) return { data: [], meta: { hasMore: false, nextCursor: null } };
      const response = await User.getUserEvents(userId, {
        cursor: pageParam as string | undefined,
        limit: 10,
      });
      if (response.error) throw new Error(response.error.message);
      return {
        data: response.data?.data || [],
        meta: response.data?.meta,
      };
    },
    getNextPageParam: (lastPage) => lastPage.meta?.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!userId,
  });
}

// Hook to fetch user's followers
export function useFollowers(userId: string | null) {
  return useInfiniteQuery({
    queryKey: ["followers", userId],
    queryFn: async ({ pageParam }) => {
      if (!userId) return { data: [], meta: { hasMore: false, nextCursor: null } };
      const response = await User.getFollowers(userId, {
        cursor: pageParam as string | undefined,
        limit: 20,
      });
      if (response.error) throw new Error(response.error.message);
      return {
        data: response.data?.data as IFollowUser[],
        meta: response.data?.meta,
      };
    },
    getNextPageParam: (lastPage) => lastPage.meta?.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!userId,
  });
}

// Hook to fetch user's following
export function useFollowing(userId: string | null) {
  return useInfiniteQuery({
    queryKey: ["following", userId],
    queryFn: async ({ pageParam }) => {
      if (!userId) return { data: [], meta: { hasMore: false, nextCursor: null } };
      const response = await User.getFollowing(userId, {
        cursor: pageParam as string | undefined,
        limit: 20,
      });
      if (response.error) throw new Error(response.error.message);
      return {
        data: response.data?.data as IFollowUser[],
        meta: response.data?.meta,
      };
    },
    getNextPageParam: (lastPage) => lastPage.meta?.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!userId,
  });
}

// Hook to fetch suggested users
export function useSuggestedUsers(limit?: number) {
  return useQuery({
    queryKey: ["suggestedUsers", limit],
    queryFn: async () => {
      const response = await User.getSuggestions(limit);
      if (response.error) throw new Error(response.error.message);
      return response.data?.data as IFollowUser[];
    },
  });
}
