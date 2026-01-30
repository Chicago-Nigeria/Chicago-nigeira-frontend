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
      // Update comment count in posts list
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
                      _count: {
                        ...post._count,
                        comments:
                          result.data?.commentCount ?? post._count.comments + 1,
                      },
                    }
                  : post
              ),
            },
          })),
        };
      });
      // Update single post comment count
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
              _count: {
                ...oldData.data.data._count,
                comments:
                  result.data?.commentCount ??
                  oldData.data.data._count.comments + 1,
              },
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
      // Update comment count
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
                      _count: {
                        ...post._count,
                        comments:
                          result.data?.data?.commentCount ??
                          post._count.comments - 1,
                      },
                    }
                  : post
              ),
            },
          })),
        };
      });
    },
    onError: () => {
      toast.error("Failed to delete comment");
    },
  });
};
