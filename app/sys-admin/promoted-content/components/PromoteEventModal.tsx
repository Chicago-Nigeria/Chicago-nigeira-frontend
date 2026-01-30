'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Search, Loader2, Calendar, MapPin } from 'lucide-react';
import { callApi } from '@/app/libs/helper/callApi';
import { AdminPromoted } from '@/app/services';
import { ApiResponse } from '@/app/types';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  coverImage?: string;
  isFree: boolean;
  ticketPrice?: number;
  status: string;
  organizer: {
    firstName: string;
    lastName: string;
  };
}

interface PromoteEventModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function PromoteEventModal({ onClose, onSuccess }: PromoteEventModalProps) {
  const [search, setSearch] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [priority, setPriority] = useState(5);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [search]);

  const fetchEvents = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      limit: '20',
      status: 'upcoming',
      ...(search && { search }),
    });

    const { data, error } = await callApi<ApiResponse<Event[]>>(
      `/admin/events?${params}`,
      'GET'
    );

    if (!error && data) {
      setEvents(data.data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEvent) {
      toast.error('Please select an event to promote');
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await AdminPromoted.create({
      eventId: selectedEvent.id,
      priority,
      startDate: new Date(startDate).toISOString(),
      ...(endDate && { endDate: new Date(endDate).toISOString() }),
    });

    if (error) {
      toast.error(error.message || 'Failed to promote event');
    } else {
      toast.success('Event promoted successfully');
      onSuccess();
      onClose();
    }

    setIsSubmitting(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Promote Event</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Search Events */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Event to Promote
            </label>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Events List */}
            <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No upcoming events found
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {events.map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => setSelectedEvent(event)}
                      className={`w-full p-3 text-left hover:bg-gray-50 transition flex items-start gap-3 ${
                        selectedEvent?.id === event.id ? 'bg-emerald-50 border-l-4 border-emerald-500' : ''
                      }`}
                    >
                      {event.coverImage ? (
                        <Image
                          src={event.coverImage}
                          alt={event.title}
                          width={64}
                          height={48}
                          className="rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{event.title}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDate(event.startDate)} | {event.isFree ? 'Free' : `$${event.ticketPrice}`}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Event Preview */}
          {selectedEvent && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-sm font-medium text-emerald-800 mb-2">Selected Event:</p>
              <p className="font-semibold text-gray-900">{selectedEvent.title}</p>
              <p className="text-sm text-gray-600 mt-1">{selectedEvent.location}</p>
              <p className="text-sm text-gray-500 mt-1">
                {formatDate(selectedEvent.startDate)} | Organizer: {selectedEvent.organizer.firstName} {selectedEvent.organizer.lastName}
              </p>
            </div>
          )}

          {/* Promotion Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value) || 5)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Higher priority = shown first</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date (optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedEvent}
              className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Promoting...
                </>
              ) : (
                'Promote Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
