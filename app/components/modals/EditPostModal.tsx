"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Clock, Edit3 } from "lucide-react";
import { IPost } from "@/app/types";
import { getRemainingEditTime } from "@/app/utils/parsePostContent";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (content: string) => void;
  isPending: boolean;
  post: IPost;
}

export default function EditPostModal({
  isOpen,
  onClose,
  onConfirm,
  isPending,
  post,
}: EditPostModalProps) {
  const [content, setContent] = useState(post.content);
  const [remainingTime, setRemainingTime] = useState(getRemainingEditTime(post.createdAt));

  // Reset content when modal opens
  useEffect(() => {
    if (isOpen) {
      setContent(post.content);
      setRemainingTime(getRemainingEditTime(post.createdAt));
    }
  }, [isOpen, post.content, post.createdAt]);

  // Update remaining time every minute
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      const remaining = getRemainingEditTime(post.createdAt);
      setRemainingTime(remaining);
      if (remaining <= 0) {
        onClose();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isOpen, post.createdAt, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && content !== post.content) {
      onConfirm(content.trim());
    }
  };

  const hasChanges = content.trim() !== post.content;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-lg"
          >
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl mx-4">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-full">
                    <Edit3 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Edit Post</h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Time remaining indicator */}
              <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-700">
                  {remainingTime > 0
                    ? `${remainingTime} minute${remainingTime !== 1 ? "s" : ""} remaining to edit`
                    : "Edit time has expired"}
                </span>
              </div>

              {/* Content */}
              <div className="p-5">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isPending || remainingTime <= 0}
                  placeholder="What's on your mind?"
                  className="w-full h-40 p-3 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 focus:border-[var(--primary-color)] disabled:bg-gray-50 disabled:text-gray-500"
                />
                <p className="mt-2 text-xs text-gray-500">
                  {content.length} characters
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 px-5 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !hasChanges || remainingTime <= 0}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color)]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
