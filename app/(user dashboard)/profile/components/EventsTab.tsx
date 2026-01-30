"use client";

import { useRef, useCallback } from "react";
import Link from "next/link";
import { Loader2, Calendar, BarChart2 } from "lucide-react";
import { useUserEvents } from "@/app/hooks/useUserProfile";
import EventCard from "@/app/(user dashboard)/events/event-components/eventCard";

interface EventsTabProps {
  userId: string;
  isOwnProfile: boolean;
}

export default function EventsTab({ userId, isOwnProfile }: EventsTabProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useUserEvents(userId);

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

  const allEvents = data?.pages.flatMap((page) => page.data) || [];

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
        <p className="text-gray-500">Failed to load events</p>
      </div>
    );
  }

  if (allEvents.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <h3 className="text-base font-medium text-gray-900 mb-1">No events yet</h3>
        <p className="text-sm text-gray-500">
          Events hosted by this user will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {allEvents.map((event: any) => (
        <div key={event.id} className="relative">
          <EventCard event={event} />
          {/* Analytics link for own profile */}
          {isOwnProfile && (
            <div className="absolute top-3 right-14">
              <Link
                href={`/events/my-events?eventId=${event.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-black/50 hover:bg-black/70 rounded-full transition backdrop-blur-sm"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Analytics</span>
              </Link>
            </div>
          )}
        </div>
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
