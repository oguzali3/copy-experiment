// src/pages/profile/components/ProfileBio.tsx
import React from 'react';
import { Link as LinkIcon, Twitter, Linkedin } from "lucide-react";
import { ProfileData } from './types';

interface ProfileBioProps {
  profileData: ProfileData;
  isOwner: boolean;
}

export const ProfileBio: React.FC<ProfileBioProps> = ({ profileData, isOwner }) => {
  return (
    <div className="mb-6">
      <p className="text-base text-gray-700 dark:text-gray-300 mb-3">
        {profileData.bio || (isOwner ? "Add a bio to tell people about yourself" : "")}
      </p>
      
      {profileData.website && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <LinkIcon className="w-4 h-4" />
          <a 
            href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-blue-500 transition-colors"
          >
            {profileData.website}
          </a>
        </div>
      )}
      
      {profileData.twitterHandle && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
          <Twitter className="w-4 h-4" />
          <a 
            href={`https://twitter.com/${profileData.twitterHandle}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-blue-500 transition-colors"
          >
            @{profileData.twitterHandle}
          </a>
        </div>
      )}
      
      {profileData.linkedinHandle && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
          <Linkedin className="w-4 h-4" />
          <a 
            href={`https://linkedin.com/in/${profileData.linkedinHandle}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-blue-500 transition-colors"
          >
            {profileData.linkedinHandle}
          </a>
        </div>
      )}
    </div>
  );
};