'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, MapPin, X, Info, Loader2 } from 'lucide-react';
import { callApi } from '@/app/libs/helper/callApi';
import { ApiResponse } from '@/app/types';
import { toast } from 'sonner';
import Image from 'next/image';
import { EVENT_CATEGORIES } from '@/app/constants/eventCategories';

// Event Schema
const eventSchema = z.object({
  title: z.string().min(3, 'Event title is required'),
  eventType: z.string().min(1, 'Please select an event type'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description must be less than 5000 characters'),
  startDate: z.string().nonempty('Start date is required'),
  endDate: z.string().nonempty('End date is required'),
  startTime: z.string().nonempty('Start time is required'),
  endTime: z.string().nonempty('End time is required'),
  venue: z.string().optional(),
  location: z.string().min(2, 'Location is required'),
  isFree: z.boolean(),
  currency: z.string().optional(),
  ticketPrice: z.string().optional(),
  totalTickets: z.string().optional(),
  visibility: z.string().nonempty('Visibility is required'),
  category: z.string().nonempty('Category is required'),
}).refine((data) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(data.startDate);
  return startDate >= today;
}, {
  message: 'Start date cannot be in the past',
  path: ['startDate'],
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return endDate >= startDate;
}, {
  message: 'End date cannot be before start date',
  path: ['endDate'],
}).refine((data) => {
  const today = new Date();
  const startDate = new Date(data.startDate);
  if (startDate.toDateString() === today.toDateString()) {
    const [startHours, startMinutes] = data.startTime.split(':').map(Number);
    const currentHours = today.getHours();
    const currentMinutes = today.getMinutes();
    if (startHours < currentHours || (startHours === currentHours && startMinutes < currentMinutes)) {
      return false;
    }
  }
  return true;
}, {
  message: 'Start time cannot be in the past',
  path: ['startTime'],
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  if (startDate.toDateString() === endDate.toDateString()) {
    const [startHours, startMinutes] = data.startTime.split(':').map(Number);
    const [endHours, endMinutes] = data.endTime.split(':').map(Number);
    const startTimeInMinutes = startHours * 60 + startMinutes;
    const endTimeInMinutes = endHours * 60 + endMinutes;
    return endTimeInMinutes > startTimeInMinutes;
  }
  return true;
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

type EventFormData = z.infer<typeof eventSchema>;

const SERVICE_FEE_PER_TICKET = 5;

interface AdminCreateEventFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminCreateEventForm({ onClose, onSuccess }: AdminCreateEventFormProps) {
  const [isFree, setIsFree] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [totalServiceFee, setTotalServiceFee] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      isFree: true,
      category: '',
      visibility: '',
      eventType: '',
      currency: 'USD',
    },
  });

  const watchedTotalTickets = watch('totalTickets');
  const descriptionLength = watch('description')?.length || 0;
  const watchedStartDate = watch('startDate');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!isFree && watchedTotalTickets) {
      const tickets = parseInt(watchedTotalTickets) || 0;
      const fee = tickets * SERVICE_FEE_PER_TICKET;
      setTotalServiceFee(fee);
    } else {
      setTotalServiceFee(0);
    }
  }, [watchedTotalTickets, isFree]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG)');
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    setSelectedImage(file);
  };

  const removeImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const onSubmit = async (data: EventFormData) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('eventType', data.eventType);
      formData.append('description', data.description);
      formData.append('startDate', data.startDate);
      formData.append('endDate', data.endDate);
      formData.append('startTime', data.startTime);
      formData.append('endTime', data.endTime);
      formData.append('venue', data.venue || '');
      formData.append('location', data.location);
      formData.append('isFree', String(data.isFree));
      formData.append('category', data.category);
      formData.append('visibility', data.visibility);

      if (!data.isFree) {
        formData.append('ticketPrice', data.ticketPrice || '0');
        formData.append('currency', data.currency || 'USD');
        formData.append('totalTickets', data.totalTickets || '0');
      }

      if (selectedImage) {
        formData.append('coverImage', selectedImage);
      }

      // Use admin endpoint - events created by admin go live immediately
      const { data: responseData, error } = await callApi<ApiResponse<any>>(
        '/admin/events',
        'POST',
        formData
      );

      if (error) {
        throw new Error(error.message || 'Failed to create event');
      }

      toast.success('Event created successfully and is now live!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create event');
      console.error('Create event error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create New Event</h2>
            <p className="text-sm text-gray-600">Events created by admins go live immediately</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
          {/* Event Details */}
          <section className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Event Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('title')}
                  type="text"
                  placeholder="e.g. Nigerian Independence Day Celebration"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Event Type <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('eventType')}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
                >
                  <option value="">Select event type</option>
                  <option value="networking">Networking</option>
                  <option value="workshop">Workshop</option>
                  <option value="conference">Conference</option>
                  <option value="social">Social Gathering</option>
                  <option value="cultural">Cultural Event</option>
                  <option value="business">Business Event</option>
                  <option value="educational">Educational</option>
                  <option value="other">Other</option>
                </select>
                {errors.eventType && (
                  <p className="text-red-500 text-xs mt-1">{errors.eventType.message}</p>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-gray-900">
                  Short Description <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-500">{descriptionLength}/5000 characters</span>
              </div>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Describe your event in a few sentences..."
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white resize-none"
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
              )}
            </div>
          </section>

          {/* Date & Time */}
          <section className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Date & Time</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('startDate')}
                  type="date"
                  min={today}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white cursor-pointer"
                />
                {errors.startDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('endDate')}
                  type="date"
                  min={watchedStartDate || today}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white cursor-pointer"
                />
                {errors.endDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('startTime')}
                  type="time"
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white cursor-pointer"
                />
                {errors.startTime && (
                  <p className="text-red-500 text-xs mt-1">{errors.startTime.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('endTime')}
                  type="time"
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white cursor-pointer"
                />
                {errors.endTime && (
                  <p className="text-red-500 text-xs mt-1">{errors.endTime.message}</p>
                )}
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Location</h3>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1.5">
                Venue Name
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('venue')}
                  type="text"
                  placeholder="e.g. Navy Pier Grand Ballroom (optional)"
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1.5">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                {...register('location')}
                type="text"
                placeholder="e.g. Chicago, IL"
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
              />
              {errors.location && (
                <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>
              )}
            </div>
          </section>

          {/* Event Media */}
          <section className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Event Media</h3>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1.5">
                Event Banner
              </label>

              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg h-52 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-gray-50 transition"
                >
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400">PNG, JPG or JPEG (Recommended: 1920x1080)</p>
                </div>
              ) : (
                <div className="relative border border-gray-200 rounded-lg overflow-hidden">
                  <Image
                    src={previewUrl}
                    alt="Event banner preview"
                    width={1920}
                    height={400}
                    className="w-full h-52 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </section>

          {/* Tickets / Registration */}
          <section className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Tickets / Registration</h3>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900">Event Type</p>
                <p className="text-xs text-gray-500">This is a paid event</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Free</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsFree(!isFree);
                    setValue('isFree', !isFree);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    !isFree ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      !isFree ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-gray-700">Paid</span>
              </div>
            </div>

            {!isFree && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">
                      Currency <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('currency')}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="NGN">NGN (N)</option>
                      <option value="GBP">GBP (P)</option>
                      <option value="EUR">EUR (E)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">
                      Ticket Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('ticketPrice')}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">
                      Number of Seats Available <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('totalTickets')}
                      type="number"
                      min="1"
                      placeholder="e.g. 100"
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Service Fee Info */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <div className="flex gap-2">
                    <Info className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Chicago Nigerians earns a $5 service fee from this event.
                      </p>
                      {watchedTotalTickets && parseInt(watchedTotalTickets) > 0 && (
                        <div className="mt-2 text-xs text-gray-600 space-y-1">
                          <p>Number of tickets: {watchedTotalTickets}</p>
                          <p>Service fee: ${SERVICE_FEE_PER_TICKET} per ticket</p>
                          <p className="font-medium text-gray-900">
                            Total service fee: ${totalServiceFee.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>

          {/* Visibility & Category */}
          <section className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Visibility & Category</h3>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1.5">
                Visibility <span className="text-red-500">*</span>
              </label>
              <select
                {...register('visibility')}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
              >
                <option value="">Select visibility</option>
                <option value="public">Public - Anyone can view and join</option>
                <option value="private">Private - Invite only</option>
              </select>
              {errors.visibility && (
                <p className="text-red-500 text-xs mt-1">{errors.visibility.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">Select one category that best describes your event</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                {EVENT_CATEGORIES.filter(cat => cat !== 'All Events').map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-emerald-500 hover:bg-gray-50 transition"
                  >
                    <input
                      type="radio"
                      value={cat}
                      {...register('category')}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">{cat}</span>
                  </label>
                ))}
              </div>
              {errors.category && (
                <p className="text-red-500 text-xs mt-2">{errors.category.message}</p>
              )}
            </div>
          </section>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Event...
                </>
              ) : (
                'Create Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
