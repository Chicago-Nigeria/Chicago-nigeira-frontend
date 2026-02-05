/* eslint-disable @typescript-eslint/no-namespace */
import { callApi } from "../libs/helper/callApi";
import { ApiResponse, IListing, PaginatedData, IPost, IComment, PostMeta, IPromotedContent, Meta, IUserProfile, IFollowUser } from "../types";

// User namespace for profile and follow operations
export namespace User {
  export const getPublicProfile = (userId: string) => {
    return callApi<ApiResponse<IUserProfile>>(`/users/${userId}`);
  };

  export const getUserPosts = (userId: string, params?: { cursor?: string; limit?: number }) => {
    const queryString = params
      ? new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString()
      : "";
    return callApi<ApiResponse<IPost[]> & { meta: PostMeta }>(`/users/${userId}/posts?${queryString}`);
  };

  export const getUserEvents = (userId: string, params?: { cursor?: string; limit?: number }) => {
    const queryString = params
      ? new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString()
      : "";
    return callApi<ApiResponse<any[]> & { meta: PostMeta }>(`/users/${userId}/events?${queryString}`);
  };

  export const getFollowers = (userId: string, params?: { cursor?: string; limit?: number }) => {
    const queryString = params
      ? new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString()
      : "";
    return callApi<ApiResponse<IFollowUser[]> & { meta: PostMeta }>(`/users/${userId}/followers?${queryString}`);
  };

  export const getFollowing = (userId: string, params?: { cursor?: string; limit?: number }) => {
    const queryString = params
      ? new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString()
      : "";
    return callApi<ApiResponse<IFollowUser[]> & { meta: PostMeta }>(`/users/${userId}/following?${queryString}`);
  };

  export const followUser = (userId: string) => {
    return callApi<ApiResponse<{ followerCount: number }>>(`/users/${userId}/follow`, "POST");
  };

  export const unfollowUser = (userId: string) => {
    return callApi<ApiResponse<{ followerCount: number }>>(`/users/${userId}/follow`, "DELETE");
  };

  export const updateHeaderImage = (data: FormData) => {
    return callApi<ApiResponse<{ headerImage: string }>>(`/users/profile/header`, "PUT", data);
  };

  export const getSuggestions = (limit?: number) => {
    const query = limit ? `?limit=${limit}` : "";
    return callApi<ApiResponse<IFollowUser[]>>(`/users/suggestions${query}`);
  };

  export const getUserListings = (userId: string, params?: { cursor?: string; limit?: number }) => {
    const queryString = params
      ? new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString()
      : "";
    return callApi<ApiResponse<IListing[]> & { meta: PostMeta }>(`/users/${userId}/listings?${queryString}`);
  };
}

export namespace Listing {
  export const getAllListing = (params?: Record<string, unknown>) => {
    const queryString = params
      ? new URLSearchParams(
        params as unknown as Record<string, string>
      ).toString()
      : "";

    return callApi<ApiResponse<PaginatedData<IListing>>>(
      `/listings?${queryString}`
    );
  };

  export const getListingById = (id: string) => {
    return callApi<ApiResponse<IListing>>(`/listings/${id}`);
  };

  export const getRelatedListings = (id: string) => {
    return callApi<ApiResponse<IListing[]>>(`/listings/${id}/related`);
  };
}

export namespace Event {
  export const getEventById = (id: string) => {
    return callApi<ApiResponse<any>>(`/events/${id}`);
  };
}

export namespace Post {
  export const getAllPosts = (params?: { page?: number; limit?: number; cursor?: string }) => {
    const queryString = params
      ? new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString()
      : "";
    return callApi<ApiResponse<IPost[]> & { meta: PostMeta }>(`/posts?${queryString}`);
  };

  export const getPostById = (id: string) => {
    return callApi<ApiResponse<IPost>>(`/posts/${id}`);
  };

  export const createPost = (data: FormData) => {
    return callApi<ApiResponse<IPost>>(`/posts`, "POST", data);
  };

  export const updatePost = (id: string, data: { content: string }) => {
    return callApi<ApiResponse<IPost>>(`/posts/${id}`, "PUT", data);
  };

  export const deletePost = (id: string) => {
    return callApi<ApiResponse<void>>(`/posts/${id}`, "DELETE");
  };

  export const toggleLike = (id: string) => {
    return callApi<ApiResponse<{ liked: boolean; likeCount: number }>>(`/posts/${id}/like`, "POST");
  };

  export const toggleSave = (id: string) => {
    return callApi<ApiResponse<{ saved: boolean }>>(`/posts/${id}/save`, "POST");
  };

  export const getComments = (postId: string, params?: { page?: number; limit?: number }) => {
    const queryString = params
      ? new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString()
      : "";
    return callApi<ApiResponse<PaginatedData<IComment>>>(`/posts/${postId}/comments?${queryString}`);
  };

  export const addComment = (postId: string, content: string) => {
    return callApi<ApiResponse<IComment> & { commentCount: number }>(`/posts/${postId}/comment`, "POST", { content });
  };

  export const deleteComment = (postId: string, commentId: string) => {
    return callApi<ApiResponse<{ commentCount: number }>>(`/posts/${postId}/comments/${commentId}`, "DELETE");
  };

  export const getPostCount = (since?: string) => {
    const query = since ? `?since=${since}` : "";
    return callApi<ApiResponse<{ count: number }>>(`/posts/count${query}`);
  };

  export const getBlogPosts = (params?: { page?: number; limit?: number; cursor?: string }) => {
    const queryString = params
      ? new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString()
      : "";
    return callApi<ApiResponse<IPost[]> & { meta: PostMeta }>(`/posts/blog?${queryString}`);
  };

  export const getFollowingPosts = (params?: { page?: number; limit?: number; cursor?: string }) => {
    const queryString = params
      ? new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString()
      : "";
    return callApi<ApiResponse<IPost[]> & { meta: PostMeta }>(`/posts/following?${queryString}`);
  };
}

// Feed namespace for promoted content
export namespace Feed {
  export const getPromotedContent = (limit?: number) => {
    const query = limit ? `?limit=${limit}` : "";
    return callApi<ApiResponse<IPromotedContent[]>>(`/feed/promoted${query}`);
  };

  export const recordImpression = (id: string) => {
    return callApi<ApiResponse<void>>(`/feed/promoted/${id}/impression`, "POST");
  };

  export const recordClick = (id: string) => {
    return callApi<ApiResponse<void>>(`/feed/promoted/${id}/click`, "POST");
  };

  export interface ICommunityStats {
    activeMembers: number;
    postsToday: number;
    eventsThisWeek: number;
  }

  export const getCommunityStats = () => {
    return callApi<ApiResponse<ICommunityStats>>(`/feed/stats`);
  };
}

// Admin Blog namespace
export namespace AdminBlog {
  export const getAllPosts = (params?: { page?: number; limit?: number; search?: string }) => {
    const queryString = params
      ? new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString()
      : "";
    return callApi<ApiResponse<IPost[]> & { meta: Meta }>(`/admin/posts?${queryString}`);
  };

  export const createPost = (data: FormData) => {
    return callApi<ApiResponse<IPost>>(`/admin/posts`, "POST", data);
  };

  export const updatePost = (id: string, data: { content: string }) => {
    return callApi<ApiResponse<IPost>>(`/admin/posts/${id}`, "PUT", data);
  };

  export const deletePost = (id: string) => {
    return callApi<ApiResponse<void>>(`/admin/posts/${id}`, "DELETE");
  };
}

// Admin Promoted Content namespace
export namespace AdminPromoted {
  export const getAll = (params?: { page?: number; limit?: number; contentType?: string; isActive?: string }) => {
    const queryString = params
      ? new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString()
      : "";
    return callApi<ApiResponse<IPromotedContent[]> & { meta: Meta }>(`/admin/promoted-content?${queryString}`);
  };

  export const create = (data: { eventId: string; priority?: number; startDate?: string; endDate?: string }) => {
    return callApi<ApiResponse<IPromotedContent>>(`/admin/promoted-content`, "POST", data);
  };

  export const update = (id: string, data: { priority?: number; startDate?: string; endDate?: string }) => {
    return callApi<ApiResponse<IPromotedContent>>(`/admin/promoted-content/${id}`, "PUT", data);
  };

  export const remove = (id: string) => {
    return callApi<ApiResponse<void>>(`/admin/promoted-content/${id}`, "DELETE");
  };

  export const toggle = (id: string) => {
    return callApi<ApiResponse<IPromotedContent>>(`/admin/promoted-content/${id}/toggle`, "PUT");
  };
}
