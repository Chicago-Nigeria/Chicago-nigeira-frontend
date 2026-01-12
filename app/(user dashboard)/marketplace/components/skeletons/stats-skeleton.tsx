import { Eye, Package, TrendingUp, Users } from "lucide-react";

export default function MarketplaceStatsSkeleton() {
  return (
    <div className="py-2">
      <div className="gap-3 md:min-w-0 grid grid-cols-2 lg:grid-cols-4 md:gap-4">
        {/* Stat Card 1 Skeleton */}
        <div className="p-4 rounded-lg bg-white flex items-center gap-4 min-w-[140px] animate-pulse">
          <div className="flex-1">
            <div className="w-12 h-6 bg-gray-200 rounded mb-1"></div>
            <div className="w-20 h-3 bg-gray-200 rounded"></div>
          </div>
          <div className="bg-gray-200 p-2 rounded-xl">
            <Package className="text-gray-300 w-5 h-5" />
          </div>
        </div>

        {/* Stat Card 2 Skeleton */}
        <div className="p-4 rounded-lg bg-white flex items-center gap-4 min-w-[140px] animate-pulse">
          <div className="flex-1">
            <div className="w-16 h-6 bg-gray-200 rounded mb-1"></div>
            <div className="w-20 h-3 bg-gray-200 rounded"></div>
          </div>
          <div className="bg-gray-200 p-2 rounded-xl">
            <Eye className="text-gray-300 w-5 h-5" />
          </div>
        </div>

        {/* Stat Card 3 Skeleton */}
        <div className="p-4 rounded-lg bg-white flex items-center gap-4 min-w-[140px] animate-pulse">
          <div className="flex-1">
            <div className="w-8 h-6 bg-gray-200 rounded mb-1"></div>
            <div className="w-20 h-3 bg-gray-200 rounded"></div>
          </div>
          <div className="bg-gray-200 p-2 rounded-xl">
            <Users className="text-gray-300 w-5 h-5" />
          </div>
        </div>

        {/* Stat Card 4 Skeleton */}
        <div className="p-4 rounded-lg bg-white flex items-center gap-4 min-w-[140px] animate-pulse">
          <div className="flex-1">
            <div className="w-10 h-6 bg-gray-200 rounded mb-1"></div>
            <div className="w-24 h-3 bg-gray-200 rounded"></div>
          </div>
          <div className="bg-gray-200 p-2 rounded-xl">
            <TrendingUp className="text-gray-300 w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}