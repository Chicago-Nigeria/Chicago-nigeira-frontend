"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  Trash2,
  Edit3,
} from "lucide-react";
import { IPost } from "@/app/types";
import { useLikePost, useSavePost, useDeletePost, useEditPost } from "@/app/hooks/usePost";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { useToggleFollow } from "@/app/hooks/useFollow";
import { useSession } from "@/app/store/useSession";
import CommentModal from "@/app/components/modals/CommentModal";
import MediaViewer from "@/app/components/modals/MediaViewer";
import DeletePostModal from "@/app/components/modals/DeletePostModal";
import EditPostModal from "@/app/components/modals/EditPostModal";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { renderPostContent, isWithinEditTimeframe } from "@/app/utils/parsePostContent";

interface PostCardProps {
  post: IPost;
  showFollowButton?: boolean;
}

const MAX_LINES = 5;
const LINE_HEIGHT = 1.5; // matches leading-relaxed

export default function PostCard({ post, showFollowButton = true }: PostCardProps) {
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [mediaViewerIndex, setMediaViewerIndex] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isTextTruncated, setIsTextTruncated] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { requireAuth } = useAuthGuard();
  const likeMutation = useLikePost();
  const saveMutation = useSavePost();
  const deleteMutation = useDeletePost();
  const editMutation = useEditPost();
  const { toggle: toggleFollow, isPending: followPending } = useToggleFollow();
  const { user } = useSession((state) => state);

  // Get current user ID
  const currentUserId = user?._id || (user as any)?.id;
  // Check if this is own post
  const isOwnPost = currentUserId === post.author.id;
  // Check if already following this author (from server data)
  const isFollowing = (post.author as any).isFollowing || false;
  // Check if post is editable (within 1 hour)
  const canEdit = isOwnPost && isWithinEditTimeframe(post.createdAt);

  // Check if text needs truncation
  useEffect(() => {
    if (contentRef.current) {
      const lineHeight = parseFloat(getComputedStyle(contentRef.current).lineHeight);
      const maxHeight = lineHeight * MAX_LINES;
      setIsTextTruncated(contentRef.current.scrollHeight > maxHeight + 2);
    }
  }, [post.content]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

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
    requireAuth(() => {
      setShowCommentModal(true);
    }, "comment on this post");
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

  const handleDeleteClick = () => {
    setShowDropdown(false);
    setShowDeleteModal(true);
  };

  const handleEditClick = () => {
    setShowDropdown(false);
    setShowEditModal(true);
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(post.id, {
      onSuccess: () => {
        setShowDeleteModal(false);
      },
    });
  };

  const handleEditConfirm = (content: string) => {
    editMutation.mutate(
      { postId: post.id, content },
      {
        onSuccess: () => {
          setShowEditModal(false);
        },
      }
    );
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
              {canEdit && (
                <span className="text-emerald-600 ml-1">(editable)</span>
              )}
            </p>
          </div>

          {/* More Options Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-20"
                >
                  {isOwnPost && canEdit && (
                    <button
                      onClick={handleEditClick}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Post
                    </button>
                  )}
                  {isOwnPost && (
                    <button
                      onClick={handleDeleteClick}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Post
                    </button>
                  )}
                  {!isOwnPost && (
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        toast.info("Report feature coming soon");
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      Report Post
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Content */}
        <article className="mt-4 text-sm text-gray-700 leading-relaxed">
          <Link href={`/feeds/${post.id}`} className="block">
            <div
              ref={contentRef}
              className={`whitespace-pre-wrap break-words overflow-hidden ${
                isTextTruncated ? "line-clamp-5" : ""
              }`}
            >
              {renderPostContent(post.content)}
            </div>

            {/* See More */}
            {isTextTruncated && (
              <span className="mt-1 text-[var(--primary-color)] hover:underline font-medium inline-block">
                See more
              </span>
            )}
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

      {/* Delete Confirmation Modal */}
      <DeletePostModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />

      {/* Edit Post Modal */}
      <EditPostModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onConfirm={handleEditConfirm}
        isPending={editMutation.isPending}
        post={post}
      />
    </>
  );
}
