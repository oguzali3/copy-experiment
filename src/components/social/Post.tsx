
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, User } from "lucide-react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PostProps {
  id: string;
  content: string;
  created_at: string;
  user: {
    full_name: string;
    avatar_url: string;
    username: string;
  };
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  onPostUpdated?: () => void;
}

export const Post = ({
  id,
  content,
  created_at,
  user,
  likes_count,
  comments_count,
  is_liked: initialIsLiked,
  onPostUpdated
}: PostProps) => {
  const currentUser = useUser();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(likes_count);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (!currentUser || isLiking) return;

    setIsLiking(true);
    try {
      if (!isLiked) {
        const { error } = await supabase
          .from('post_likes')
          .insert([{ post_id: id, user_id: currentUser.id }]);

        if (error) throw error;

        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      } else {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', id)
          .eq('user_id', currentUser.id);

        if (error) throw error;

        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      }
      onPostUpdated?.();
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error("Failed to update like");
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={user.avatar_url} />
          <AvatarFallback>
            <User className="w-6 h-6" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{user.full_name}</span>
            <span className="text-gray-500">@{user.username}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">
              {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="mt-2 text-gray-900">{content}</p>
          <div className="flex gap-6 mt-4">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleLike}
              disabled={!currentUser || isLiking}
            >
              <Heart 
                className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} 
              />
              <span>{likesCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{comments_count}</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
