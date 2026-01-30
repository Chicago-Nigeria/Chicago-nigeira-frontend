"use client";

import { useState } from "react";
import PostsTab from "./PostsTab";
import EventsTab from "./EventsTab";
import MarketplaceTab from "./MarketplaceTab";
import SuggestedUsers from "./SuggestedUsers";

interface ProfileTabsProps {
  userId: string;
  isOwnProfile: boolean;
}

type TabType = "posts" | "events" | "marketplace";

const tabs: { id: TabType; label: string }[] = [
  { id: "posts", label: "Post" },
  { id: "events", label: "Events" },
  { id: "marketplace", label: "Marketplace" },
];

export default function ProfileTabs({ userId, isOwnProfile }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("posts");

  return (
    <div>
      {/* Tab Navigation - Full width with rounded border and padding */}
      <div className="border border-gray-200 rounded-full p-1.5 bg-gray-100">
        <div className="flex">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-full transition-all ${
                  isActive
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "posts" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
            {/* Posts Feed */}
            <div>
              <PostsTab userId={userId} />
            </div>
            {/* Suggested Users */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <SuggestedUsers limit={5} />
              </div>
            </aside>
          </div>
        )}
        {activeTab === "events" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
            {/* Events Feed */}
            <div>
              <EventsTab userId={userId} isOwnProfile={isOwnProfile} />
            </div>
            {/* Suggested Users */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <SuggestedUsers limit={5} />
              </div>
            </aside>
          </div>
        )}
        {activeTab === "marketplace" && <MarketplaceTab />}
      </div>
    </div>
  );
}
