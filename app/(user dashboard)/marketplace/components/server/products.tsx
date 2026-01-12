"use client";

import { Eye, Heart, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import LikePost from "../../../components/likePost";
import { postDetailsType } from "@/app/types";
import { callApi } from "@/app/libs/helper/callApi";
import { useEffect } from "react";

const postDetails: postDetailsType[] = [
  {
    id: 1,
    tag: "fashion",
    price: 85,
    image: "/post-img-1.webp",
    name: "Authentic Nigerian Ankara Dresses Made to Order",
    userImage: "/reviewer-image-1.webp",
    userName: "Adebayo Ogundimu",
    location: "chicago",
    viewCount: 234,
    likeCount: 18,
    verifiedRatingCount: 127,
    starRating: 4,
  },
  {
    id: 2,
    tag: "fashion",
    price: 85,
    image: "/post-img-2.webp",
    name: "Authentic Nigerian Ankara Dresses Made to Order",
    userImage: "/reviewer-image-1.webp",
    userName: "Adebayo Ogundimu",
    location: "chicago",
    viewCount: 234,
    likeCount: 18,
    verifiedRatingCount: 127,
    starRating: 4,
  },
  {
    id: 3,
    tag: "fashion",
    price: 85,
    image: "/post-img-3.webp",
    name: "Authentic Nigerian Ankara Dresses Made to Order",
    userImage: "/reviewer-image-1.webp",
    userName: "Adebayo Ogundimu",
    location: "chicago",
    viewCount: 234,
    likeCount: 18,
    verifiedRatingCount: 127,
    starRating: 4,
  },
  {
    id: 4,
    tag: "fashion",
    price: 85,
    image: "/post-img-4.webp",
    name: "Authentic Nigerian Ankara Dresses Made to Order",
    userImage: "/reviewer-image-1.webp",
    userName: "Adebayo Ogundimu",
    location: "chicago",
    viewCount: 234,
    likeCount: 18,
    verifiedRatingCount: 127,
    starRating: 4,
  },
];

export default function MarketplaceProducts() {
  useEffect(() => {
    async function getListings() {
      callApi("/api/v1/listing").then((response) => {
        console.log(response);
      });
    }

    getListings();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
      {postDetails.map((post) => (
        <div
          key={post.id}
          className="rounded-xl overflow-hidden border bg-white border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="h-48 bg-gray-200 relative">
            <Image
              className="object-cover object-center w-full h-full"
              src={post.image}
              height={400}
              width={300}
              alt={post.name}
              priority={post.id <= 2}
            />
            <div className="absolute top-2 right-2">
              <LikePost />
            </div>
          </div>
          <div className="p-3 space-y-2">
            <div className="flex justify-between items-start gap-2">
              <span className="text-xs py-1 px-2 border border-gray-200 rounded-md bg-gray-50">
                {post.tag}
              </span>
              <p className="text-[var(--primary-color)] font-semibold text-sm">
                ${post.price}
              </p>
            </div>

            <Link
              href={`/marketplace/${
                post.name.replace(/ /g, "-") + "-" + post.id
              }`}
              // prefetch={true}
              className="text-sm font-medium line-clamp-2 leading-tight"
            >
              {post.name}
            </Link>

            <div className="flex items-center gap-2 pt-1">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                <Image
                  className="object-cover w-full h-full"
                  src={post.userImage}
                  height={32}
                  width={32}
                  alt={post.userName}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{post.userName}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{post.location}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < post.starRating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-gray-300 text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-1">
                  ({post.verifiedRatingCount})
                </span>
              </div>

              <div className="flex items-center gap-3 text-gray-500">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span className="text-xs">{post.viewCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span className="text-xs">{post.likeCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
