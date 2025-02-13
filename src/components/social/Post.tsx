
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, ThumbsUp, Share2 } from "lucide-react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface PostProps {
  id: string;
  content: string;
  created_at: string;
  user: {
    full_name: string;
    avatar_url: string;
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
  likes_count = 0, 
  comments_count = 0,
  is_liked = false,
  onPostUpdated 
}: PostProps) => {
  const currentUser = useUser();
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (!currentUser) {
      toast.error("Please sign in to like posts");
      return;
    }

    setIsLiking(true);
    try {
      if (is_liked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .match({ post_id: id, user_id: currentUser.id });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert([{ post_id: id, user_id: currentUser.id }]);

        if (error) throw error;
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
    <Card className="p-4 mb-4">
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10" src={user.avatar_url} />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{user.full_name}</h3>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <p className="mt-2 text-gray-800 dark:text-gray-200">{content}</p>
          <div className="mt-4 flex items-center gap-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`gap-2 ${is_liked ? 'text-blue-600' : ''}`}
              onClick={handleLike}
              disabled={isLiking}
            >
              <ThumbsUp className="w-4 h-4" />
              {likes_count > 0 && <span>{likes_count}</span>}
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              {comments_count > 0 && <span>{comments_count}</span>}
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
