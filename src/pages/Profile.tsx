
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { useState, useRef } from "react";
import { useUser } from '@supabase/auth-helpers-react';
import { Camera, Link as LinkIcon, Twitter, Linkedin, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ProfileData = {
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
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue } = useForm<ProfileData>({
    defaultValues: {
      username: "",
      bio: "",
      website: "",
      twitter: "",
      linkedin: "",
    },
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleBannerClick = () => {
    bannerInputRef.current?.click();
  };

  const handleBannerChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploadingBanner(true);
      
      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update banner_url in profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ banner_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setBannerUrl(publicUrl);
      toast({
        title: "Success",
        description: "Banner image updated successfully",
      });
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast({
        title: "Error",
        description: "Failed to update banner image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);
      
      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update avatar_url in profiles table
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
          username: data.username,
          bio: data.bio,
          website: data.website,
          social_twitter: data.twitter,
          social_linkedin: data.linkedin,
        })
        .eq('id', user.id);

      if (error) throw error;

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
      <div className="relative mb-16">
        {/* Header Background with Upload Functionality */}
        <input
          type="file"
          ref={bannerInputRef}
          onChange={handleBannerChange}
          accept="image/*"
          className="hidden"
        />
        <div 
          className="h-40 bg-purple-50 rounded-xl overflow-hidden cursor-pointer group relative"
          onClick={handleBannerClick}
        >
          {bannerUrl ? (
            <div className="relative w-full h-full">
              <img 
                src={bannerUrl} 
                alt="Banner" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <Camera className="w-6 h-6 text-purple-400" />
              <span className="ml-2 text-purple-400">Upload banner image</span>
            </div>
          )}
          {isUploadingBanner && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
            </div>
          )}
        </div>
        
        {/* Profile Info Section */}
        <div className="absolute -bottom-12 left-0 right-0 px-8">
          <div className="flex items-end gap-6">
            {/* Avatar with Upload Functionality */}
            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div 
                className="w-24 h-24 rounded-full bg-white border-4 border-white overflow-hidden cursor-pointer group"
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
                  <div className="w-full h-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Camera className="w-6 h-6 text-purple-400" />
                  </div>
                )}
              </div>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                </div>
              )}
            </div>

            {/* Name and Username */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">John Doe</h1>
              <p className="text-gray-600">@johndoe</p>
            </div>

            {/* Edit Profile Button */}
            <Button 
              variant="ghost" 
              onClick={() => setIsEditing(!isEditing)}
              className="mb-0 mt-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
            >
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {isEditing ? (
          <Card className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium">
                    Username
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
          <>
            {/* Bio */}
            <div className="prose max-w-none">
              <p className="text-gray-600 text-lg">
                Investor and tech enthusiast. Sharing insights about market trends and investment opportunities.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-6 text-gray-600">
              <a href="#" className="flex items-center gap-2 hover:text-purple-600 transition-colors">
                <LinkIcon className="w-5 h-5" />
                <span>website.com</span>
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-purple-600 transition-colors">
                <Twitter className="w-5 h-5" />
                <span>@twitter_handle</span>
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-purple-600 transition-colors">
                <Linkedin className="w-5 h-5" />
                <span>LinkedIn</span>
              </a>
            </div>

            {/* Recent Activity */}
            <div className="pt-8 border-t">
              <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
              <div className="text-gray-600">
                No activity yet
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
