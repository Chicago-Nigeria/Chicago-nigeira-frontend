export const EVENT_CATEGORIES = [
  "All Events",
  "Networking",
  "Social",
  "Professional",
  "Cultural",
  "Music",
  "Business",
  "Community",
  "Education",
  "Sports",
  "Arts & Entertainment",
  "Food & Dining",
  "Health & Wellness",
  "Technology",
  "Workshop",
  "Conference",
  "Charity & Causes",
  "Family & Kids",
  "Other"
] as const;

export type EventCategory = typeof EVENT_CATEGORIES[number];
