// src/pages/profile/components/tabs/FollowingTab.tsx
import React from 'react';
import { UserListItem } from '../shared/UserListItem';
import { FollowerData } from '../types';
import { Skeleton } from "@/components/ui/skeleton";

interface FollowingTabProps {
  following: FollowerData[];
  currentUserId: string | undefined;
  onUnfollowUser: (userId: string) => Promise<void>;
  isLoading: boolean;
}

export const FollowingTab: React.FC<FollowingTabProps> = ({
  following,
  currentUserId,
  onUnfollowUser,
  isLoading
}) => {
  return (
    <div className="space-y-4">
      {isLoading ? (
        // Show skeleton loaders while following data is loading
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
      ) : following.length > 0 ? (
        following.map(followedUser => (
          <UserListItem
            key={`following-${followedUser.id}`}
            user={followedUser}
            isCurrentUser={currentUserId === followedUser.id}
            onUnfollowUser={() => onUnfollowUser(followedUser.id)}
            actionType="unfollow"
          />
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          Not following anyone yet
        </div>
      )}
    </div>
  );
};