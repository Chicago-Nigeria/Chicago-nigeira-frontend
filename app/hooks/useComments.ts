import { Post } from "@/app/services";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IPost } from "@/app/types";

export const useComments = (postId: string) => {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => await Post.getComments(postId),
    enabled: !!postId,
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      content,
    }: {
      postId: string;
      content: string;
    }) => {
      return await Post.addComment(postId, content);
    },
    onSuccess: (result, { postId }) => {
      toast.success("Comment added");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });

      const newCount = result.data?.commentCount;

      // Helper to patch _count.comments in an infinite-query pages structure
      const patchPages = (old: unknown) => {
        if (!old) return old;
        const oldData = old as { pages: Array<{ data: { data: IPost[] } }> };
        if (!oldData.pages) return old;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              data: page.data?.data?.map((post: IPost) =>
                post.id === postId
                  ? { ...post, _count: { ...post._count, comments: newCount ?? post._count.comments + 1 } }
                  : post
              ),
            },
          })),
        };
      };

      // Update all three feed filter caches
      queryClient.setQueryData(["posts", "all"], patchPages);
      queryClient.setQueryData(["posts", "following"], patchPages);
      queryClient.setQueryData(["posts", "blogs"], patchPages);

      // Update single post page cache
      queryClient.setQueryData(["post", postId], (old: unknown) => {
        if (!old) return old;
        const oldData = old as { data: { data: IPost } };
        if (!oldData?.data?.data) return old;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            data: {
              ...oldData.data.data,
              _count: { ...oldData.data.data._count, comments: newCount ?? oldData.data.data._count.comments + 1 },
            },
          },
        };
      });
    },
    onError: () => {
      toast.error("Failed to add comment");
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      commentId,
    }: {
      postId: string;
      commentId: string;
    }) => {
      return await Post.deleteComment(postId, commentId);
    },
    onSuccess: (result, { postId }) => {
      toast.success("Comment deleted");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });

      const newCount = result.data?.data?.commentCount;

      const patchPages = (old: unknown) => {
        if (!old) return old;
        const oldData = old as { pages: Array<{ data: { data: IPost[] } }> };
        if (!oldData.pages) return old;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              data: page.data?.data?.map((post: IPost) =>
                post.id === postId
                  ? { ...post, _count: { ...post._count, comments: newCount ?? Math.max(0, post._count.comments - 1) } }
                  : post
              ),
            },
          })),
        };
      };

      queryClient.setQueryData(["posts", "all"], patchPages);
      queryClient.setQueryData(["posts", "following"], patchPages);
      queryClient.setQueryData(["posts", "blogs"], patchPages);
    },
    onError: () => {
      toast.error("Failed to delete comment");
    },
  });
};
