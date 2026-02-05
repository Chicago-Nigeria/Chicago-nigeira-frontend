"use client";

import { useRef, useCallback } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { useUserListings } from "@/app/hooks/useUserProfile";
import { PostCard } from "@/app/(user dashboard)/marketplace/components/client/postCard";
import { IListing } from "@/app/types";

interface MarketplaceTabProps {
  userId: string;
}

export default function MarketplaceTab({ userId }: MarketplaceTabProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useUserListings(userId);

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

  const allListings = data?.pages.flatMap((page) => page.data) || [];

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
        <p className="text-gray-500">Failed to load listings</p>
      </div>
    );
  }

  if (allListings.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <h3 className="text-base font-medium text-gray-900 mb-1">No listings yet</h3>
        <p className="text-sm text-gray-500">
          Marketplace listings will appear here once they start selling.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1 per row on mobile, 2 per row on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
        {allListings.map((listing: IListing) => (
          <PostCard key={listing.id || listing._id} post={listing} />
        ))}
      </div>

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
