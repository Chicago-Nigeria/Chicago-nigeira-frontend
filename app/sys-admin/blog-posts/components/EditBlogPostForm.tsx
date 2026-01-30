'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { AdminBlog } from '@/app/services';
import { IPost } from '@/app/types';
import { toast } from 'sonner';

interface EditBlogPostFormProps {
  post: IPost;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditBlogPostForm({ post, onClose, onSuccess }: EditBlogPostFormProps) {
  const [content, setContent] = useState(post.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Please add some content');
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await AdminBlog.updatePost(post.id, { content });

    if (error) {
      toast.error(error.message || 'Failed to update blog post');
    } else {
      toast.success('Blog post updated successfully');
      onSuccess();
      onClose();
    }

    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Edit Blog Post</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog post content here..."
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Existing Media Preview (read-only) */}
          {(post.images.length > 0 || post.videos.length > 0) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Existing Media (cannot be changed)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {post.images.map((image, index) => (
                  <div key={`image-${index}`} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={image}
                      alt={`Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
                {post.videos.map((video, index) => (
                  <div key={`video-${index}`} className="relative aspect-square rounded-lg overflow-hidden bg-gray-900">
                    <video
                      src={video}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
                        <div className="w-0 h-0 border-l-[10px] border-l-gray-900 border-y-[6px] border-y-transparent ml-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Note: Media files cannot be modified. To change media, delete this post and create a new one.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
