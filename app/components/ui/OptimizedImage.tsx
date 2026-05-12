"use client";

import { useState } from "react";
import Image from "next/image";
import { IMAGE_CONFIG, ImageContentType, cloudinaryUrl } from "@/app/utils/image";

interface OptimizedImageProps {
  src: string;
  alt: string;
  contentType?: ImageContentType;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  onClick?: () => void;
}

const cloudinaryLoader = ({
  src,
  width,
}: {
  src: string;
  width: number;
}) => {
  return cloudinaryUrl(src, width);
};

export default function OptimizedImage({
  src,
  alt,
  contentType,
  fill,
  width,
  height,
  className = "",
  sizes,
  priority = false,
  onClick,
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const config = contentType ? IMAGE_CONFIG[contentType] : null;
  const isCloudinary = src?.includes("res.cloudinary.com");

  const imgSrc = error ? "/image-placeholder.webp" : src;

  return (
    <div
      className={`relative overflow-hidden ${onClick ? "cursor-pointer" : ""}`}
      style={
        config && !fill
          ? { aspectRatio: `${config.width} / ${config.height}` }
          : undefined
      }
      onClick={onClick}
    >
      {/* Shimmer placeholder */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 shimmer-loading" />
      )}

      <Image
        src={imgSrc}
        alt={alt}
        fill={fill}
        width={!fill ? (width ?? config?.width) : undefined}
        height={!fill ? (height ?? config?.height) : undefined}
        className={`${className} transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        sizes={sizes}
        priority={priority}
        loader={isCloudinary && !error ? cloudinaryLoader : undefined}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
}
