/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/profile/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { SocialSidebar } from "@/components/social/SocialSidebar";
import { SocialHeader } from "@/components/social/SocialHeader";
import { FollowerData, PortfolioData, ProfileData } from '@/components/profile/types';
import { profileAPI } from '@/services/profileApi';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileBio } from '@/components/profile/ProfileBio';
import { ProfileActions } from '@/components/profile/ProfileActions';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { PortfoliosTab } from '@/components/profile/tabs/PortfoliosTab';
import { FollowersTab } from '@/components/profile/tabs/FollowersTab';
import { FollowingTab } from '@/components/profile/tabs/FollowingTab';

// Import API and types

// Import components


// Define API base URL
const API_URL = 'http://localhost:4000';

type TabType = 'portfolios' | 'followers' | 'following';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('portfolios');
  const [isFollowing, setIsFollowing] = useState(false);
  const [userPortfolios, setUserPortfolios] = useState<PortfolioData[]>([]);
  const [profileData, setProfileData] = useState<ProfileData>({
    id: "",
    displayName: "",
    username: "",
    bio: "",
    website: "",
    twitterHandle: "",
    linkedinHandle: "",
    avatarUrl: null,
    followerCount: 0,
    followingCount: 0,
    isPrivate: false
  });
  const [followers, setFollowers] = useState<FollowerData[]>([]);
  const [following, setFollowing] = useState<FollowerData[]>([]);
  const [avatarVariants, setAvatarVariants] = useState<{
    original?: string;
    thumbnail?: string;
    medium?: string;
    optimized?: string;
  } | null>(null);
  
  const urlProfileId = new URLSearchParams(location.search).get('id');
  const profileId = urlProfileId || user?.id;
  const isOwner = user?.id === profileId;

  useEffect(() => {
    const initializeProfile = async () => {
      if (!user) {
        navigate('/signin');
        return;
      }

      if (!profileId) {
        navigate('/');
        return;
      }

      try {
        await fetchProfileData();
        if (user && profileId !== user.id) {
          await checkIfFollowing();
        }
        await fetchUserPortfolios();
        
        if (activeTab === 'followers') {
          await fetchFollowers();
        } else if (activeTab === 'following') {
          await fetchFollowing();
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing profile:', error);
        toast.error("Failed to load profile data");
        navigate('/');
      }
    };

    initializeProfile();
  }, [profileId, user]);

  useEffect(() => {
    if (activeTab === 'followers') {
      fetchFollowers();
    } else if (activeTab === 'following') {
      fetchFollowing();
    }
  }, [activeTab]);

  const checkIfFollowing = async () => {
    if (!user || !profileId) return;
    
    try {
      const followers = await profileAPI.getFollowers(profileId);
      setIsFollowing(followers.some((follower: any) => follower.id === user.id));
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const fetchProfileData = async () => {
    if (!profileId) return;
    
    try {
      const data = await profileAPI.getProfile(profileId);
      
      setProfileData({
        id: data.id,
        displayName: data.displayName || "",
        username: data.username || "",
        bio: data.bio || "",
        website: data.website || "",
        twitterHandle: data.twitterHandle || "",
        linkedinHandle: data.linkedinHandle || "",
        avatarUrl: data.avatarUrl,
        avatarVariants: data.avatarVariants || null,
        followerCount: Number(data.followerCount) || 0, 
        followingCount: Number(data.followingCount) || 0,
        isPrivate: data.isPrivate || false
      });
      setAvatarUrl(data.avatarUrl);
      setAvatarVariants(data.avatarVariants || null);
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  };

  const fetchUserPortfolios = async () => {
    if (!profileId) return;
    
    try {
      const data = await profileAPI.getUserPortfolios(profileId);
      setUserPortfolios(data || []);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      toast.error("Failed to load portfolios");
    }
  };

  const fetchFollowers = async () => {
    if (!profileId) return;
    
    try {
      const data = await profileAPI.getFollowers(profileId);
      
      // Map the API response to ensure the expected structure
      const formattedFollowers = data.map((follower: any) => ({
        id: follower.userId || follower.id,
        username: follower.username || "",
        displayName: follower.displayName || "",
        avatarUrl: follower.avatarUrl,
        isFollowing: follower.isFollowing || false
      }));
      
      setFollowers(formattedFollowers || []);
    } catch (error) {
      console.error('Error fetching followers:', error);
      toast.error("Failed to load followers");
    }
  };

  const fetchFollowing = async () => {
    if (!profileId) return;
    
    try {
      const data = await profileAPI.getFollowing(profileId);
      
      // Map the API response to ensure the expected structure
      const formattedFollowing = data.map((following: any) => ({
        id: following.userId || following.id,
        username: following.username || "",
        displayName: following.displayName || "",
        avatarUrl: following.avatarUrl,
        isFollowing: true // Following users are always "followed" by definition
      }));
      
      setFollowing(formattedFollowing || []);
    } catch (error) {
      console.error('Error fetching following:', error);
      toast.error("Failed to load following");
    }
  };

  const handleFollowBack = async (userId: string) => {
    if (!user || !userId) {
      toast.error("User information is missing");
      return;
    }
    
    try {
      await profileAPI.followUser(userId);
      
      // Update followers list to show following status
      setFollowers(followers.map(follower => 
        follower.id === userId 
          ? { ...follower, isFollowing: true }
          : follower
      ));
  
      // Immediately update the following count
      setProfileData(prev => ({
        ...prev,
        followingCount: (prev.followingCount || 0) + 1
      }));
      
      toast.success("Following user");
    } catch (error) {
      console.error('Error following user:', error);
      toast.error("Failed to follow user");
    }
  };

  const handleUnfollow = async (userId: string) => {
    if (!user) return;
    
    try {
      await profileAPI.unfollowUser(userId);
      
      // Update following list
      setFollowing(following.filter(follow => follow.id !== userId));
      
      // Update followers list if the user is in it to show "Follow back" button
      setFollowers(prev => prev.map(follower => 
        follower.id === userId 
          ? { ...follower, isFollowing: false }
          : follower
      ));
      
      // Immediately update the following count
      setProfileData(prev => ({
        ...prev,
        followingCount: Math.max(0, (prev.followingCount || 0) - 1)
      }));
      
      toast.success("Unfollowed user");
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast.error("Failed to unfollow user");
    }
  };

  const handleAvatarUpdated = (newAvatarUrl: string, newAvatarVariants?: any) => {
    setAvatarUrl(newAvatarUrl);
    setAvatarVariants(newAvatarVariants || null);
    
    // Also update profile data to ensure consistency
    setProfileData(prev => ({
      ...prev,
      avatarUrl: newAvatarUrl,
      avatarVariants: newAvatarVariants || null
    }));
  };

  const handleToggleFollow = async () => {
    if (!user || !profileId) {
      toast("Please sign in to follow users");
      return;
    }
    
    try {
      if (isFollowing) {
        await profileAPI.unfollowUser(profileId);
        setIsFollowing(false);
        toast(`Unfollowed ${profileData.displayName}`);
      } else {
        await profileAPI.followUser(profileId);
        setIsFollowing(true);
        toast(`Following ${profileData.displayName}`);
      }
      
      // Refresh profile data to update follower count
      await fetchProfileData();
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error("Failed to update follow status");
    }
  };

  const handleTogglePrivacy = async () => {
    if (!user) return;
    
    try {
      const response = await profileAPI.toggleProfilePrivacy();
      setProfileData(prev => ({
        ...prev,
        isPrivate: response.isPrivate
      }));
      
      toast.success(`Profile is now ${response.isPrivate ? 'private' : 'public'}`);
    } catch (error) {
      console.error('Error toggling privacy:', error);
      toast.error("Failed to update privacy settings");
    }
  };

  const handleProfileUpdate = async (data: Partial<ProfileData>) => {
    if (!user) return;
    
    try {
      const loadingToast = toast.loading("Updating profile...");
      
      const updatedProfile = await profileAPI.updateProfile(data);
      
      // Update profile data
      setProfileData(prev => ({
        ...prev,
        displayName: updatedProfile.displayName || prev.displayName,
        bio: updatedProfile.bio || prev.bio,
        website: updatedProfile.website || prev.website,
        twitterHandle: updatedProfile.twitterHandle || prev.twitterHandle,
        linkedinHandle: updatedProfile.linkedinHandle || prev.linkedinHandle,
        followerCount: updatedProfile.followerCount !== undefined ? updatedProfile.followerCount : prev.followerCount,
        followingCount: updatedProfile.followingCount !== undefined ? updatedProfile.followingCount : prev.followingCount
      }));
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success("Profile updated successfully");
      
      // Exit editing mode
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="fixed left-0 top-0 h-full w-[68px] border-r border-gray-200 dark:border-gray-800 z-10">
        <SocialSidebar />
      </div>
      <div className="fixed left-1/2 transform -translate-x-1/2" style={{
        width: '680px',
        marginLeft: '34px'
      }}>
        <div className="border-x border-gray-200 dark:border-gray-800 h-screen flex flex-col bg-white dark:bg-gray-900">
          <SocialHeader />
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-4">
              {/* Profile Header */}
              <ProfileHeader 
                profileData={profileData}
                avatarUrl={avatarUrl}
                avatarVariants={avatarVariants}
                isOwner={isOwner}
                onAvatarUpdated={handleAvatarUpdated}
                apiUrl={API_URL}
              />
              
              {/* Profile Bio */}
              <ProfileBio 
                profileData={profileData}
                isOwner={isOwner}
              />
              
              {/* Profile Actions */}
              <ProfileActions 
                isOwner={isOwner}
                isFollowing={isFollowing}
                onToggleFollow={handleToggleFollow}
                onEditProfile={() => setIsEditing(true)}
                onTogglePrivacy={handleTogglePrivacy}
                profileDisplayName={profileData.displayName}
                isPrivate={profileData.isPrivate}
              />
              
              {/* Edit Profile Form or Tabs */}
              {isEditing ? (
                <ProfileEditForm 
                  profileData={profileData}
                  onSubmit={handleProfileUpdate}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <div className="border-t">
                  {/* Tabs Navigation */}
                  <ProfileTabs 
                    activeTab={activeTab}
                    onTabChange={(tab) => setActiveTab(tab)}
                  />
                  
                  {/* Tab Content */}
                  <div className="py-6">
                    {activeTab === 'portfolios' && (
                      <PortfoliosTab 
                        portfolios={userPortfolios}
                        isOwner={isOwner}
                      />
                    )}
                    
                    {activeTab === 'followers' && (
                      <FollowersTab 
                        followers={followers}
                        currentUserId={user?.id}
                        onFollowUser={handleFollowBack}
                        onUnfollowUser={handleUnfollow}
                      />
                    )}
                    
                    {activeTab === 'following' && (
                      <FollowingTab 
                        following={following}
                        currentUserId={user?.id}
                        onUnfollowUser={handleUnfollow}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;