
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
    <div className="max-w-4xl mx-auto space-y-6 px-4">
      <div className="relative h-48 bg-gradient-to-r from-purple-100 to-purple-50 rounded-lg">
        <div className="absolute -bottom-16 left-8 flex items-end space-x-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-white border-4 border-white overflow-hidden">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-purple-400" />
                </div>
              )}
            </div>
          </div>
          <div className="mb-4 flex-1">
            <h1 className="text-2xl font-bold">John Doe</h1>
            <p className="text-gray-600">@johndoe</p>
          </div>
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Edit Profile</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-20">
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
          <div className="space-y-6">
            <div className="prose max-w-none">
              <p className="text-gray-600">
                Investor and tech enthusiast. Sharing insights about market trends and investment opportunities.
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <LinkIcon className="w-4 h-4" />
                <a href="#" className="hover:text-purple-600">website.com</a>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Twitter className="w-4 h-4" />
                <a href="#" className="hover:text-purple-600">@twitter_handle</a>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Linkedin className="w-4 h-4" />
                <a href="#" className="hover:text-purple-600">LinkedIn</a>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="text-gray-600">
                No activity yet
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
