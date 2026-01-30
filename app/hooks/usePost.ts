import { Post, Feed } from "@/app/services";
import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { IPost, IPromotedContent } from "@/app/types";
import { toast } from "sonner";
import { useRef, useCallback, useState, useEffect } from "react";

export type FeedFilter = 'all' | 'blogs' | 'following';

// Infinite scroll posts hook
export const usePosts = (filter: FeedFilter = 'all') => {
  const lastFetchTime = useRef<string | null>(null);
  const [newPostsCount, setNewPostsCount] = useState(0);

  const query = useInfiniteQuery({
    queryKey: ["posts", filter],
    queryFn: async ({ pageParam }) => {
      // Use blog posts endpoint for blogs filter
      if (filter === 'blogs') {
        const result = await Post.getBlogPosts({
          cursor: pageParam,
          limit: 20,
        });

        if (!pageParam && result.data?.data?.[0]) {
          lastFetchTime.current = result.data.data[0].createdAt;
        }

        return result;
      }

      // Following posts filter
      if (filter === 'following') {
        const result = await Post.getFollowingPosts({
          cursor: pageParam,
          limit: 20,
        });

        if (!pageParam && result.data?.data?.[0]) {
          lastFetchTime.current = result.data.data[0].createdAt;
        }

        return result;
      }

      // Regular posts for 'all' filter
      const result = await Post.getAllPosts({
        cursor: pageParam,
        limit: 20,
      });

      // Track the time of the first post for new posts detection
      if (!pageParam && result.data?.data?.[0]) {
        lastFetchTime.current = result.data.data[0].createdAt;
      }

      return result;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.data?.meta?.nextCursor || undefined;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every 60 seconds
  });

  // Check for new posts
  const checkNewPosts = useCallback(async () => {
    if (!lastFetchTime.current) return;

    const result = await Post.getPostCount(lastFetchTime.current);
    if (result.data?.data?.count) {
      setNewPostsCount(result.data.data.count);
    }
  }, []);

  // Poll for new posts every 30 seconds
  useEffect(() => {
    const interval = setInterval(checkNewPosts, 30000);
    return () => clearInterval(interval);
  }, [checkNewPosts]);

  const loadNewPosts = useCallback(() => {
    setNewPostsCount(0);
    lastFetchTime.current = null;
    query.refetch();
  }, [query]);

  return {
    ...query,
    posts: query.data?.pages.flatMap((page) => page.data?.data || []) || [],
    newPostsCount,
    loadNewPosts,
  };
};

// Single post hook
export const usePost = (id: string) => {
  return useQuery({
    queryKey: ["post", id],
    queryFn: async () => await Post.getPostById(id),
    enabled: !!id,
  });
};

// Create post mutation
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return await Post.createPost(formData);
    },
    onSuccess: (result) => {
      if (result.data) {
        toast.success("Post created successfully!");
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      }
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to create post");
    },
  });
};

// Like post mutation with optimistic update
export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      return await Post.toggleLike(postId);
    },
    onMutate: async (postId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["post", postId] });

      // Snapshot previous value
      const previousPosts = queryClient.getQueryData(["posts"]);
      const previousPost = queryClient.getQueryData(["post", postId]);

      // Optimistically update posts list
      queryClient.setQueryData(["posts"], (old: unknown) => {
        if (!old) return old;
        const oldData = old as { pages: Array<{ data: { data: IPost[] } }> };
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              data: page.data?.data?.map((post: IPost) =>
                post.id === postId
                  ? {
                      ...post,
                      isLiked: !post.isLiked,
                      _count: {
                        ...post._count,
                        likes: post.isLiked
                          ? post._count.likes - 1
                          : post._count.likes + 1,
                      },
                    }
                  : post
              ),
            },
          })),
        };
      });

      // Optimistically update single post
      queryClient.setQueryData(["post", postId], (old: unknown) => {
        if (!old) return old;
        const oldData = old as { data: { data: IPost } };
        if (!oldData?.data?.data) return old;
        const post = oldData.data.data;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            data: {
              ...post,
              isLiked: !post.isLiked,
              _count: {
                ...post._count,
                likes: post.isLiked
                  ? post._count.likes - 1
                  : post._count.likes + 1,
              },
            },
          },
        };
      });

      return { previousPosts, previousPost };
    },
    onError: (_err, postId, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
      if (context?.previousPost) {
        queryClient.setQueryData(["post", postId], context.previousPost);
      }
      toast.error("Failed to like post");
    },
  });
};

// Save post mutation
export const useSavePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      return await Post.toggleSave(postId);
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousPosts = queryClient.getQueryData(["posts"]);

      queryClient.setQueryData(["posts"], (old: unknown) => {
        if (!old) return old;
        const oldData = old as { pages: Array<{ data: { data: IPost[] } }> };
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              data: page.data?.data?.map((post: IPost) =>
                post.id === postId ? { ...post, isSaved: !post.isSaved } : post
              ),
            },
          })),
        };
      });

      return { previousPosts };
    },
    onError: (_err, _postId, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
      toast.error("Failed to save post");
    },
  });
};

// Delete post mutation
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      return await Post.deletePost(postId);
    },
    onSuccess: () => {
      toast.success("Post deleted");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: () => {
      toast.error("Failed to delete post");
    },
  });
};

// Promoted content hook for feed interleaving
export const usePromotedContent = () => {
  return useQuery({
    queryKey: ["promotedContent"],
    queryFn: async () => {
      const result = await Feed.getPromotedContent(10);
      return result.data?.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

// Featured blog posts hook for feed interleaving
export const useFeaturedBlogPosts = () => {
  return useQuery({
    queryKey: ["featuredBlogPosts"],
    queryFn: async () => {
      const result = await Post.getBlogPosts({ limit: 5 });
      return result.data?.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

// Community stats hook for the feed sidebar
export const useCommunityStats = () => {
  return useQuery({
    queryKey: ["communityStats"],
    queryFn: async () => {
      const result = await Feed.getCommunityStats();
      return result.data?.data || { activeMembers: 0, postsToday: 0, eventsThisWeek: 0 };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};
