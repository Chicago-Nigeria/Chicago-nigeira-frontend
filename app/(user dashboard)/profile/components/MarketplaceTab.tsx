"use client";

import { ShoppingBag, Clock } from "lucide-react";

export default function MarketplaceTab() {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <ShoppingBag className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Marketplace Coming Soon
      </h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">
        We're working on bringing marketplace listings to user profiles.
        Check back soon to see items for sale from this user.
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
        <Clock className="w-4 h-4" />
        <span>Feature in development</span>
      </div>
    </div>
  );
}
