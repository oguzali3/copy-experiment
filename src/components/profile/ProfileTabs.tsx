// src/pages/profile/components/ProfileTabs.tsx
import React from 'react';

type TabType = 'portfolios' | 'followers' | 'following';

interface ProfileTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex gap-8 mt-4 border-b">
      <button 
        onClick={() => onTabChange('portfolios')} 
        className={`px-4 py-2 font-medium ${activeTab === 'portfolios' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
      >
        Portfolios
      </button>
      <button 
        onClick={() => onTabChange('followers')} 
        className={`px-4 py-2 font-medium ${activeTab === 'followers' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
      >
        Followers
      </button>
      <button 
        onClick={() => onTabChange('following')} 
        className={`px-4 py-2 font-medium ${activeTab === 'following' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
      >
        Following
      </button>
    </div>
  );
};