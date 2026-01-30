"use client";

import { useRef, useCallback } from "react";
import { Loader2, FileText } from "lucide-react";
import { useUserPosts } from "@/app/hooks/useUserProfile";
import PostCard from "@/app/(user dashboard)/feeds/components/PostCard";

interface PostsTabProps {
  userId: string;
}

export default function PostsTab({ userId }: PostsTabProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useUserPosts(userId);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  const allPosts = data?.pages.flatMap((page) => page.data) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load posts</p>
      </div>
    );
  }

  if (allPosts.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <h3 className="text-base font-medium text-gray-900 mb-1">No posts yet</h3>
        <p className="text-sm text-gray-500">
          Posts will appear here once they start sharing.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {allPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {/* Load more trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="py-4 text-center">
          {isFetchingNextPage && (
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
          )}
        </div>
      )}
    </div>
  );
}
