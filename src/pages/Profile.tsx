import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { useState, useRef, useEffect } from "react";
import { useUser } from '@supabase/auth-helpers-react';
import { Camera, Link as LinkIcon, Twitter, Linkedin, Settings, MoreHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ProfileData = {
  full_name: string;
  username: string;
  bio: string;
  website: string;
  twitter: string;
  linkedin: string;
};

const Profile = () => {
  const user = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('activity');
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: "",
    username: "",
    bio: "",
    website: "",
    twitter: "",
    linkedin: "",
  });
  const [subscriberCount, setSubscriberCount] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue } = useForm<ProfileData>({
    defaultValues: profileData
  });

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfileData({
          full_name: data.full_name || "",
          username: data.username || "",
          bio: data.bio || "",
          website: data.website || "",
          twitter: data.social_twitter || "",
          linkedin: data.social_linkedin || "",
        });
        setAvatarUrl(data.avatar_url);
        setSubscriberCount(data.subscriber_count || 0);

        // Update form values
        setValue("full_name", data.full_name || "");
        setValue("username", data.username || "");
        setValue("bio", data.bio || "");
        setValue("website", data.website || "");
        setValue("twitter", data.social_twitter || "");
        setValue("linkedin", data.social_linkedin || "");
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
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
        .upload(filePath, file, {
          upsert: true,
        });

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
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to update profile picture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
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
          social_linkedin: data.linkedin,
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfileData(data);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold text-gray-900">{profileData.full_name || "Add your name"}</h1>
          </div>
          <div className="flex items-center gap-4 text-gray-600">
            <span>@{profileData.username || "username"}</span>
            <span>•</span>
            <button className="hover:text-gray-900">Links</button>
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
            className="w-24 h-24 rounded-full overflow-hidden cursor-pointer group relative"
            onClick={handleAvatarClick}
          >
            {avatarUrl ? (
              <div className="relative w-full h-full">
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <Camera className="w-6 h-6 text-gray-400" />
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-lg text-gray-700 mb-4">
          {profileData.bio || "Add a bio to tell people about yourself"}
        </p>
        <div className="text-gray-600 mb-4">
          {subscriberCount > 0 && (
            <span className="font-medium">{subscriberCount}K+ subscribers</span>
          )}
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <Button 
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
        >
          New post
        </Button>
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => setIsEditing(!isEditing)}
        >
          Edit profile
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          className="px-2.5"
        >
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
                <input
                  id="full_name"
                  {...register("full_name")}
                  className="w-full p-2 border rounded-md"
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  @handle
                </label>
                <input
                  id="username"
                  {...register("username")}
                  className="w-full p-2 border rounded-md"
                  placeholder="@username"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="bio" className="text-sm font-medium">
                  Bio
                </label>
                <textarea
                  id="bio"
                  {...register("bio")}
                  className="w-full p-2 border rounded-md"
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
                    {...register("website")}
                    className="flex-1 p-2 border rounded-md"
                    placeholder="https://your-website.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="twitter" className="text-sm font-medium">
                  Twitter
                </label>
                <div className="flex items-center space-x-2">
                  <Twitter className="w-4 h-4 text-gray-400" />
                  <input
                    id="twitter"
                    {...register("twitter")}
                    className="flex-1 p-2 border rounded-md"
                    placeholder="@twitter_handle"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="linkedin" className="text-sm font-medium">
                  LinkedIn
                </label>
                <div className="flex items-center space-x-2">
                  <Linkedin className="w-4 h-4 text-gray-400" />
                  <input
                    id="linkedin"
                    {...register("linkedin")}
                    className="flex-1 p-2 border rounded-md"
                    placeholder="linkedin.com/in/username"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
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
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'activity' 
                  ? 'text-gray-900 border-b-2 border-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'posts' 
                  ? 'text-gray-900 border-b-2 border-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab('likes')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'likes' 
                  ? 'text-gray-900 border-b-2 border-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Likes
            </button>
            <button
              onClick={() => setActiveTab('reads')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'reads' 
                  ? 'text-gray-900 border-b-2 border-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Reads (116)
            </button>
          </div>

          <div className="py-8">
            {activeTab === 'activity' && (
              <div className="text-gray-600">
                No activity yet
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
