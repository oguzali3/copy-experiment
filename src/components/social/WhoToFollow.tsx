// src/components/social/WhoToFollow.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserApi } from "@/hooks/useUserApi";
import { User as UserType } from "@/lib/graphql/types";
import { useNavigate } from "react-router-dom";

export const WhoToFollow = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Use GraphQL hooks
  const { useSuggestedUsers, useFollowUser } = useUserApi();
  const { toggleFollow } = useFollowUser();
  
  // Get suggested users via GraphQL
  const { data, loading, refetch } = useSuggestedUsers(3);
  const suggestedUsers = data?.getSuggestedUsers || [];

  const handleFollow = async (userId: string, isFollowing: boolean) => {
    if (!user) {
      navigate('/signin');
      return;
    }
    
    try {
      // Use GraphQL mutation hook
      await toggleFollow(userId, isFollowing);
      // Refetch suggested users after toggling follow
      refetch();
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  };

  const handleProfileClick = (userId: string) => {
    navigate(`/profile?id=${userId}`);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4">Who to follow</h2>
        <div className="p-4 text-center text-gray-500">Loading suggestions...</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Who to follow</h2>
      <div className="space-y-4">
        {suggestedUsers.length > 0 ? (
          suggestedUsers.map((suggestedUser: UserType) => (
            <div key={suggestedUser.id} className="flex items-center justify-between">
              <div 
                className="flex items-center gap-3 cursor-pointer" 
                onClick={() => handleProfileClick(suggestedUser.id)}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={suggestedUser.avatarUrl || undefined} />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="font-semibold">{suggestedUser.displayName}</p>
                    {suggestedUser.isVerified && (
                      <Check className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">@{suggestedUser.displayName}</p>
                </div>
              </div>
              <Button
                variant={suggestedUser.isFollowing ? "outline" : "default"}
                className={`${suggestedUser.isFollowing ? 'hover:bg-red-50 hover:text-red-600' : ''}`}
                onClick={() => handleFollow(suggestedUser.id, !!suggestedUser.isFollowing)}
              >
                {suggestedUser.isFollowing ? "Following" : "Follow"}
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center py-2 text-gray-500">
            No suggestions available
          </div>
        )}
      </div>
      <Button 
        variant="link" 
        className="text-blue-500 hover:text-blue-600 mt-4 w-full"
        onClick={() => refetch()}
      >
        Refresh suggestions
      </Button>
    </div>
  );
};