import { Eye, Package, TrendingUp, Users } from "lucide-react";

export default async function MarketplaceStats() {
  return (
    <div className="py-2">
      <div className="gap-3 md:min-w-0 grid grid-cols-2 lg:grid-cols-4 md:gap-4">
        <div className="p-4 rounded-lg bg-white flex items-center gap-4 min-w-[140px]">
          <div className="flex-1">
            <p className="font-bold text-lg">156</p>
            <p className="text-xs text-gray-600">Active Listings</p>
          </div>
          <div className="bg-[var(--primary-color)]/10 p-2 rounded-xl">
            <Package className="text-[var(--primary-color)] w-5 h-5" />
          </div>
        </div>
        <div className="p-4 rounded-lg bg-white flex items-center gap-4 min-w-[140px]">
          <div className="flex-1">
            <p className="font-bold text-lg">12.4k</p>
            <p className="text-xs text-gray-600">Total Views</p>
          </div>
          <div className="bg-[var(--blue-color)]/10 p-2 rounded-xl">
            <Eye className="text-[var(--blue-color)] w-5 h-5" />
          </div>
        </div>
        <div className="p-4 rounded-lg bg-white flex items-center gap-4 min-w-[140px]">
          <div className="flex-1">
            <p className="font-bold text-lg">89</p>
            <p className="text-xs text-gray-600">Active Sellers</p>
          </div>
          <div className="bg-[var(--purple-color)]/10 p-2 rounded-xl">
            <Users className="text-[var(--purple-color)] w-5 h-5" />
          </div>
        </div>
        <div className="p-4 rounded-lg bg-white flex items-center gap-4 min-w-[140px]">
          <div className="flex-1">
            <p className="font-bold text-lg">2hrs</p>
            <p className="text-xs text-gray-600">Avg. Response</p>
          </div>
          <div className="bg-[var(--orange-color)]/10 p-2 rounded-xl">
            <TrendingUp className="text-[var(--orange-color)] w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
