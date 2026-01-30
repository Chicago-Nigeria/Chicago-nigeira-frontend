"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Calendar, User } from "lucide-react";
import { IUserProfile } from "@/app/types";
import FollowButton from "./FollowButton";
import FollowersModal from "./FollowersModal";
import FollowingModal from "./FollowingModal";

interface ProfileHeaderProps {
  profile: IUserProfile;
  isOwnProfile: boolean;
}

export default function ProfileHeader({ profile, isOwnProfile }: ProfileHeaderProps) {
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  const fullName = `${profile.firstName} ${profile.lastName}`;
  const joinedDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <>
      <div className="overflow-hidden">
        {/* Header/Cover Image - Full width with rounded corners */}
        <div className="relative h-36 sm:h-48 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-xl overflow-hidden">
          {profile.headerImage && (
            <Image
              src={profile.headerImage}
              alt="Cover"
              fill
              className="object-cover"
              priority
            />
          )}

          {/* Edit Profile button positioned on cover image */}
          <div className="absolute top-4 right-4">
            {isOwnProfile ? (
              <Link
                href="/settings"
                className="px-5 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition shadow-sm"
              >
                Edit Profile
              </Link>
            ) : (
              <FollowButton
                userId={profile.id}
                isFollowing={profile.isFollowing || false}
              />
            )}
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="relative px-4 sm:px-6">
          {/* Profile Picture - Positioned to overlap cover */}
          <div className="absolute -top-16 sm:-top-20 left-4 sm:left-6">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
              {profile.photo ? (
                <Image
                  src={profile.photo}
                  alt={fullName}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                  <User className="w-14 h-14 sm:w-16 sm:h-16" />
                </div>
              )}
            </div>
          </div>

          {/* Name and Info - Below profile picture */}
          <div className="pt-16 sm:pt-20">
            {/* Name */}
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {fullName}
            </h1>

            {/* Profession + Location on one line */}
            {(profile.profession || profile.location) && (
              <p className="text-sm text-gray-500 mt-0.5">
                {profile.profession}
                {profile.profession && profile.location && " • "}
                {profile.location}
              </p>
            )}

            {/* Bio */}
            {profile.bio && (
              <p className="mt-3 text-sm text-gray-700 leading-relaxed max-w-2xl">
                {profile.bio}
              </p>
            )}

            {/* Location and Join Date */}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {profile.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {profile.location}
                </span>
              )}
              {joinedDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Joined {joinedDate}
                </span>
              )}
            </div>

            {/* Followers/Following Stats */}
            <div className="mt-3 flex items-center gap-4 text-sm">
              <button
                onClick={() => setShowFollowingModal(true)}
                className="hover:underline focus:outline-none"
              >
                <span className="font-semibold text-gray-900">
                  {profile._count.following}
                </span>{" "}
                <span className="text-gray-500">Following</span>
              </button>
              <button
                onClick={() => setShowFollowersModal(true)}
                className="hover:underline focus:outline-none"
              >
                <span className="font-semibold text-gray-900">
                  {profile._count.followers}
                </span>{" "}
                <span className="text-gray-500">Followers</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <FollowersModal
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        userId={profile.id}
        userName={fullName}
      />
      <FollowingModal
        isOpen={showFollowingModal}
        onClose={() => setShowFollowingModal(false)}
        userId={profile.id}
        userName={fullName}
      />
    </>
  );
}
