// src/components/social/CreatePost.tsx
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { User, ImagePlus, X } from "lucide-react";
import { usePostsApi } from "@/hooks/usePostsApi";
import { useMutation } from "@apollo/client";
import { UPLOAD_IMAGE } from "@/lib/graphql/operations/upload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Define the input type to match your GraphQL schema
interface CreatePostVariables {
  input: {
    content: string;
    imageUrl?: string | null;
    imageVariants?: {
      original: string;
      thumbnail: string;
      medium: string;
      optimized: string;
    } | null;
  }
}

// Storage key for saving avatarUrl in localStorage
const AVATAR_STORAGE_KEY = 'user_avatar_url';

export const CreatePost = ({ onPostCreated }: { onPostCreated?: () => void }) => {
  const [content, setContent] = useState("");
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [savedAvatarUrl, setSavedAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use GraphQL hooks
  const { useCreatePost } = usePostsApi();
  const { createPost, loading: createPostLoading } = useCreatePost();
  
  // Image upload mutation
  const [uploadImage, { loading: uploadLoading }] = useMutation(UPLOAD_IMAGE);
  
  // Combined loading state
  const isSubmitting = createPostLoading || uploadLoading;
  
  // Load saved avatarUrl from localStorage on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem(AVATAR_STORAGE_KEY);
    if (savedUrl) {
      setSavedAvatarUrl(savedUrl);
    }
  }, []);

  // Save avatar URL to localStorage when the user logs in and has an avatarUrl
  useEffect(() => {
    if (user?.avatarUrl) {
      localStorage.setItem(AVATAR_STORAGE_KEY, user.avatarUrl);
      setSavedAvatarUrl(user.avatarUrl);
    }
  }, [user?.avatarUrl]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() || !user || isSubmitting) return;
  
    try {
      let imageUrl = null;
      let imageVariants = null;
  
      if (selectedImage) {
        // Convert file to base64 for GraphQL upload
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String);
          };
        });
        reader.readAsDataURL(selectedImage);
        
        const base64String = await base64Promise;
        
        // Upload image via GraphQL
        const { data } = await uploadImage({ 
          variables: { 
            image: {
              base64: base64String,
              filename: selectedImage.name,
              contentType: selectedImage.type
            }
          } 
        });
        
        imageUrl = data.uploadImage.url;
        
        // Capture variants
        if (data.uploadImage.variants) {
          imageVariants = {
            original: data.uploadImage.variants.original,
            thumbnail: data.uploadImage.variants.thumbnail,
            medium: data.uploadImage.variants.medium,
            optimized: data.uploadImage.variants.optimized,
          };
        }
      }
  
      // Create post with GraphQL mutation
      await createPost({ 
        variables: { 
          input: { 
            content: content.trim(), 
            imageUrl,
            imageVariants // Include the variants
          }
        } as CreatePostVariables
      });
  
      // Reset form
      setContent("");
      setSelectedImage(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Notify parent component
      onPostCreated?.();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error("Failed to create post");
    }
  };

  // Handle navigation to profile
  const handleUserClick = () => {
    window.location.href = '/profile';
  };

  // Use user.avatarUrl, savedAvatarUrl, or generate a color based on user ID
  const getUserColor = () => {
    if (!user?.id) return 'bg-gray-500';
    
    // Generate a deterministic color based on the user ID
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-pink-500', 'bg-yellow-500', 'bg-red-500', 
      'bg-indigo-500', 'bg-teal-500'
    ];
    
    // Simple hash function to get consistent color for same user ID
    let hash = 0;
    for (let i = 0; i < user.id.length; i++) {
      hash = user.id.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Get positive value and mod by number of colors
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Get user initial based on available data
  const getUserInitial = () => {
    if (user?.displayName && user.displayName.length > 0) {
      return user.displayName.charAt(0).toUpperCase();
    } else if (user?.email && user.email.length > 0) {
      return user.email.charAt(0).toUpperCase();
    }
    return <User className="w-5 h-5 text-white" />;
  };

  // Determine the avatar URL to use
  const getAvatarUrl = () => {
    if (user?.avatarUrl) {
      return user.avatarUrl;
    }
    
    if (savedAvatarUrl) {
      return savedAvatarUrl;
    }
    
    return null;
  };

  return (
    <Card className="p-4">
      <div className="flex gap-4">
        {/* Avatar with user's actual avatar URL or colored fallback */}
        <Avatar 
          className="w-10 h-10 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-500"
          onClick={handleUserClick}
        >
          <AvatarImage src={getAvatarUrl()} alt={user?.displayName || 'User'} />
          <AvatarFallback className={getUserColor()}>
            {getUserInitial()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mb-3 min-h-[100px] border-none resize-none focus-visible:ring-0"
          />
          
          {previewUrl && (
            <div className="relative mb-3">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-[300px] rounded-lg object-cover"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1 rounded-full bg-gray-900/50 hover:bg-gray-900/70 text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-500 hover:text-gray-700"
              >
                <ImagePlus className="h-5 w-5" />
              </Button>
            </div>
            <Button 
              onClick={handleSubmit} 
              disabled={!content.trim() || isSubmitting}
              className="rounded-full px-6 bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isSubmitting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};