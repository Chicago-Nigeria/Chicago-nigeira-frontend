"use client";
import { RefreshCw } from "lucide-react";

interface NewPostsBannerProps {
  count: number;
  onLoad: () => void;
}

export default function NewPostsBanner({ count, onLoad }: NewPostsBannerProps) {
  if (count === 0) return null;

  const handleClick = () => {
    onLoad();
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={handleClick}
      className="w-full py-3 px-4 bg-[var(--primary-color)] text-white rounded-xl flex items-center justify-center gap-2 hover:bg-[var(--primary-color)]/90 transition shadow-lg"
    >
      <RefreshCw className="w-4 h-4" />
      <span>
        {count === 1 ? "1 new post available" : `${count} new posts available`}
      </span>
    </button>
  );
}
