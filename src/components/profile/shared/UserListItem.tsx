// src/pages/profile/components/shared/UserListItem.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { UserCircle, UserPlus } from "lucide-react";
import { FollowerData } from '../types';

interface UserListItemProps {
  user: FollowerData;
  isCurrentUser: boolean;
  onFollowUser?: () => Promise<void>;
  onUnfollowUser?: () => Promise<void>;
  actionType: 'follow' | 'follow-back' | 'unfollow' | 'none';
}

export const UserListItem: React.FC<UserListItemProps> = ({
  user,
  isCurrentUser,
  onFollowUser,
  onUnfollowUser,
  actionType
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
          {user.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user.displayName} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {user.displayName}
          </h3>
          <p className="text-sm text-gray-500">@{user.displayName}</p>
        </div>
      </div>
      
      {!isCurrentUser && actionType !== 'none' && (
        <>
          {actionType === 'follow' && onFollowUser && (
            <Button onClick={onFollowUser}>
              <UserPlus className="w-4 h-4 mr-2" />
              Follow
            </Button>
          )}
          
          {actionType === 'follow-back' && onFollowUser && (
            <Button onClick={onFollowUser}>
              <UserPlus className="w-4 h-4 mr-2" />
              Follow back
            </Button>
          )}
          
          {actionType === 'unfollow' && onUnfollowUser && (
            <Button
              variant="outline"
              className="hover:bg-red-50 hover:text-red-600"
              onClick={onUnfollowUser}
            >
              Unfollow
            </Button>
          )}
        </>
      )}
    </div>
  );
};