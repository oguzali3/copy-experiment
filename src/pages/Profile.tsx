import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useState, useRef, useEffect } from "react";
import { useUser } from '@supabase/auth-helpers-react';
import { Camera, Link as LinkIcon, Twitter, Linkedin, Settings, MoreHorizontal, TrendingUp, TrendingDown, UserPlus, UserMinus, UserCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from 'react-router-dom';
import { SocialSidebar } from "@/components/social/SocialSidebar";
import { SocialHeader } from "@/components/social/SocialHeader";
import { toast } from "sonner";

type ProfileData = {
  id: string;
  full_name: string;
  username: string;
  bio: string;
  website: string;
  twitter: string;
  linkedin: string;
  avatar_url: string | null;
  follower_count: number;
  following_count: number;
};

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolios');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userPortfolios, setUserPortfolios] = useState<Array<{
    id: string;
    name: string;
    yearly_performance: number | null;
    total_value: number | null;
  }>>([]);
  const [profileData, setProfileData] = useState<ProfileData>({
    id: "",
    full_name: "",
    username: "",
    bio: "",
    website: "",
    twitter: "",
    linkedin: "",
    avatar_url: null,
    follower_count: 0,
    following_count: 0
  });
  const [followers, setFollowers] = useState<Array<{
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
    is_following: boolean;
  }>>([]);
  const [following, setFollowing] = useState<Array<{
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
  }>>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    setValue
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

      await fetchProfileData();
      if (user && profileId !== user.id) {
        await checkIfFollowing();
      }
      await fetchUserPortfolios();
      await fetchFollowers();
      await fetchFollowing();
      setIsLoading(false);
    };

    initializeProfile();
  }, [profileId, user]);

  const checkIfFollowing = async () => {
    if (!user || !profileId) return;
    
    try {
      const { data, error } = await supabase
        .from('user_followers')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', profileId)
        .maybeSingle();
      
      if (error) throw error;
      setIsFollowing(!!data);
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
        const { error } = await supabase
          .from('user_followers')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profileId);
        
        if (error) throw error;
        setIsFollowing(false);
        toast(`Unfollowed ${profileData.full_name}`);
      } else {
        const { error } = await supabase
          .from('user_followers')
          .insert([{
            follower_id: user.id,
            following_id: profileId
          }]);
        
        if (error) throw error;
        setIsFollowing(true);
        toast(`Following ${profileData.full_name}`);
      }
      
      // Refresh profile data to update follower count
      await fetchProfileData();
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast("Failed to update follow status");
    }
  };

  const fetchProfileData = async () => {
    if (!profileId) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        toast("Profile not found");
        navigate('/');
        return;
      }

      setProfileData({
        id: data.id,
        full_name: data.full_name || "",
        username: data.username || "",
        bio: data.bio || "",
        website: data.website || "",
        twitter: data.social_twitter || "",
        linkedin: data.social_linkedin || "",
        avatar_url: data.avatar_url,
        follower_count: data.follower_count || 0,
        following_count: data.following_count || 0
      });
      setAvatarUrl(data.avatar_url);

      // Update form values if owner
      if (isOwner) {
        setValue("full_name", data.full_name || "");
        setValue("username", data.username || "");
        setValue("bio", data.bio || "");
        setValue("website", data.website || "");
        setValue("twitter", data.social_twitter || "");
        setValue("linkedin", data.social_linkedin || "");
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast("Failed to load profile data");
      navigate('/');
    }
  };

  const fetchUserPortfolios = async () => {
    if (!profileId) return;
    
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('id, name, yearly_performance, total_value')
        .eq('user_id', profileId);
      
      if (error) throw error;
      setUserPortfolios(data || []);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      toast("Failed to load portfolios");
    }
  };

  const fetchFollowers = async () => {
    if (!profileId) return;
    
    try {
      const { data: followersData, error: followersError } = await supabase
        .from('user_followers')
        .select(`
          follower_id,
          profiles!user_followers_follower_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('following_id', profileId);

      if (followersError) throw followersError;
      if (!followersData) return;

      let followBackStatus: Record<string, boolean> = {};
      
      if (user) {
        const { data: followingData } = await supabase
          .from('user_followers')
          .select('following_id')
          .eq('follower_id', user.id);

        if (followingData) {
          followBackStatus = followingData.reduce((acc, curr) => ({
            ...acc,
            [curr.following_id]: true
          }), {});
        }
      }

      const processedFollowers = followersData
        .filter(item => item.profiles) // Filter out any null values
        .map(item => ({
          id: item.profiles.id,
          username: item.profiles.username || '',
          full_name: item.profiles.full_name || '',
          avatar_url: item.profiles.avatar_url,
          is_following: !!followBackStatus[item.profiles.id]
        }));

      setFollowers(processedFollowers);
    } catch (error) {
      console.error('Error fetching followers:', error);
      toast.error("Failed to load followers");
    }
  };

  const fetchFollowing = async () => {
    if (!profileId) return;
    
    try {
      const { data: followingData, error: followingError } = await supabase
        .from('user_followers')
        .select(`
          following_id,
          profiles!user_followers_following_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('follower_id', profileId);

      if (followingError) throw followingError;
      if (!followingData) return;

      const processedFollowing = followingData
        .filter(item => item.profiles) // Filter out any null values
        .map(item => ({
          id: item.profiles.id,
          username: item.profiles.username || '',
          full_name: item.profiles.full_name || '',
          avatar_url: item.profiles.avatar_url
        }));

      setFollowing(processedFollowing);
    } catch (error) {
      console.error('Error fetching following:', error);
      toast.error("Failed to load following");
    }
  };

  useEffect(() => {
    if (activeTab === 'followers') {
      fetchFollowers();
    } else if (activeTab === 'following') {
      fetchFollowing();
    }
  }, [activeTab, profileId]);

  const handleFollowBack = async (userId: string) => {
    if (!user) {
      toast("Please sign in to follow users");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('user_followers')
        .insert([{
          follower_id: user.id,
          following_id: userId
        }]);
      
      if (error) throw error;
      
      // Update followers list to show following status
      setFollowers(followers.map(follower => 
        follower.id === userId 
          ? { ...follower, is_following: true }
          : follower
      ));

      // Immediately update the following count
      setProfileData(prev => ({
        ...prev,
        following_count: (prev.following_count || 0) + 1
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
      const { error } = await supabase
        .from('user_followers')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);
      
      if (error) throw error;
      
      // Update following list
      setFollowing(following.filter(follow => follow.id !== userId));
      
      // Update followers list if the user is in it to show "Follow back" button
      setFollowers(prev => prev.map(follower => 
        follower.id === userId 
          ? { ...follower, is_following: false }
          : follower
      ));
      
      // Immediately update the following count
      setProfileData(prev => ({
        ...prev,
        following_count: Math.max(0, (prev.following_count || 0) - 1)
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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      setAvatarUrl(publicUrl);
      toast("Profile picture updated successfully");
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast("Failed to update profile picture. Please try again.");
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
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          username: data.username,
          bio: data.bio,
          website: data.website,
          social_twitter: data.twitter,
          social_linkedin: data.linkedin
        })
        .eq('id', user.id);
      
      if (error) throw error;
      setProfileData({ ...profileData, ...data });
      toast("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast("Failed to update profile");
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
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {profileData.full_name || "Add your name"}
                    </h1>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>@{profileData.username || "username"}</span>
                    <span>•</span>
                    <span>{profileData.follower_count} followers</span>
                    <span>•</span>
                    <span>{profileData.following_count} following</span>
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
                  <div 
                    className={`w-20 h-20 rounded-full overflow-hidden ${isOwner ? 'cursor-pointer group' : ''} relative`}
                    onClick={isOwner ? handleAvatarClick : undefined}
                  >
                    {avatarUrl ? (
                      <div className="relative w-full h-full">
                        <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                        {isOwner && (
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        <Camera className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-full">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                      </div>
                    )}
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
                <Button variant="ghost" size="icon" className="px-2">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </div>

              {isEditing ? (
                <Card className="p-6">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="full_name" className="text-sm font-medium">
                          Username
                        </label>
                        <input id="full_name" {...register("full_name")} className="w-full p-2 border rounded-md" placeholder="Your full name" />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="username" className="text-sm font-medium">
                          @handle
                        </label>
                        <input id="username" {...register("username")} className="w-full p-2 border rounded-md" placeholder="@username" />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="bio" className="text-sm font-medium">
                          Bio
                        </label>
                        <textarea id="bio" {...register("bio")} className="w-full p-2 border rounded-md" rows={4} placeholder="Tell us about yourself..." />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="website" className="text-sm font-medium">
                          Website
                        </label>
                        <div className="flex items-center space-x-2">
                          <LinkIcon className="w-4 h-4 text-gray-400" />
                          <input id="website" {...register("website")} className="flex-1 p-2 border rounded-md" placeholder="https://your-website.com" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="twitter" className="text-sm font-medium">
                          Twitter
                        </label>
                        <div className="flex items-center space-x-2">
                          <Twitter className="w-4 h-4 text-gray-400" />
                          <input id="twitter" {...register("twitter")} className="flex-1 p-2 border rounded-md" placeholder="@twitter_handle" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="linkedin" className="text-sm font-medium">
                          LinkedIn
                        </label>
                        <div className="flex items-center space-x-2">
                          <Linkedin className="w-4 h-4 text-gray-400" />
                          <input id="linkedin" {...register("linkedin")} className="flex-1 p-2 border rounded-md" placeholder="linkedin.com/in/username" />
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
                                      ${portfolio.total_value?.toLocaleString() || '0'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {portfolio.yearly_performance !== null && (
                                      <div className={`flex items-center px-3 py-1 rounded-md ${
                                        portfolio.yearly_performance >= 0 
                                          ? 'text-green-600 bg-green-50 group-hover:bg-green-100/80' 
                                          : 'text-red-600 bg-red-50 group-hover:bg-red-100/80'
                                      } transition-colors duration-300`}>
                                        {portfolio.yearly_performance >= 0 
                                          ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> 
                                          : <TrendingDown className="w-3.5 h-3.5 mr-1" />
                                        }
                                        <span className="text-sm font-semibold">
                                          {Math.abs(portfolio.yearly_performance).toFixed(2)}%
                                        </span>
                                      </div>
                                    )}
                                  </div>
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
                            <div key={follower.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                                  {follower.avatar_url ? (
                                    <img 
                                      src={follower.avatar_url} 
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
                                    {follower.full_name}
                                  </h3>
                                  <p className="text-sm text-gray-500">@{follower.username}</p>
                                </div>
                              </div>
                              {user && user.id !== follower.id && (
                                <Button
                                  variant={follower.is_following ? "outline" : "default"}
                                  className={follower.is_following ? "hover:bg-red-50 hover:text-red-600" : ""}
                                  onClick={() => follower.is_following 
                                    ? handleUnfollow(follower.id)
                                    : handleFollowBack(follower.id)
                                  }
                                >
                                  {follower.is_following ? (
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
                            <div key={follow.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                                  {follow.avatar_url ? (
                                    <img 
                                      src={follow.avatar_url} 
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
                                    {follow.full_name}
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

export default Profile;
