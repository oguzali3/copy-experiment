// src/pages/profile/components/tabs/FollowingTab.tsx
import React from 'react';
import { UserListItem } from '../shared/UserListItem';
import { FollowerData } from '../types';

interface FollowingTabProps {
  following: FollowerData[];
  currentUserId: string | undefined;
  onUnfollowUser: (userId: string) => Promise<void>;
}

export const FollowingTab: React.FC<FollowingTabProps> = ({
  following,
  currentUserId,
  onUnfollowUser
}) => {
  return (
    <div className="space-y-4">
      {following.length > 0 ? (
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