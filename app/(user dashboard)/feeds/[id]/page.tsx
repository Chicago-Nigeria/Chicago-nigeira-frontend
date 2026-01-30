"use client";
import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Clock,
  Send,
  Trash2,
  Loader2,
  ChartNoAxesColumnIncreasing,
  MapPin,
  UsersRound,
  BriefcaseConveyorBelt,
  Play,
} from "lucide-react";
import {
  usePost,
  useLikePost,
  useSavePost,
  useDeletePost,
} from "@/app/hooks/usePost";
import {
  useComments,
  useAddComment,
  useDeleteComment,
} from "@/app/hooks/useComments";
import { useSession } from "@/app/store/useSession";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { IComment } from "@/app/types";
import MediaViewer from "@/app/components/modals/MediaViewer";
import { renderPostContent } from "@/app/utils/parsePostContent";

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const { user } = useSession((state) => state);
  const { requireAuth } = useAuthGuard();

  const { data: postData, isLoading: postLoading } = usePost(postId);
  const { data: commentsData, isLoading: commentsLoading } =
    useComments(postId);

  const likeMutation = useLikePost();
  const saveMutation = useSavePost();
  const deleteMutation = useDeletePost();
  const addCommentMutation = useAddComment();
  const deleteCommentMutation = useDeleteComment();

  const [commentText, setCommentText] = useState("");
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [mediaViewerIndex, setMediaViewerIndex] = useState(0);

  const post = postData?.data?.data;
  const comments = (commentsData?.data?.data || []) as IComment[];

  // Combine images and videos into a single media array
  const mediaItems = useMemo(() => {
    if (!post) return [];
    const items: { type: "image" | "video"; url: string }[] = [];
    post.images.forEach((url) => items.push({ type: "image", url }));
    post.videos.forEach((url) => items.push({ type: "video", url }));
    return items;
  }, [post]);

  const handleLike = () => {
    requireAuth(() => {
      likeMutation.mutate(postId);
    }, "like this post");
  };

  const handleSave = () => {
    requireAuth(() => {
      saveMutation.mutate(postId);
    }, "save this post");
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this post?")) {
      deleteMutation.mutate(postId, {
        onSuccess: () => {
          router.push("/feeds");
        },
      });
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    requireAuth(() => {
      if (!commentText.trim()) return;

      addCommentMutation.mutate(
        { postId, content: commentText.trim() },
        {
          onSuccess: () => {
            setCommentText("");
          },
        }
      );
    }, "comment on this post");
  };

  const handleDeleteComment = (commentId: string) => {
    deleteCommentMutation.mutate({ postId, commentId });
  };

  const openMediaViewer = (index: number) => {
    setMediaViewerIndex(index);
    setShowMediaViewer(true);
  };

  if (postLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)]" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Post not found</h2>
        <p className="text-gray-500 mt-2">This post may have been deleted.</p>
        <Link
          href="/feeds"
          className="mt-4 inline-block text-[var(--primary-color)] hover:underline"
        >
          Back to feeds
        </Link>
      </div>
    );
  }

  return (
    <>
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Main Content */}
        <div>
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          {/* Post */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Author Header */}
            <div className="p-4 sm:p-5 flex items-center">
              <Link href={`/profile/${post.author.id}`}>
                <div className="w-14 h-14 rounded-full bg-gray-100 mr-4 overflow-hidden flex-shrink-0">
                  {post.author.photo ? (
                    <Image
                      src={post.author.photo}
                      alt={`${post.author.firstName} ${post.author.lastName}`}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 font-medium text-lg">
                      {post.author.firstName[0]}
                      {post.author.lastName[0]}
                    </div>
                  )}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/profile/${post.author.id}`}>
                  <p className="font-semibold text-gray-900 hover:underline">
                    {post.author.firstName} {post.author.lastName}
                  </p>
                </Link>
                {post.author.bio && (
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {post.author.bio}
                  </p>
                )}
                <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              {user?._id === post.authorId && (
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-red-500"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>

            {/* Content */}
            <div className="px-4 sm:px-5 pb-4">
              <p className="text-gray-800 whitespace-pre-wrap break-words overflow-hidden">{renderPostContent(post.content)}</p>
            </div>

            {/* Images - Matching PostCard styling */}
            {post.images.length > 0 && (
              <div className="px-4 sm:px-5 pb-4">
                <div
                  className={`rounded-xl overflow-hidden ${
                    post.images.length === 1
                      ? "max-h-[500px]"
                      : "grid grid-cols-2 gap-1"
                  }`}
                >
                  {post.images.slice(0, 4).map((image, index) => (
                    <div
                      key={index}
                      className={`relative ${
                        post.images.length === 1 ? "w-full h-80 sm:h-96" : "aspect-square"
                      } bg-gray-100 cursor-pointer`}
                      onClick={() => openMediaViewer(index)}
                    >
                      <Image
                        src={image}
                        alt={`Post image ${index + 1}`}
                        fill
                        className="object-cover hover:opacity-95 transition-opacity"
                      />
                      {index === 3 && post.images.length > 4 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center hover:bg-black/40 transition-colors">
                          <span className="text-white text-xl font-semibold">
                            +{post.images.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos - Matching PostCard styling */}
            {post.videos.length > 0 && (
              <div className="px-4 sm:px-5 pb-4">
                <div className={`${post.videos.length > 1 ? "grid grid-cols-2 gap-1" : ""} rounded-xl overflow-hidden`}>
                  {post.videos.slice(0, 4).map((video, index) => (
                    <div
                      key={index}
                      className={`relative ${post.videos.length === 1 ? "max-h-[500px]" : "aspect-square"} bg-gray-900 cursor-pointer group`}
                      onClick={() => openMediaViewer(post.images.length + index)}
                    >
                      <video
                        src={video}
                        className={`w-full ${post.videos.length === 1 ? "max-h-[500px]" : "h-full"} object-cover`}
                        muted
                        playsInline
                      />
                      {/* Play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="w-7 h-7 text-gray-900 ml-1" fill="currentColor" />
                        </div>
                      </div>
                      {index === 3 && post.videos.length > 4 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-xl font-semibold">
                            +{post.videos.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="px-4 sm:px-5 py-4 border-t border-gray-200 flex gap-6 items-center text-gray-500">
              <motion.button
                onClick={handleLike}
                disabled={likeMutation.isPending}
                className="flex items-center gap-2 hover:text-red-500 transition"
                whileTap={{ scale: 0.9 }}
              >
                <motion.div
                  animate={post.isLiked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      post.isLiked ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </motion.div>
                <span>{post._count.likes}</span>
              </motion.button>

              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <span>{post._count.comments}</span>
              </div>

              <motion.button
                onClick={handleShare}
                className="hover:text-green-500 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="w-5 h-5" />
              </motion.button>

              <motion.button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="ml-auto hover:text-[var(--primary-color)] transition"
                whileTap={{ scale: 0.9 }}
              >
                <motion.div
                  animate={post.isSaved ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <Bookmark
                    className={`w-5 h-5 ${
                      post.isSaved
                        ? "fill-[var(--primary-color)] text-[var(--primary-color)]"
                        : ""
                    }`}
                  />
                </motion.div>
              </motion.button>
            </div>

            {/* Comment Form */}
            <form
              onSubmit={handleCommentSubmit}
              className="px-4 sm:px-5 py-4 border-t border-gray-200"
            >
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                  {user?.photo ? (
                    <Image
                      src={user.photo}
                      alt="Your profile"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm font-medium">
                      {user
                        ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`
                        : "?"}
                    </div>
                  )}
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20"
                  />
                  <motion.button
                    type="submit"
                    disabled={!commentText.trim() || addCommentMutation.isPending}
                    className="p-2 bg-[var(--primary-color)] text-white rounded-full hover:bg-[var(--primary-color)]/90 transition disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
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

            {/* Comments */}
            <div className="border-t border-gray-200">
              <h3 className="px-4 sm:px-5 py-3 font-semibold text-gray-900">
                Comments ({post._count.comments})
              </h3>

              {commentsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[var(--primary-color)]" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No comments yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {comments.map((comment: IComment, index: number) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      className="px-4 sm:px-5 py-4 flex gap-3"
                    >
                      <Link href={`/profile/${comment.author.id}`}>
                        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-[var(--primary-color)]/20 transition-all">
                          {comment.author.photo ? (
                            <Image
                              src={comment.author.photo}
                              alt={`${comment.author.firstName} ${comment.author.lastName}`}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm font-medium">
                              {comment.author.firstName[0]}
                              {comment.author.lastName[0]}
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link href={`/profile/${comment.author.id}`}>
                              <span className="font-medium text-gray-900 hover:underline">
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
                              onClick={() => handleDeleteComment(comment.id)}
                              disabled={deleteCommentMutation.isPending}
                              className="p-1.5 hover:bg-red-50 rounded-full transition"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                            </motion.button>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words overflow-hidden">
                          {renderPostContent(comment.content)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="sticky top-24 h-fit hidden lg:block space-y-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-4">
              <span>Community Stats</span>
              <ChartNoAxesColumnIncreasing className="w-5 h-5 text-[var(--primary-color)]" />
            </h2>
            <div className="space-y-3 community-stats-items">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <p className="text-sm text-gray-600">Active Members</p>
                <p className="text-sm font-semibold text-gray-900">2,847</p>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <p className="text-sm text-gray-600">Posts Today</p>
                <p className="text-sm font-semibold text-gray-900">127</p>
              </div>
              <div className="flex items-center justify-between py-2">
                <p className="text-sm text-gray-600">Events This Week</p>
                <p className="text-sm font-semibold text-gray-900">8</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Popular Categories
            </h2>
            <div className="space-y-3 community-stats-items">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <p className="text-sm text-gray-600">Fashion</p>
                <p className="text-sm font-semibold text-gray-900">28</p>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <p className="text-sm text-gray-600">Services</p>
                <p className="text-sm font-semibold text-gray-900">34</p>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <p className="text-sm text-gray-600">Food</p>
                <p className="text-sm font-semibold text-gray-900">23</p>
              </div>
              <div className="flex items-center justify-between py-2">
                <p className="text-sm text-gray-600">Housing</p>
                <p className="text-sm font-semibold text-gray-900">8</p>
              </div>
            </div>

            <hr className="border-gray-200 my-4" />

            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-3">
                Quick Links
              </h2>
              <div className="space-y-2">
                <Link
                  href="/events"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition text-sm text-gray-600 hover:text-gray-900"
                >
                  <MapPin className="w-4 h-4 text-[var(--primary-color)]" />
                  <span>Find Local Events</span>
                </Link>
                <Link
                  href="/groups"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition text-sm text-gray-600 hover:text-gray-900"
                >
                  <UsersRound className="w-4 h-4 text-[var(--primary-color)]" />
                  <span>Join Groups</span>
                </Link>
                <Link
                  href="/marketplace"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition text-sm text-gray-600 hover:text-gray-900"
                >
                  <BriefcaseConveyorBelt className="w-4 h-4 text-[var(--primary-color)]" />
                  <span>Browse Marketplace</span>
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {/* Media Viewer */}
      <MediaViewer
        isOpen={showMediaViewer}
        onClose={() => setShowMediaViewer(false)}
        media={mediaItems}
        initialIndex={mediaViewerIndex}
      />
    </>
  );
}
