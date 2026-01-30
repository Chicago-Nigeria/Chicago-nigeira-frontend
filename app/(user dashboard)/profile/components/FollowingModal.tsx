"use client";

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFollowing } from "@/app/hooks/useUserProfile";
import FollowButton from "./FollowButton";
import { useSession } from "@/app/store/useSession";

interface FollowingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export default function FollowingModal({
  isOpen,
  onClose,
  userId,
  userName,
}: FollowingModalProps) {
  const { user } = useSession((state) => state);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useFollowing(isOpen ? userId : null);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const allFollowing = data?.pages.flatMap((page) => page.data) || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md max-h-[80vh] bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">Following</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(80vh-60px)]">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : allFollowing.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <User className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">Not following anyone yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {allFollowing.map((following) => (
                    <div
                      key={following.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                    >
                      <Link
                        href={`/profile/${following.id}`}
                        onClick={onClose}
                        className="flex-shrink-0"
                      >
                        <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden">
                          {following.photo ? (
                            <Image
                              src={following.photo}
                              alt={`${following.firstName} ${following.lastName}`}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <User className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                      </Link>
                      <Link
                        href={`/profile/${following.id}`}
                        onClick={onClose}
                        className="flex-1 min-w-0"
                      >
                        <p className="font-medium text-gray-900 truncate hover:underline">
                          {following.firstName} {following.lastName}
                        </p>
                        {following.profession && (
                          <p className="text-sm text-gray-500 truncate">
                            {following.profession}
                          </p>
                        )}
                      </Link>
                      {user && following.id !== user._id && following.id !== (user.id || user._id) && (
                        <FollowButton
                          userId={following.id}
                          isFollowing={following.isFollowing ?? true}
                          variant="compact"
                        />
                      )}
                    </div>
                  ))}

                  {/* Load more trigger */}
                  {hasNextPage && (
                    <div ref={loadMoreRef} className="py-4 text-center">
                      {isFetchingNextPage && (
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
