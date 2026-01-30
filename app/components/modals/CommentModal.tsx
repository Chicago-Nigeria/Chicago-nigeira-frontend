"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Trash2, Loader2, Heart, MessageCircle, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useComments, useAddComment, useDeleteComment } from "@/app/hooks/useComments";
import { useSession } from "@/app/store/useSession";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { IPost, IComment } from "@/app/types";
import { formatDistanceToNow } from "date-fns";
import { renderPostContent } from "@/app/utils/parsePostContent";

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: IPost;
}

export default function CommentModal({ isOpen, onClose, post }: CommentModalProps) {
  const [commentText, setCommentText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollPositionRef = useRef(0);
  const { user } = useSession((state) => state);
  const { requireAuth } = useAuthGuard();

  const { data: commentsData, isLoading } = useComments(post.id);
  const addCommentMutation = useAddComment();
  const deleteCommentMutation = useDeleteComment();

  // Access comments data the same way as the individual post page
  const comments = (commentsData?.data?.data || []) as IComment[];

  // Handle escape key and body scroll lock
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      // Save current scroll position BEFORE modifying body styles
      scrollPositionRef.current = window.scrollY;

      document.addEventListener("keydown", handleEscape);

      // Lock body scroll
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";

      // Focus the input after modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);

      if (isOpen) {
        // Restore body styles
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";

        // Restore scroll position
        window.scrollTo(0, scrollPositionRef.current);
      }
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    requireAuth(() => {
      if (!commentText.trim()) return;

      addCommentMutation.mutate(
        { postId: post.id, content: commentText.trim() },
        {
          onSuccess: () => {
            setCommentText("");
          },
        }
      );
    }, "comment on this post");
  };

  const handleDelete = (commentId: string) => {
    deleteCommentMutation.mutate({ postId: post.id, commentId });
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Modal Container - Full screen on mobile */}
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-x-0 bottom-0 top-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-[60] flex flex-col bg-gray-50 sm:bg-white sm:rounded-2xl sm:max-w-xl sm:w-full sm:max-h-[85vh] sm:shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClose}
                  className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900">Comments</h2>
              </div>
              <div className="text-sm text-gray-500">
                {post._count.comments} {post._count.comments === 1 ? "comment" : "comments"}
              </div>
            </div>

            {/* Post Preview Card - Distinct styling with max height to prevent overflow */}
            <div className="shrink-0 p-3 sm:p-4 bg-gray-50 sm:bg-gray-50 max-h-[35vh] overflow-y-auto">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex gap-3">
                  <Link href={`/profile/${post.author.id}`} onClick={handleClose}>
                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 ring-2 ring-[var(--primary-color)]/20">
                      {post.author.photo ? (
                        <Image
                          src={post.author.photo}
                          alt={`${post.author.firstName} ${post.author.lastName}`}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm font-medium">
                          {post.author.firstName[0]}
                          {post.author.lastName[0]}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <Link href={`/profile/${post.author.id}`} onClick={handleClose}>
                        <p className="font-semibold text-gray-900 text-sm hover:underline">
                          {post.author.firstName} {post.author.lastName}
                        </p>
                      </Link>
                    </div>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-sm text-gray-800 mt-2 line-clamp-2 whitespace-pre-wrap break-words overflow-hidden">
                  {renderPostContent(post.content)}
                </p>

                {/* Post Media Preview - Compact view */}
                {(post.images.length > 0 || post.videos.length > 0) && (
                  <div className="mt-2 flex gap-1 overflow-hidden rounded-lg max-h-20">
                    {post.images.slice(0, 3).map((image, index) => (
                      <div
                        key={index}
                        className="relative bg-gray-100 w-20 h-20 flex-shrink-0"
                      >
                        <Image
                          src={image}
                          alt={`Post image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        {index === 2 && (post.images.length > 3 || post.videos.length > 0) && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                              +{post.images.length - 3 + post.videos.length}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                    {post.images.length < 3 && post.videos.slice(0, 3 - post.images.length).map((video, index) => (
                      <div
                        key={`video-${index}`}
                        className="relative bg-gray-900 w-20 h-20 flex-shrink-0"
                      >
                        <video
                          src={video}
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                            <div className="w-0 h-0 border-l-[6px] border-l-gray-900 border-y-[4px] border-y-transparent ml-0.5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Post stats */}
                <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Heart className={`w-3.5 h-3.5 ${post.isLiked ? "fill-red-500 text-red-500" : ""}`} />
                    {post._count.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {post._count.comments}
                  </span>
                </div>
              </div>
            </div>

            {/* Comments Section Header */}
            <div className="px-4 py-2 bg-white border-y border-gray-200 shrink-0">
              <h3 className="text-sm font-medium text-gray-700">
                {comments.length > 0 ? `${comments.length} Comments` : "Comments"}
              </h3>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto overscroll-contain bg-white">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)]" />
                </div>
              ) : comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="font-medium">No comments yet</p>
                  <p className="text-sm">Be the first to comment!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {comments.map((comment: IComment, index: number) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      className="p-4 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex gap-3">
                        <Link href={`/profile/${comment.author.id}`} onClick={handleClose}>
                          <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-[var(--primary-color)]/20 transition-all">
                            {comment.author.photo ? (
                              <Image
                                src={comment.author.photo}
                                alt={`${comment.author.firstName} ${comment.author.lastName}`}
                                width={36}
                                height={36}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-xs font-medium">
                                {comment.author.firstName[0]}
                                {comment.author.lastName[0]}
                              </div>
                            )}
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link href={`/profile/${comment.author.id}`} onClick={handleClose}>
                                <span className="font-medium text-gray-900 text-sm hover:underline">
                                  {comment.author.firstName} {comment.author.lastName}
                                </span>
                              </Link>
                              <span className="text-xs text-gray-400">
                                {formatDistanceToNow(new Date(comment.createdAt), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                            {user?._id === comment.authorId && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(comment.id)}
                                className="p-1.5 hover:bg-red-50 rounded-full transition-colors"
                                disabled={deleteCommentMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                              </motion.button>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words overflow-hidden">{renderPostContent(comment.content)}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Comment Input - Fixed at bottom with extra padding for mobile bottom nav */}
            <form
              onSubmit={handleSubmit}
              className="border-t border-gray-200 bg-white p-3 sm:p-4 shrink-0"
            >
              <div className="flex gap-3 items-center">
                <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                  {user?.photo ? (
                    <Image
                      src={user.photo}
                      alt="Your profile"
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-xs font-medium">
                      {user
                        ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`
                        : "?"}
                    </div>
                  )}
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 focus:bg-white transition-all"
                  />
                  <motion.button
                    type="submit"
                    disabled={!commentText.trim() || addCommentMutation.isPending}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 bg-[var(--primary-color)] text-white rounded-full hover:bg-[var(--primary-color)]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addCommentMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
