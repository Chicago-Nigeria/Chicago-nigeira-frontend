'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, Clock, FileText, Loader2 } from 'lucide-react';
import { IPost } from '@/app/types';
import { useLikePost, useSavePost } from '@/app/hooks/usePost';
import { useAuthGuard } from '@/app/hooks/useAuthGuard';
import CommentModal from '@/app/components/modals/CommentModal';
import MediaViewer from '@/app/components/modals/MediaViewer';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { renderPostContent } from '@/app/utils/parsePostContent';

interface BlogPostCardProps {
  post: IPost;
}

export default function BlogPostCard({ post }: BlogPostCardProps) {
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [mediaViewerIndex, setMediaViewerIndex] = useState(0);
  const { requireAuth } = useAuthGuard();
  const likeMutation = useLikePost();
  const saveMutation = useSavePost();

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(() => {
      likeMutation.mutate(post.id);
    }, 'like this post');
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(() => {
      saveMutation.mutate(post.id);
    }, 'save this post');
  };

  const handleComment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(() => {
      setShowCommentModal(true);
    }, 'comment on this post');
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/feeds/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const openMediaViewer = (index: number) => {
    setMediaViewerIndex(index);
    setShowMediaViewer(true);
  };

  // Combine images and videos into a single media array
  const mediaItems = [
    ...post.images.map((url) => ({ type: 'image' as const, url })),
    ...post.videos.map((url) => ({ type: 'video' as const, url })),
  ];

  return (
    <>
      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 shadow-sm overflow-hidden">
        {/* Featured Blog Badge */}
        <div className="bg-emerald-600 px-4 py-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-white" />
          <span className="text-sm font-medium text-white">Featured Blog Post</span>
        </div>

        <div className="p-4 sm:p-5">
          {/* Author Header */}
          <div className="flex items-center">
            <Link href={`/profile/${post.author.id}`}>
              <div className="w-12 h-12 rounded-full bg-emerald-100 mr-3 overflow-hidden flex-shrink-0 ring-2 ring-emerald-200">
                {post.author.photo ? (
                  <Image
                    className="object-cover w-full h-full"
                    src={post.author.photo}
                    height={48}
                    width={48}
                    alt={`${post.author.firstName} ${post.author.lastName}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-200 text-emerald-700 font-medium">
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
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                  Official
                </span>
              </div>
              <p className="text-[11px] mt-0.5 text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Content */}
          <article className="mt-4 text-sm text-gray-700 leading-relaxed">
            <Link href={`/feeds/${post.id}`}>
              <p className="whitespace-pre-wrap break-words overflow-hidden">{renderPostContent(post.content)}</p>
            </Link>

            {/* Images */}
            {post.images.length > 0 && (
              <div
                className={`mt-4 rounded-xl overflow-hidden ${
                  post.images.length === 1
                    ? 'max-h-80'
                    : 'grid grid-cols-2 gap-1'
                }`}
              >
                {post.images.slice(0, 4).map((image, index) => (
                  <div
                    key={index}
                    className={`relative ${
                      post.images.length === 1 ? 'w-full h-64' : 'aspect-square'
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
              <div className={`mt-4 ${post.videos.length > 1 ? 'grid grid-cols-2 gap-1' : ''} rounded-xl overflow-hidden`}>
                {post.videos.slice(0, 2).map((video, index) => (
                  <div
                    key={index}
                    className={`relative ${post.videos.length === 1 ? 'max-h-80' : 'aspect-video'} bg-gray-900 cursor-pointer`}
                    onClick={() => openMediaViewer(post.images.length + index)}
                  >
                    <video
                      src={video}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                  </div>
                ))}
              </div>
            )}
          </article>

          {/* Actions */}
          <div className="mt-4 pt-4 border-t border-emerald-100 flex gap-5 items-center text-gray-500 text-sm">
            <motion.button
              onClick={handleLike}
              className="flex items-center gap-1.5 hover:text-red-500 transition"
              disabled={likeMutation.isPending}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={post.isLiked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <Heart
                  className={`w-4 h-4 ${
                    post.isLiked ? 'fill-red-500 text-red-500' : ''
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
              className="ml-auto hover:text-emerald-600 transition"
              disabled={saveMutation.isPending}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={post.isSaved ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <Bookmark
                  className={`w-4 h-4 ${
                    post.isSaved
                      ? 'fill-emerald-600 text-emerald-600'
                      : ''
                  }`}
                />
              </motion.div>
            </motion.button>
          </div>
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
