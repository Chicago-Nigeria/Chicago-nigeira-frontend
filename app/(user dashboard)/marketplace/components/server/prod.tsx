"use client";

import { Heart, Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { PostCard, PostCardSkeleton } from "../client/postCard";
import { useListing, ListingFilters } from "@/app/hooks/useListing";

interface MarketplaceProductsProps {
  filters?: ListingFilters;
}

export default function MarketplaceProducts({ filters }: MarketplaceProductsProps) {
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useListing(filters);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allPosts = data?.pages.flatMap((page) => page?.data?.data?.data) || [];

  if (status === "pending") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <PostCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (status === "error" && error) {
    return <ErrorMessage error={error} />;
  }

  if (allPosts.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {allPosts.map((post) => {
          if (!post) return null;
          return <PostCard key={post?.id} post={post!} />;
        })}
      </div>

      {/* Load More Section */}
      <div ref={ref} className="mt-6">
        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--primary-color)]" />
          </div>
        )}

        {hasNextPage && !isFetchingNextPage && (
          <div className="flex justify-center">
            <button
              onClick={() => fetchNextPage()}
              className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Load More Listings
            </button>
          </div>
        )}

        {!hasNextPage && allPosts.length > 0 && (
          <div className="text-center py-6 text-sm text-gray-500">
            You&apos;ve reached the end of the listings
          </div>
        )}
      </div>
    </>
  );
}

const ErrorMessage = ({ error }: { error: Error }) => (
  <div className="text-center py-12 bg-white rounded-xl">
    <p className="text-red-600 mb-4">Error loading listings: {error.message}</p>
    <button
      onClick={() => window.location.reload()}
      className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-color)]/90 transition-colors"
    >
      Retry
    </button>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-16 bg-white rounded-xl">
    <div className="text-gray-300 mb-4">
      <Heart className="w-16 h-16 mx-auto" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
    <p className="text-gray-500 text-sm">Check back later for new marketplace items.</p>
  </div>
);
