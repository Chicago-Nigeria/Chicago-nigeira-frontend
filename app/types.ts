export type EventStatus = "pending" | "approved" | "rejected" | "upcoming" | "active" | "ongoing" | "completed";
export type FormValues = {
  email: string;
  password: string;
};
export type Event = {
  id?: string;
  eventName: string;
  eventStatus?: EventStatus;
  numberOfAttendees: number;
  daysOfWeek: string;
  date: string;
};
export type HostedEvent = Omit<Event, "date">;
export type PastEvent = Omit<Event, "eventStatus" | "daysOfWeek"> & { id?: string };
export type AttendingEvent = Omit<
  Event,
  "eventStatus" | "daysOfWeek" | "numberOfAttending"
> & { id?: string };
export type EventCardData = {
  id?: string;
  imageSrc: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  host: string;
  attending: number;
  spotsLeft: number;
  price: string | "Free";
  tag?: string;
};

export type postDetailsType = {
  id: number;
  tag: string;
  price: number;
  image: string;
  name: string;
  userImage: string;
  userName: string;
  location: string;
  viewCount: number;
  likeCount: number;
  verifiedRatingCount: number;
  starRating: number;
};

export interface ApiResponse<T> {
  meta?: any;
  success: "Success" | "Error";
  data: T;
  message: string;
  error?: unknown;
}

export type AppError = Omit<ApiResponse<object>, "data">;

export interface Meta {
  page: number;
  limit: number;
  total?: number;
  totalPages: number;
}

export interface PaginatedData<T> {
  data: T[];
  meta: Meta;
}

export interface IUser {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  gender: "male" | "female" | "other";
  email: string;
  phone: string;
  currentCity: string;
  neighborhood: string;
  stateOfOrigin: string;
  location: string;
  profession: string;
  company: string;
  bio: string;
  verificationMethod: string;
  isIdVerified: boolean;
  isMobileVerified: boolean;
  photo: string;
  headerImage?: string;
  blurHash: string;
  role: "user" | "admin";
  isProfileComplete: boolean;
  preference: string[];
  isEmailVerified: boolean;
  isTermAndConditionAccepted: boolean;
  createdAt?: string;
  _count?: {
    followers: number;
    following: number;
    posts: number;
    events: number;
    listings: number;
  };
}

// Public user profile (for viewing other users)
export interface IUserProfile {
  id: string;
  firstName: string;
  lastName: string;
  photo: string | null;
  headerImage?: string;
  bio?: string;
  location?: string;
  profession?: string;
  company?: string;
  createdAt: string;
  isFollowing?: boolean;
  isOwnProfile?: boolean;
  _count: {
    followers: number;
    following: number;
    posts: number;
    events: number;
    listings: number;
  };
}

// User in follow lists (followers/following)
export interface IFollowUser {
  id: string;
  firstName: string;
  lastName: string;
  photo: string | null;
  profession?: string;
  location?: string;
  isFollowing?: boolean;
}

export interface IListing {
  id: string;
  _id?: string; // Legacy support
  sellerId: string;
  userId?: string; // Legacy support
  title: string;
  category: string;
  description: string;
  price: number;
  priceType?: "fixed" | "negotiable";
  condition: string;
  images: string[];
  photos?: string[]; // Legacy support
  tags?: string[];
  location: string | null;
  phoneNumber?: string;
  whatsappNumber?: string;
  email?: string;
  status: "active" | "sold" | "archived";
  seller: IListingSeller;
  user?: IUser; // Legacy support
  _count?: {
    likes: number;
    saves: number;
    views: number;
  };
  userInteraction?: {
    liked: boolean;
    saved: boolean;
  };
  // Computed/legacy fields
  rating?: number;
  ratingCount?: number;
  ratings?: number;
  totalLikes?: number;
  views?: number;
  isVerified?: boolean;
  isFlagged?: boolean;
  currency?: "NGN" | "USD";
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IListingSeller {
  id: string;
  firstName: string;
  lastName: string;
  photo: string | null;
  phone?: string;
  bio?: string;
  createdAt?: string;
  _count?: {
    listings: number;
  };
}

// Post types
export interface IPostAuthor {
  id: string;
  firstName: string;
  lastName: string;
  photo: string | null;
  profession?: string;
  location?: string;
  bio?: string;
}

export interface IPost {
  id: string;
  content: string;
  images: string[];
  videos: string[];
  type: "post" | "article" | "poll" | "blog";
  authorId: string;
  author: IPostAuthor & { role?: string };
  _count: {
    likes: number;
    comments: number;
    saves: number;
  };
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IComment {
  id: string;
  content: string;
  authorId: string;
  author: IPostAuthor;
  postId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostMeta {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  nextCursor: string | null;
}

// Promoted content types
export interface IPromotedEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  venue?: string;
  startDate: string;
  endDate?: string;
  startTime: string;
  endTime?: string;
  coverImage?: string;
  isFree: boolean;
  ticketPrice?: number;
  totalTickets?: number;
  availableTickets?: number;
  status: EventStatus;
  organizer: {
    id: string;
    firstName: string;
    lastName: string;
    photo?: string;
  };
  _count: {
    registrations: number;
    tickets: number;
  };
}

export interface IPromotedContent {
  id: string;
  contentType: "event" | "ad";
  eventId?: string;
  event?: IPromotedEvent;
  adTitle?: string;
  adDescription?: string;
  adImage?: string;
  adUrl?: string;
  adCtaText?: string;
  isActive: boolean;
  priority: number;
  startDate: string;
  endDate?: string;
  impressions: number;
  clicks: number;
  promotedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IFeedItem {
  type: "post" | "promoted_event";
  data: IPost | IPromotedContent;
}
