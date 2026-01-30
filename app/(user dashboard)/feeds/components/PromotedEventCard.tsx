'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Clock, Megaphone } from 'lucide-react';
import { IPromotedContent } from '@/app/types';
import { Feed } from '@/app/services';

interface PromotedEventCardProps {
  promotedContent: IPromotedContent;
}

export default function PromotedEventCard({ promotedContent }: PromotedEventCardProps) {
  const [hasRecordedImpression, setHasRecordedImpression] = useState(false);
  const router = useRouter();

  const event = promotedContent.event;

  useEffect(() => {
    // Record impression when component mounts
    if (!hasRecordedImpression && promotedContent.id) {
      Feed.recordImpression(promotedContent.id);
      setHasRecordedImpression(true);
    }
  }, [promotedContent.id, hasRecordedImpression]);

  const handleClick = () => {
    // Record click when navigating to event
    Feed.recordClick(promotedContent.id);
  };

  const handleRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Record click and redirect to event page
    Feed.recordClick(promotedContent.id);
    router.push(`/events/${event?.id}`);
  };

  if (!event) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Event Cover Image */}
      <Link href={`/events/${event.id}`} onClick={handleClick}>
        <div className="relative w-full h-48 bg-gray-100">
          {event.coverImage ? (
            <Image
              src={event.coverImage}
              alt={event.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-400 to-emerald-600">
              <Calendar className="h-12 w-12 text-white/80" />
            </div>
          )}

          {/* Sponsored Badge - Top Right Pill */}
          <div className="absolute top-3 right-3 px-3 py-1 bg-emerald-600 rounded-full flex items-center gap-1.5 shadow-md">
            <Megaphone className="h-3.5 w-3.5 text-white" />
            <span className="text-xs font-medium text-white">Sponsored</span>
          </div>
        </div>
      </Link>

      {/* Event Details */}
      <div className="p-4">
        <Link href={`/events/${event.id}`} onClick={handleClick}>
          <h3 className="font-semibold text-gray-900 text-lg line-clamp-2 hover:text-emerald-600 transition">
            {event.title}
          </h3>
        </Link>

        {event.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="mt-4 space-y-2">
          {/* Date */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span>{formatDate(event.startDate)}</span>
          </div>

          {/* Time */}
          {event.startTime && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>{formatTime(event.startTime)}</span>
            </div>
          )}

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>

        {/* Price & Register Button */}
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-lg font-semibold">
            {event.isFree ? (
              <span className="text-emerald-600">Free</span>
            ) : (
              <span className="text-gray-900">${event.ticketPrice}</span>
            )}
          </div>

          <button
            onClick={handleRegister}
            className="px-5 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition"
          >
            {event.isFree ? 'Register' : 'Get Tickets'}
          </button>
        </div>
      </div>
    </div>
  );
}
