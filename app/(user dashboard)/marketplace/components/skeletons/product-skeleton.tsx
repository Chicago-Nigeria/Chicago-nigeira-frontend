import { Eye, Heart, MapPin, Star } from "lucide-react";

export default function MarketplaceProductsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="rounded-xl overflow-hidden border bg-white border-gray-200"
          style={{
            animationDelay: `${index * 100}ms`,
            animationDuration: '1.5s',
            animationFillMode: 'both',
            animationIterationCount: 'infinite',
            animationName: 'pulse'
          }}
        >
          {/* Image Skeleton */}
          <div className="h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 relative">
            <div className="w-full h-full bg-gray-300" />
          </div>
          
          <div className="p-3 space-y-3">
            {/* Tag and Price Skeleton */}
            <div className="flex justify-between items-start gap-2">
              <div className="w-16 h-6 bg-gray-200 rounded-md" />
              <div className="w-12 h-5 bg-gray-200 rounded" />
            </div>

            {/* Title Skeleton */}
            <div className="space-y-2">
              <div className="w-3/4 h-4 bg-gray-200 rounded" />
              <div className="w-1/2 h-4 bg-gray-200 rounded" />
            </div>

            {/* User Info Skeleton */}
            <div className="flex items-center gap-2 pt-1">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-1">
                <div className="w-24 h-3 bg-gray-200 rounded" />
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-300" />
                  <div className="w-16 h-3 bg-gray-200 rounded" />
                </div>
              </div>
            </div>

            {/* Rating and Stats Skeleton */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3 h-3 text-gray-300 fill-gray-300"
                    />
                  ))}
                </div>
                <div className="w-8 h-3 bg-gray-200 rounded ml-1" />
              </div>

              <div className="flex items-center gap-3 text-gray-300">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <div className="w-6 h-3 bg-gray-200 rounded" />
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <div className="w-6 h-3 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}