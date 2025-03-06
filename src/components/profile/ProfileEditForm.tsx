// src/pages/profile/components/ProfileEditForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link as LinkIcon, Twitter, Linkedin } from "lucide-react";
import { ProfileData } from './types';

interface ProfileEditFormProps {
  profileData: ProfileData;
  onSubmit: (data: Partial<ProfileData>) => Promise<void>;
  onCancel: () => void;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  profileData,
  onSubmit,
  onCancel
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ProfileData>({
    defaultValues: {
      displayName: profileData.displayName || "",
      username: profileData.username || "",
      bio: profileData.bio || "",
      website: profileData.website || "",
      twitterHandle: profileData.twitterHandle || "",
      linkedinHandle: profileData.linkedinHandle || ""
    }
  });

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit({
      displayName: data.displayName,
      bio: data.bio,
      website: data.website,
      twitterHandle: data.twitterHandle,
      linkedinHandle: data.linkedinHandle
    });
  });

  return (
    <Card className="p-6">
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="displayName" className="text-sm font-medium">
              Display Name <span className="text-red-500">*</span>
            </label>
            <input 
              id="displayName" 
              {...register("displayName", { required: "Display name is required" })} 
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all ${errors.displayName ? 'border-red-500' : 'border-gray-300'}`} 
              placeholder="Your display name" 
              aria-invalid={errors.displayName ? "true" : "false"}
            />
            {errors.displayName && (
              <p className="text-red-500 text-xs mt-1">{errors.displayName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              @username
            </label>
            <input 
              id="username" 
              {...register("username", { 
                pattern: { 
                  value: /^[a-zA-Z0-9_]+$/, 
                  message: "Username can only contain letters, numbers, and underscores" 
                } 
              })} 
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="@username" 
              disabled={true}  // Username shouldn't be editable
              aria-invalid={errors.username ? "true" : "false"}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
            )}
            <p className="text-xs text-gray-500">Username cannot be changed</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium">
              Bio
            </label>
            <textarea 
              id="bio" 
              {...register("bio")} 
              className="w-full p-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all" 
              rows={4} 
              placeholder="Tell us about yourself..." 
            />
            <p className="text-xs text-gray-500">Write a short bio about yourself</p>
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
                  pattern: { 
                    // eslint-disable-next-line no-useless-escape
                    value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, 
                    message: "Please enter a valid URL" 
                  } 
                })} 
                className={`flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all ${errors.website ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="https://your-website.com" 
                aria-invalid={errors.website ? "true" : "false"}
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
                    message: "Please enter a valid Twitter handle without the @ symbol" 
                  } 
                })} 
                className={`flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all ${errors.twitterHandle ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="twitter_handle" 
                aria-invalid={errors.twitterHandle ? "true" : "false"}
              />
            </div>
            {errors.twitterHandle && (
              <p className="text-red-500 text-xs mt-1">{errors.twitterHandle.message}</p>
            )}
            <p className="text-xs text-gray-500">Enter your Twitter handle without the @ symbol</p>
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
                className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all border-gray-300" 
                placeholder="username" 
                aria-invalid={errors.linkedinHandle ? "true" : "false"}
              />
            </div>
            <p className="text-xs text-gray-500">Enter just your LinkedIn username, not the full URL</p>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Card>
  );
};