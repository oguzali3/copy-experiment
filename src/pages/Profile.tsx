/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useState, useRef, useEffect } from "react";
import { Camera, Link as LinkIcon, Twitter, Linkedin, Settings, MoreHorizontal, TrendingUp, TrendingDown, UserPlus, UserMinus, UserCircle } from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';
import { SocialSidebar } from "@/components/social/SocialSidebar";
import { SocialHeader } from "@/components/social/SocialHeader";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { AvatarDisplay } from "@/components/social/AvatarDisplay";
import { ProfileAvatarUploader } from "@/components/social/ProfileAvatarUploader";

// Define API base URL - updated to use localhost:4000
const API_URL = 'http://localhost:4000';

// Types from your backend
type ProfileData = {
  id: string;
  displayName: string;
  username: string;
  bio: string;
  website: string;
  twitterHandle: string;
  linkedinHandle: string;
  avatarUrl: string | null;
  avatarVariants?: {
    original?: string;
    thumbnail?: string;
    medium?: string;
    optimized?: string;
  } | null;
  followerCount: number;
  followingCount: number;
  isPrivate: boolean;
};

type PortfolioData = {
  id: string;
  name: string;
  yearlyPerformance: number | null;
  totalValue: number | null;
};

type FollowerData = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  isFollowing: boolean;
};

// API service - updated to match your NestJS controller endpoints
const api = {
  async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };

    const response = await fetch(`${API_URL}/${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  },

  async getProfile(userId: string) {
    return this.fetchWithAuth(`profiles/${userId}`);
  },

  async updateProfile(data: Partial<ProfileData>) {
    return this.fetchWithAuth('profiles', {
      method: 'PUT',
      body: JSON.stringify({
        displayName: data.displayName,
        bio: data.bio,
        website: data.website,
        twitterHandle: data.twitterHandle,
        linkedinHandle: data.linkedinHandle
      })
    });
  },

  async followUser(userId: string) {
    return this.fetchWithAuth(`profiles/follow/${userId}`, {
      method: 'POST'
    });
  },

  async unfollowUser(userId: string) {
    return this.fetchWithAuth(`profiles/unfollow/${userId}`, {
      method: 'POST'
    });
  },

  async getFollowers(userId: string) {
    // This endpoint needs to be implemented in your backend
    return this.fetchWithAuth(`profiles/${userId}/followers`);
  },

  async getFollowing(userId: string) {
    // This endpoint needs to be implemented in your backend
    return this.fetchWithAuth(`profiles/${userId}/following`);
  },

  async getUserPortfolios(userId: string) {
    // This endpoint needs to be implemented in your backend
    return this.fetchWithAuth(`portfolios/user/${userId}`);
  },

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/profiles/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload avatar');
    }

    return response.json(); // This should now include avatarVariants
  },

  async toggleProfilePrivacy() {
    return this.fetchWithAuth('profiles/privacy', {
      method: 'POST'
    });
  },

  async updatePreferences(preferences: any) {
    return this.fetchWithAuth('profiles/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences)
    });
  },

  async searchProfiles(query: string, limit: number = 10) {
    return this.fetchWithAuth(`profiles/search?query=${encodeURIComponent(query)}&limit=${limit}`);
  }
};

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolios');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [avatarVariants, setAvatarVariants] = useState<{
    original?: string;
    thumbnail?: string;
    medium?: string;
    optimized?: string;
  } | null>(null);
  

  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<ProfileData>();

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
      // Check if current user is following the profile user
      const followers = await api.getFollowers(profileId);
      setIsFollowing(followers.some((follower: any) => follower.id === user.id));
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!user || !profileId) {
      toast("Please sign in to follow users");
      return;
    }
    
    try {
      if (isFollowing) {
        await api.unfollowUser(profileId);
        setIsFollowing(false);
        toast(`Unfollowed ${profileData.displayName}`);
      } else {
        await api.followUser(profileId);
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

  const togglePrivacy = async () => {
    if (!user) return;
    
    try {
      const response = await api.toggleProfilePrivacy();
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

  const fetchProfileData = async () => {
    if (!profileId) return;
    
    try {
      const data = await api.getProfile(profileId);
      
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
        followerCount: data.followerCount || 0,
        followingCount: data.followingCount || 0,
        isPrivate: data.isPrivate || false
      });
      setAvatarUrl(data.avatarUrl);
      setAvatarVariants(data.avatarVariants || null);
  
      // Update form values if owner
      if (isOwner) {
        setValue("displayName", data.displayName || "");
        setValue("username", data.username || "");
        setValue("bio", data.bio || "");
        setValue("website", data.website || "");
        setValue("twitterHandle", data.twitterHandle || "");
        setValue("linkedinHandle", data.linkedinHandle || "");
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  };

  const fetchUserPortfolios = async () => {
    if (!profileId) return;
    
    try {
      const data = await api.getUserPortfolios(profileId);
      setUserPortfolios(data || []);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      toast.error("Failed to load portfolios");
    }
  };

  const fetchFollowers = async () => {
    if (!profileId) return;
    
    try {
      const data = await api.getFollowers(profileId);
      setFollowers(data || []);
    } catch (error) {
      console.error('Error fetching followers:', error);
      toast.error("Failed to load followers");
    }
  };

  const fetchFollowing = async () => {
    if (!profileId) return;
    
    try {
      const data = await api.getFollowing(profileId);
      setFollowing(data || []);
    } catch (error) {
      console.error('Error fetching following:', error);
      toast.error("Failed to load following");
    }
  };
  const getListItemKey = (type: string, id: string) => `${type}-${id}`;

  const handleFollowBack = async (userId: string) => {
    if (!user) {
      toast("Please sign in to follow users");
      return;
    }
    
    try {
      await api.followUser(userId);
      
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
      await api.unfollowUser(userId);
      
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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    try {
      setIsUploading(true);
      
      const response = await api.uploadAvatar(file);
      
      setAvatarUrl(response.avatarUrl);
      setAvatarVariants(response.avatarVariants || null);
      toast("Profile picture updated successfully");
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error("Failed to update profile picture. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePortfolioClick = (portfolioId: string) => {
    navigate('/portfolio', {
      state: { portfolioId }
    });
  };

  const onSubmit = async (data: ProfileData) => {
    if (!user) return;
    try {
      const updatedProfile = await api.updateProfile({
        displayName: data.displayName,
        username: data.username,
        bio: data.bio,
        website: data.website,
        twitterHandle: data.twitterHandle,
        linkedinHandle: data.linkedinHandle
      });
      
      setProfileData({ ...profileData, ...updatedProfile });
      toast("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile");
    }
  };

  const handleMoreOptionsClick = () => {
    setShowPrivacySettings(!showPrivacySettings);
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
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {profileData.displayName || "Add your name"}
                    </h1>
                    {profileData.isPrivate && (
                      <div className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs font-medium text-gray-700 dark:text-gray-300">
                        Private
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>@{profileData.username || "username"}</span>
                    <span>•</span>
                    <span>{profileData.followerCount} followers</span>
                    <span>•</span>
                    <span>{profileData.followingCount} following</span>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <div className="flex-shrink-0">
                    <ProfileAvatarUploader
                      avatarUrl={avatarUrl}
                      avatarVariants={avatarVariants}
                      onAvatarUpdated={handleAvatarUpdated}
                      isOwner={isOwner}
                      username={profileData.username}
                      size="xl"
                      apiUrl={API_URL}
                    />
                  </div>
                </div>
              </div>
  
              <div className="mb-6">
                <p className="text-base text-gray-700 dark:text-gray-300 mb-3">
                  {profileData.bio || (isOwner ? "Add a bio to tell people about yourself" : "")}
                </p>
                {profileData.website && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <LinkIcon className="w-4 h-4" />
                    <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500">
                      {profileData.website}
                    </a>
                  </div>
                )}
                {profileData.twitterHandle && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Twitter className="w-4 h-4" />
                    <a href={`https://twitter.com/${profileData.twitterHandle}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500">
                      @{profileData.twitterHandle}
                    </a>
                  </div>
                )}
                {profileData.linkedinHandle && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Linkedin className="w-4 h-4" />
                    <a href={`https://linkedin.com/in/${profileData.linkedinHandle}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500">
                      {profileData.linkedinHandle}
                    </a>
                  </div>
                )}
              </div>
  
              <div className="flex gap-3 mb-6">
                {isOwner ? (
                  <>
                    <Button className="flex-1 text-white text-sm bg-blue-500 hover:bg-blue-400">
                      New post
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 text-sm" 
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      Edit profile
                    </Button>
                  </>
                ) : (
                  <Button
                    className={`flex-1 text-sm ${isFollowing ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' : 'bg-blue-500 hover:bg-blue-400 text-white'}`}
                    onClick={handleFollow}
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
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                  
                  {showPrivacySettings && isOwner && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 py-1 border border-gray-200 dark:border-gray-700">
                      <button 
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={togglePrivacy}
                      >
                        {profileData.isPrivate ? 'Make Profile Public' : 'Make Profile Private'}
                      </button>
                      <button 
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => navigate('/settings')}
                      >
                        Settings
                      </button>
                    </div>
                  )}
                </div>
              </div>
  
              {isEditing ? (
                <Card className="p-6">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="displayName" className="text-sm font-medium">
                          Display Name
                        </label>
                        <input 
                          id="displayName" 
                          {...register("displayName", { required: "Display name is required" })} 
                          className={`w-full p-2 border rounded-md ${errors.displayName ? 'border-red-500' : 'border-gray-300'}`} 
                          placeholder="Your display name" 
                        />
                        {errors.displayName && (
                          <p className="text-red-500 text-xs mt-1">{errors.displayName.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="username" className="text-sm font-medium">
                          @handle
                        </label>
                        <input 
                          id="username" 
                          {...register("username", { required: "Username is required", pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Username can only contain letters, numbers, and underscores" } })} 
                          className={`w-full p-2 border rounded-md ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="@username" 
                        />
                        {errors.username && (
                          <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="bio" className="text-sm font-medium">
                          Bio
                        </label>
                        <textarea 
                          id="bio" 
                          {...register("bio")} 
                          className="w-full p-2 border rounded-md border-gray-300" 
                          rows={4} 
                          placeholder="Tell us about yourself..." 
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="website" className="text-sm font-medium">
                          Website
                        </label>
                        <div className="flex items-center space-x-2">
                          <LinkIcon className="w-4 h-4 text-gray-400" />
                          <input 
                            id="website" 
                            {...register("website", { 
                              // pattern: { 
                              //   value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, 
                              //   message: "Please enter a valid URL" 
                              // } 
                            })} 
                            className={`flex-1 p-2 border rounded-md ${errors.website ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="https://your-website.com" 
                          />
                        </div>
                        {errors.website && (
                          <p className="text-red-500 text-xs mt-1">{errors.website.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="twitterHandle" className="text-sm font-medium">
                          Twitter
                        </label>
                        <div className="flex items-center space-x-2">
                          <Twitter className="w-4 h-4 text-gray-400" />
                          <input 
                            id="twitterHandle" 
                            {...register("twitterHandle", { 
                              pattern: { 
                                value: /^[a-zA-Z0-9_]{1,15}$/, 
                                message: "Please enter a valid Twitter handle" 
                              } 
                            })} 
                            className={`flex-1 p-2 border rounded-md ${errors.twitterHandle ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="@twitter_handle" 
                          />
                        </div>
                        {errors.twitterHandle && (
                          <p className="text-red-500 text-xs mt-1">{errors.twitterHandle.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="linkedinHandle" className="text-sm font-medium">
                          LinkedIn
                        </label>
                        <div className="flex items-center space-x-2">
                          <Linkedin className="w-4 h-4 text-gray-400" />
                          <input 
                            id="linkedinHandle" 
                            {...register("linkedinHandle")} 
                            className="flex-1 p-2 border rounded-md border-gray-300" 
                            placeholder="linkedin.com/in/username" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </Card>
              ) : (
                <div className="border-t">
                  <div className="flex gap-8 mt-4 border-b">
                    <button 
                      onClick={() => setActiveTab('portfolios')} 
                      className={`px-4 py-2 font-medium ${activeTab === 'portfolios' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      Portfolios
                    </button>
                    <button 
                      onClick={() => setActiveTab('followers')} 
                      className={`px-4 py-2 font-medium ${activeTab === 'followers' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      Followers
                    </button>
                    <button 
                      onClick={() => setActiveTab('following')} 
                      className={`px-4 py-2 font-medium ${activeTab === 'following' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      Following
                    </button>
                  </div>
  
                  <div className="py-6">
                    {activeTab === 'portfolios' && (
                      <div className="space-y-4">
                        {isOwner && (
                          <Button 
                            onClick={() => navigate('/portfolio-subscriptions')} 
                            className="w-full bg-gradient-to-r from-black to-gray-900 hover:from-gray-900 hover:to-black text-white font-medium py-2.5"
                          >
                            Create A Portfolio Subscription Service
                          </Button>
                        )}
                        
                        <div className="space-y-2">
                          {userPortfolios.length > 0 ? userPortfolios.map(portfolio => (
                            <button 
                              key={portfolio.id} 
                              className="w-full group transition-all duration-300 hover:scale-[1.01]" 
              onClick={() => handlePortfolioClick(portfolio.id)}
            >
              <div className="py-3 px-4 bg-gradient-to-br from-white to-gray-50/90 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-gray-800">
                      {portfolio.name}
                    </h3>
                    <span className="text-sm text-gray-500 font-medium">
                      ${portfolio.totalValue?.toLocaleString() || '0'}
                    </span>
                  </div>
                  {portfolio.yearlyPerformance !== null && (
                    <div className={`flex items-center ${portfolio.yearlyPerformance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {portfolio.yearlyPerformance >= 0 ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                      )}
                      <span className="text-sm font-medium">
                        {Math.abs(portfolio.yearlyPerformance).toFixed(2)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          )) : (
            <div className="text-gray-600">
              No portfolios yet
            </div>
          )}
        </div>
      </div>
    )}

    {activeTab === 'followers' && (
      <div className="space-y-4">
        {followers.length > 0 ? (
          followers.map(follower => (
            <div key={getListItemKey('follower', follower.id)} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                  {follower.avatarUrl ? (
                    <img 
                      src={follower.avatarUrl} 
                      alt={follower.username} 
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
                    {follower.displayName}
                  </h3>
                  <p className="text-sm text-gray-500">@{follower.username}</p>
                </div>
              </div>
              {user && user.id !== follower.id && (
                <Button
                  variant={follower.isFollowing ? "outline" : "default"}
                  className={follower.isFollowing ? "hover:bg-red-50 hover:text-red-600" : ""}
                  onClick={() => follower.isFollowing 
                    ? handleUnfollow(follower.id)
                    : handleFollowBack(follower.id)
                  }
                >
                  {follower.isFollowing ? (
                    "Unfollow"
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Follow back
                    </>
                  )}
                </Button>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No followers yet
          </div>
        )}
      </div>
    )}

    {activeTab === 'following' && (
      <div className="space-y-4">
        {following.length > 0 ? (
          following.map(follow => (
            <div key={getListItemKey('following', follow.id)} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                  {follow.avatarUrl ? (
                    <img 
                      src={follow.avatarUrl} 
                      alt={follow.username} 
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
                    {follow.displayName}
                  </h3>
                  <p className="text-sm text-gray-500">@{follow.username}</p>
                </div>
              </div>
              {user && user.id !== follow.id && (
                <Button
                  variant="outline"
                  className="hover:bg-red-50 hover:text-red-600"
                  onClick={() => handleUnfollow(follow.id)}
                >
                  Unfollow
                </Button>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            Not following anyone yet
          </div>
        )}
      </div>
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

// Add default export to fix the error
export default Profile;