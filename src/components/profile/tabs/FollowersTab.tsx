// src/pages/profile/components/tabs/FollowersTab.tsx
import React from 'react';
import { UserListItem } from '../shared/UserListItem';
import { FollowerData } from '../types';

interface FollowersTabProps {
  followers: FollowerData[];
  currentUserId: string | undefined;
  onFollowUser: (userId: string) => Promise<void>;
  onUnfollowUser: (userId: string) => Promise<void>;
}

export const FollowersTab: React.FC<FollowersTabProps> = ({
  followers,
  currentUserId,
  onFollowUser,
  onUnfollowUser
}) => {
  return (
    <div className="space-y-4">
      {followers.length > 0 ? (
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