"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Clock,
  MoreVertical,
  Play,
  UserPlus,
  Loader2,
} from "lucide-react";
import { IPost } from "@/app/types";
import { useLikePost, useSavePost } from "@/app/hooks/usePost";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { useToggleFollow } from "@/app/hooks/useFollow";
import { useSession } from "@/app/store/useSession";
import CommentModal from "@/app/components/modals/CommentModal";
import MediaViewer from "@/app/components/modals/MediaViewer";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface PostCardProps {
  post: IPost;
  showFollowButton?: boolean;
}

export default function PostCard({ post, showFollowButton = true }: PostCardProps) {
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [mediaViewerIndex, setMediaViewerIndex] = useState(0);
  const { requireAuth } = useAuthGuard();
  const likeMutation = useLikePost();
  const saveMutation = useSavePost();
  const { toggle: toggleFollow, isPending: followPending } = useToggleFollow();
  const { user } = useSession((state) => state);

  // Get current user ID
  const currentUserId = user?._id || (user as any)?.id;
  // Check if this is own post
  const isOwnPost = currentUserId === post.author.id;
  // Check if already following this author (from server data)
  const isFollowing = (post.author as any).isFollowing || false;

  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    requireAuth(() => {
      toggleFollow(post.author.id, isFollowing);
    }, `follow ${post.author.firstName}`);
  };

  // Combine images and videos into a single media array
  const mediaItems = useMemo(() => {
    const items: { type: "image" | "video"; url: string }[] = [];
    post.images.forEach((url) => items.push({ type: "image", url }));
    post.videos.forEach((url) => items.push({ type: "video", url }));
    return items;
  }, [post.images, post.videos]);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    requireAuth(() => {
      likeMutation.mutate(post.id);
    }, "like this post");
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    requireAuth(() => {
      saveMutation.mutate(post.id);
    }, "save this post");
  };

  const handleComment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCommentModal(true);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}/feeds/${post.id}`;

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const openMediaViewer = (index: number) => {
    setMediaViewerIndex(index);
    setShowMediaViewer(true);
  };

  return (
    <>
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
        {/* Author Header */}
        <div className="flex items-center">
          <Link href={`/profile/${post.author.id}`}>
            <div className="w-14 h-14 rounded-full bg-gray-100 mr-4 overflow-hidden flex-shrink-0">
              {post.author.photo ? (
                <Image
                  className="object-cover w-full h-full"
                  src={post.author.photo}
                  height={56}
                  width={56}
                  alt={`${post.author.firstName} ${post.author.lastName}`}
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
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/profile/${post.author.id}`}>
                <p className="font-medium text-gray-900 hover:underline">
                  {post.author.firstName} {post.author.lastName}
                </p>
              </Link>
              {post.type === "blog" && (post.author.role === "admin" || post.author.role === "super_admin") && (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                  Official
                </span>
              )}
              {/* Follow Button - Only show for non-own posts */}
              {showFollowButton && !isOwnPost && !isFollowing && (
                <motion.button
                  onClick={handleFollow}
                  disabled={followPending}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[var(--primary-color)] bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors"
                >
                  {followPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3" />
                      <span>Follow</span>
                    </>
                  )}
                </motion.button>
              )}
            </div>
            {post.author.bio && (
              <p className="text-sm text-gray-500 line-clamp-1">
                {post.author.bio}
              </p>
            )}
            <p className="text-[11px] mt-0.5 text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <article className="mt-4 text-sm text-gray-700 leading-relaxed">
          <Link href={`/feeds/${post.id}`}>
            <p className="whitespace-pre-wrap">{post.content}</p>
          </Link>

          {/* Images */}
          {post.images.length > 0 && (
            <div
              className={`mt-4 rounded-xl overflow-hidden ${
                post.images.length === 1
                  ? "max-h-96"
                  : "grid grid-cols-2 gap-1"
              }`}
            >
              {post.images.slice(0, 4).map((image, index) => (
                <div
                  key={index}
                  className={`relative ${
                    post.images.length === 1 ? "w-full h-72" : "aspect-square"
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
          )}

          {/* Videos */}
          {post.videos.length > 0 && (
            <div className={`mt-4 ${post.videos.length > 1 ? "grid grid-cols-2 gap-1" : ""} rounded-xl overflow-hidden`}>
              {post.videos.slice(0, 4).map((video, index) => (
                <div
                  key={index}
                  className={`relative ${post.videos.length === 1 ? "max-h-96" : "aspect-square"} bg-gray-900 cursor-pointer group`}
                  onClick={() => openMediaViewer(post.images.length + index)}
                >
                  <video
                    src={video}
                    className={`w-full ${post.videos.length === 1 ? "max-h-96" : "h-full"} object-cover`}
                    muted
                    playsInline
                  />
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
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
          )}
        </article>

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex gap-5 items-center text-gray-500 text-sm">
          <motion.button
            onClick={handleLike}
            className="flex items-center gap-1.5 hover:text-red-500 transition"
            disabled={likeMutation.isPending}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              animate={post.isLiked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Heart
                className={`w-4 h-4 ${
                  post.isLiked ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </motion.div>
            <span>{post._count.likes}</span>
          </motion.button>

          <motion.button
            onClick={handleComment}
            className="flex items-center gap-1.5 hover:text-blue-500 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle className="w-4 h-4" />
            <span>{post._count.comments}</span>
          </motion.button>

          <motion.button
            onClick={handleShare}
            className="flex items-center gap-1.5 hover:text-green-500 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Share2 className="w-4 h-4" />
          </motion.button>

          <motion.button
            onClick={handleSave}
            className="ml-auto hover:text-[var(--primary-color)] transition"
            disabled={saveMutation.isPending}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              animate={post.isSaved ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Bookmark
                className={`w-4 h-4 ${
                  post.isSaved
                    ? "fill-[var(--primary-color)] text-[var(--primary-color)]"
                    : ""
                }`}
              />
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Comment Modal */}
      <CommentModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        post={post}
      />

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
