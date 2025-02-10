
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
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

  const { register, handleSubmit, setValue } = useForm<ProfileData>({
    defaultValues: {
      username: "",
      bio: "",
      website: "",
      twitter: "",
      linkedin: "",
    },
  });

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
        {/* Header Background */}
        <div className="h-40 bg-purple-50 rounded-xl" />
        
        {/* Profile Info Section */}
        <div className="absolute -bottom-12 left-0 right-0 px-8">
          <div className="flex items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white border-4 border-white overflow-hidden">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-purple-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Name and Username */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">John Doe</h1>
              <p className="text-gray-600">@johndoe</p>
            </div>

            {/* Edit Profile Button */}
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(!isEditing)}
              className="mb-2"
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
