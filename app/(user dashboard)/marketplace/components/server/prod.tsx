"use client";

import { Heart } from "lucide-react";

import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

import { PostCard, PostCardSkeleton } from "../client/postCard";
import { useListing } from "@/app/hooks/useListing";

export default function MarketplaceProducts() {
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
  } = useListing();

  useEffect(() => {
    console.log("hasNextPage: ", hasNextPage);

    if (inView && hasNextPage && !isFetchingNextPage) {
      const meta = data?.pages[data.pages.length - 1].data?.data.meta;

      const nextPage = Number(meta?.page) + 1;

      console.log("infinite query: ", nextPage);

      fetchNextPage({ pageParam: { page: nextPage } } as never);
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage, data?.pages]);

  console.log("infinite query: ", data);

  const allPosts = data?.pages.flatMap((page) => page?.data?.data.data) || [];

  if (status === "pending") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <PostCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Render error state
  if (status === "error" && error) {
    return <ErrorMessage error={error} />;
  }

  // Render empty state
  if (allPosts.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {allPosts.map((post) => {
          if (!post) return null;
          return <PostCard key={post?._id} post={post!} />;
        })}
      </div>

      {/* Loading indicator and intersection observer target */}
      <div ref={ref} className="mt-8">
        {isFetchingNextPage && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {Array.from({ length: 2 }).map((_, index) => (
              <PostCardSkeleton key={index} />
            ))}
          </div>
        )}

        {!hasNextPage && allPosts.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            You&apos;ve reached the end of the list
          </div>
        )}
      </div>
    </>
  );
}

const ErrorMessage = ({ error }: { error: Error }) => (
  <div className="text-center py-8 text-red-600">
    <p>Error loading posts: {error.message}</p>
    <button
      onClick={() => window.location.reload()}
      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
    >
      Retry
    </button>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-12">
    <div className="text-gray-400 mb-4">
      <Heart className="w-16 h-16 mx-auto" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
    <p className="text-gray-500">Check back later for new marketplace items.</p>
  </div>
);
