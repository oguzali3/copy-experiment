// src/pages/profile/components/tabs/FollowersTab.tsx
import React from 'react';
import { UserListItem } from '../shared/UserListItem';
import { FollowerData } from '../types';
import { Skeleton } from "@/components/ui/skeleton"; // Assuming you have a Skeleton component

interface FollowersTabProps {
  followers: FollowerData[];
  currentUserId: string | undefined;
  onFollowUser: (userId: string) => Promise<void>;
  onUnfollowUser: (userId: string) => Promise<void>;
  isLoading: boolean;
}

export const FollowersTab: React.FC<FollowersTabProps> = ({
  followers,
  currentUserId,
  onFollowUser,
  onUnfollowUser,
  isLoading
}) => {
  return (
    <div className="space-y-4">
      {isLoading ? (
        // Show skeleton loaders while followers are loading
        Array(3).fill(0).map((_, index) => (
          <div key={`skeleton-${index}`} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        ))
      ) : followers.length > 0 ? (
        followers.map(follower => (
          <UserListItem
            key={`follower-${follower.id}`}
            user={follower}
            isCurrentUser={currentUserId === follower.id}
            onFollowUser={() => onFollowUser(follower.id)}
            onUnfollowUser={() => onUnfollowUser(follower.id)}
            actionType={follower.isFollowing ? 'unfollow' : 'follow-back'}
          />
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          No followers yet
        </div>
      )}
    </div>
  );
};