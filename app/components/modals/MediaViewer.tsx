"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface MediaItem {
  type: "image" | "video";
  url: string;
}

interface MediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem[];
  initialIndex?: number;
}

export default function MediaViewer({
  isOpen,
  onClose,
  media,
  initialIndex = 0,
}: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset index when modal opens with new initialIndex
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, media.length]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const goToNext = useCallback(() => {
    if (currentIndex < media.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, media.length]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Touch handlers for swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  const currentMedia = media[currentIndex];

  if (!isOpen || !currentMedia) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-black"
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            {media.length > 1 && (
              <div className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                {currentIndex + 1} / {media.length}
              </div>
            )}
          </div>

          {/* Main content area */}
          <div
            className="h-full w-full flex items-center justify-center"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Previous button - Desktop */}
            {media.length > 1 && currentIndex > 0 && (
              <button
                onClick={goToPrevious}
                className="hidden sm:flex absolute left-4 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
            )}

            {/* Media content */}
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full h-full flex items-center justify-center p-4 sm:p-12"
              onClick={(e) => {
                // Close if clicking on the background (not the media)
                if (e.target === e.currentTarget) {
                  onClose();
                }
              }}
            >
              {currentMedia.type === "image" ? (
                <div className="relative max-w-full max-h-full w-auto h-auto">
                  <Image
                    src={currentMedia.url}
                    alt={`Media ${currentIndex + 1}`}
                    width={1200}
                    height={800}
                    className="max-w-full max-h-[calc(100vh-120px)] w-auto h-auto object-contain"
                    priority
                  />
                </div>
              ) : (
                <video
                  ref={videoRef}
                  src={currentMedia.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-[calc(100vh-120px)] w-auto h-auto"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </motion.div>

            {/* Next button - Desktop */}
            {media.length > 1 && currentIndex < media.length - 1 && (
              <button
                onClick={goToNext}
                className="hidden sm:flex absolute right-4 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            )}
          </div>

          {/* Dots indicator */}
          {media.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
              {media.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "bg-white w-6"
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                  aria-label={`Go to media ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Swipe hint for mobile */}
          {media.length > 1 && (
            <div className="sm:hidden absolute bottom-16 left-0 right-0 text-center text-white/60 text-xs">
              Swipe to navigate
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
