/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/profile/components/ProfileHeader.tsx
import React from 'react';
import { ProfileAvatarUploader } from "@/components/social/ProfileAvatarUploader";
import { ProfileData } from './types';

interface ProfileHeaderProps {
  profileData: ProfileData;
  avatarUrl: string | null;
  avatarVariants: {
    original?: string;
    thumbnail?: string;
    medium?: string;
    optimized?: string;
  } | null;
  isOwner: boolean;
  onAvatarUpdated: (newAvatarUrl: string, newAvatarVariants?: any) => void;
  apiUrl: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profileData,
  avatarUrl,
  avatarVariants,
  isOwner,
  onAvatarUpdated,
  apiUrl
}) => {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {profileData.displayName || "Add your username"}
          </h1>
          {profileData.isPrivate && (
            <div className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs font-medium text-gray-700 dark:text-gray-300">
              Private
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>@{profileData.displayName || "username"}</span>
          <span>•</span>
          <span>{profileData.followerCount} followers</span>
          <span>•</span>
          <span>{profileData.followingCount} following</span>
        </div>
      </div>
      
      <div className="flex-shrink-0">
        <ProfileAvatarUploader
          avatarUrl={avatarUrl}
          avatarVariants={avatarVariants}
          onAvatarUpdated={onAvatarUpdated}
          isOwner={isOwner}
          username={profileData.displayName}
          size="xl"
          apiUrl={apiUrl}
        />
      </div>
    </div>
  );
};