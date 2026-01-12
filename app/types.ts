export type EventStatus = "pending" | "approved" | "rejected" | "upcoming" | "active" | "ongoing" | "completed";
export type FormValues = {
  email: string;
  password: string;
};
export type Event = {
  eventName: string;
  eventStatus?: EventStatus;
  numberOfAttendees: number;
  daysOfWeek: string;
  date: string;
};
export type HostedEvent = Omit<Event, "date">;
export type PastEvent = Omit<Event, "eventStatus" | "daysOfWeek">;
export type AttendingEvent = Omit<
  Event,
  "eventStatus" | "daysOfWeek" | "numberOfAttending"
>;
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
  meta: any;
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
  blurHash: string;
  role: "user" | "admin";
  isProfileComplete: boolean;
  preference: string[];
  isEmailVerified: boolean;
  isTermAndConditionAccepted: boolean;
}

export interface IListing {
  _id: string;
  userId: string;
  title: string;
  category: string;
  video: string;
  photos: string[];
  tags: string[];
  description: string;
  condition: string;
  user: IUser;
  priceType: string;
  likes: [];
  comments: [];
  ratings: number;
  price: number;
  location: string;
  status: "aproved" | "pending";
  isVerified: boolean;
  isFlagged: boolean;
  totalLikes: number;
  currency: "NGN" | "USD";
  createdAt: Date;
  updatedAt: Date;
}
