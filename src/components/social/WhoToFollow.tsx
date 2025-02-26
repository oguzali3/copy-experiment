
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

interface SuggestedUser {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  isFollowing: boolean;
  follows_you: boolean;
}

export const WhoToFollow = () => {
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const currentUser = useUser();

  const fetchSuggestedUsers = async () => {
    try {
      // Get users and their following status
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', currentUser?.id)
        .limit(3);

      if (usersError) throw usersError;

      if (!users) return;

      // Get following relationships
      const { data: followingData, error: followingError } = await supabase
        .from('user_followers')
        .select('following_id')
        .eq('follower_id', currentUser?.id);

      if (followingError) throw followingError;

      // Get users who follow the current user
      const { data: followersData, error: followersError } = await supabase
        .from('user_followers')
        .select('follower_id')
        .eq('following_id', currentUser?.id);

      if (followersError) throw followersError;

      // Create a set of IDs for easier lookup
      const followingSet = new Set(followingData?.map(f => f.following_id));
      const followersSet = new Set(followersData?.map(f => f.follower_id));

      const formattedUsers = users.map(user => ({
        id: user.id,
        username: user.username || '',
        full_name: user.full_name || '',
        avatar_url: user.avatar_url || '',
        isFollowing: followingSet.has(user.id),
        follows_you: followersSet.has(user.id)
      }));

      setSuggestedUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching suggested users:', error);
      toast.error("Failed to load suggested users");
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      const isFollowing = suggestedUsers.find(user => user.id === userId)?.isFollowing;

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('user_followers')
          .delete()
          .eq('follower_id', currentUser?.id)
          .eq('following_id', userId);

        if (error) throw error;
      } else {
        // Follow
        const { error } = await supabase
          .from('user_followers')
          .insert({
            follower_id: currentUser?.id,
            following_id: userId
          });

        if (error) throw error;
      }

      // Update local state
      setSuggestedUsers(prev =>
        prev.map(user =>
          user.id === userId
            ? { ...user, isFollowing: !user.isFollowing }
            : user
        )
      );

      toast.success(isFollowing ? "Unfollowed successfully" : "Followed successfully");
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast.error("Failed to update follow status");
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchSuggestedUsers();
    }
  }, [currentUser]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Who to follow</h2>
      <div className="space-y-4">
        {suggestedUsers.map((user) => (
          <div key={user.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1">
                  <p className="font-semibold">{user.full_name}</p>
                  <Check className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-sm text-gray-500">@{user.username}</p>
                {user.follows_you && (
                  <p className="text-xs text-gray-500">Follows you</p>
                )}
              </div>
            </div>
            <Button
              variant={user.isFollowing ? "outline" : "default"}
              className={`${user.isFollowing ? 'hover:bg-red-50 hover:text-red-600' : ''}`}
              onClick={() => handleFollow(user.id)}
            >
              {user.follows_you && !user.isFollowing ? "Follow back" : user.isFollowing ? "Following" : "Follow"}
            </Button>
          </div>
        ))}
      </div>
      <Button 
        variant="link" 
        className="text-blue-500 hover:text-blue-600 mt-4 w-full"
      >
        Show more
      </Button>
    </div>
  );
};
