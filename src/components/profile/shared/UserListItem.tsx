// src/pages/profile/components/shared/UserListItem.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { UserCircle, UserPlus } from "lucide-react";
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const navigateToProfile = (e: React.MouseEvent) => {
    // Get the clicked element
    const target = e.target as HTMLElement;
    
    // Prevent navigation if clicking on action buttons or their children
    if (target.closest('button')) {
      e.stopPropagation();
      return;
    }
    
    // Navigate to the user's profile
    navigate(`/profile?id=${user.id}`);
  };

  return (
    <div 
      className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors relative group" 
      onClick={navigateToProfile}
      role="button"
      aria-label={`View ${user.displayName}'s profile`}
    >
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-200 dark:group-hover:border-blue-800 rounded-lg pointer-events-none transition-colors"></div>
      <div className="flex items-center space-x-3 profile-container">
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
        <div className="relative group">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center">
            {user.displayName}
          </h3>
          <p className="text-sm text-gray-500">@{user.displayName}</p>
        </div>
      </div>
      
      {!isCurrentUser && actionType !== 'none' && (
        <>
          {actionType === 'follow' && onFollowUser && (
            <Button onClick={(e) => {
              e.stopPropagation();
              onFollowUser();
            }}>
              <UserPlus className="w-4 h-4 mr-2" />
              Follow
            </Button>
          )}
          
          {actionType === 'follow-back' && onFollowUser && (
            <Button onClick={(e) => {
              e.stopPropagation();
              onFollowUser();
            }}>
              <UserPlus className="w-4 h-4 mr-2" />
              Follow back
            </Button>
          )}
          
          {actionType === 'unfollow' && onUnfollowUser && (
            <Button
              variant="outline"
              className="hover:bg-red-50 hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onUnfollowUser();
              }}
            >
              Unfollow
            </Button>
          )}
        </>
      )}
    </div>
  );
};