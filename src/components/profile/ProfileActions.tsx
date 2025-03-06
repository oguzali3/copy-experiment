// src/pages/profile/components/ProfileActions.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { UserMinus, UserPlus, MoreHorizontal } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface ProfileActionsProps {
  isOwner: boolean;
  isFollowing: boolean;
  onToggleFollow: () => Promise<void>;
  onEditProfile: () => void;
  onTogglePrivacy: () => Promise<void>;
  profileDisplayName: string;
  isPrivate: boolean;
}

export const ProfileActions: React.FC<ProfileActionsProps> = ({
  isOwner,
  isFollowing,
  onToggleFollow,
  onEditProfile,
  onTogglePrivacy,
  profileDisplayName,
  isPrivate
}) => {
  const navigate = useNavigate();
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);

  const handleMoreOptionsClick = () => {
    setShowPrivacySettings(!showPrivacySettings);
  };

  const handlePrivacyToggle = async () => {
    await onTogglePrivacy();
    setShowPrivacySettings(false);
  };

  return (
    <div className="flex gap-3 mb-6">
      {isOwner ? (
        <>
          <Button className="flex-1 text-white text-sm bg-blue-500 hover:bg-blue-400 transition-colors">
            New post
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 text-sm transition-colors" 
            onClick={onEditProfile}
          >
            Edit profile
          </Button>
        </>
      ) : (
        <Button
          className={`flex-1 text-sm transition-colors ${isFollowing ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' : 'bg-blue-500 hover:bg-blue-400 text-white'}`}
          onClick={onToggleFollow}
        >
          {isFollowing ? (
            <>
              <UserMinus className="w-4 h-4 mr-2" />
              Unfollow
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Follow
            </>
          )}
        </Button>
      )}
      
      <div className="relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="px-2"
          onClick={handleMoreOptionsClick}
          aria-label="More options"
        >
          <MoreHorizontal className="w-5 h-5" />
        </Button>
        
        {showPrivacySettings && isOwner && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 py-1 border border-gray-200 dark:border-gray-700">
            <button 
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={handlePrivacyToggle}
            >
              {isPrivate ? 'Make Profile Public' : 'Make Profile Private'}
            </button>
            <button 
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => navigate('/settings')}
            >
              Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
};